"""Razorpay payment orchestration for bookings.

Bridges the slotting engine (services.py) and the Razorpay client
(razorpay_gw.py): creates deposit/balance Payment Links, and applies payment
outcomes idempotently from either the signed webhook or a status-check
reconciliation.

Deposit success → services.confirm_booking() (seat confirmed, departure may
guarantee). Balance success → payment_status = fully_paid.
"""
import logging
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from . import notifications, razorpay_gw as gw, services
from .models import Booking, Payment

logger = logging.getLogger(__name__)

# Keep the seat held a little longer than the standard hold while the traveller
# is on the Razorpay page, so it doesn't expire mid-payment.
PAYMENT_WINDOW_MINUTES = 20

# Normalised terminal states we feed into _apply_state.
STATE_COMPLETED = "COMPLETED"
STATE_FAILED = "FAILED"


def _merchant_order_id(prefix, booking):
    return f"{prefix}-{booking.id}-{uuid.uuid4().hex[:10]}"


class PaymentNotAllowed(Exception):
    """The booking isn't in a state where this payment kind is valid."""


def initiate_payment(booking, kind):
    """Create a Razorpay Payment Link for a booking's deposit or balance.

    Returns the Payment row (with redirect_url = the link's short_url). Raises
    PaymentNotAllowed if the booking isn't in the right state, or
    razorpay_gw.GatewayError on a gateway failure.
    """
    if kind == Payment.KIND_DEPOSIT:
        if booking.status != Booking.STATUS_ACCEPTED or booking.departure_id is None:
            raise PaymentNotAllowed("Accept the slot before paying the deposit.")
        if booking.payment_status != Booking.PAYMENT_UNPAID:
            raise PaymentNotAllowed("Deposit already paid.")
        amount_inr = booking.deposit_amount
        # Extend the accept window so it survives the checkout round-trip.
        booking.hold_expires_at = timezone.now() + timedelta(minutes=PAYMENT_WINDOW_MINUTES)
        booking.save(update_fields=["hold_expires_at", "updated_at"])
    elif kind == Payment.KIND_BALANCE:
        if booking.payment_status != Booking.PAYMENT_DEPOSIT_PAID:
            raise PaymentNotAllowed("Balance is only payable after the deposit.")
        amount_inr = booking.balance_amount
    else:
        raise PaymentNotAllowed(f"Unsupported payment kind: {kind}")

    if amount_inr <= 0:
        raise PaymentNotAllowed("Nothing to pay.")

    moid = _merchant_order_id(kind[:3].upper(), booking)
    amount_paise = amount_inr * 100
    payment = Payment.objects.create(
        booking=booking,
        kind=kind,
        merchant_order_id=moid,
        amount=amount_paise,
        status=Payment.STATUS_CREATED,
    )

    result = gw.create_order(
        amount_paise=amount_paise,
        receipt=moid,
        notes={"booking_id": booking.id, "kind": kind},
    )

    payment.phonepe_order_id = result["id"]  # reused column: Razorpay order id
    payment.status = Payment.STATUS_PENDING
    payment.raw_response = result["raw"]
    payment.save(update_fields=["phonepe_order_id", "status", "raw_response", "updated_at"])
    return payment


def verify_and_apply(payment, order_id, payment_id, signature):
    """Verify a Checkout success signature and mark the payment paid. Returns
    True on a valid signature (booking confirmed), False otherwise."""
    if payment.phonepe_order_id != order_id:
        return False
    if not gw.verify_payment_signature(order_id, payment_id, signature):
        return False
    raw = dict(payment.raw_response or {})
    raw["razorpay_payment_id"] = payment_id
    _apply_state(payment, STATE_COMPLETED, raw=raw)
    return True


def _apply_state(payment, state, raw=None):
    """Idempotently apply a terminal state to a payment + its booking."""
    with transaction.atomic():
        payment = Payment.objects.select_for_update().get(pk=payment.pk)
        if raw is not None:
            payment.raw_response = raw

        if payment.status == Payment.STATUS_SUCCESS:
            payment.save(update_fields=["raw_response", "updated_at"])
            return payment  # already applied — idempotent no-op

        if state == STATE_COMPLETED:
            payment.status = Payment.STATUS_SUCCESS
            payment.save(update_fields=["status", "raw_response", "updated_at"])
            _on_success(payment)
        elif state == STATE_FAILED:
            payment.status = Payment.STATUS_FAILED
            payment.save(update_fields=["status", "raw_response", "updated_at"])
        else:
            # still pending — record payload, leave status as-is
            payment.save(update_fields=["raw_response", "updated_at"])
    return payment


def _on_success(payment):
    booking = payment.booking
    if payment.kind == Payment.KIND_DEPOSIT:
        try:
            services.confirm_booking(booking)
        except ValueError:
            # Seat hold lapsed before the deposit landed — money taken but no
            # held seat. Flag for ops.
            logger.warning(
                "Deposit paid but booking %s not holdable (status=%s) — needs manual re-slot.",
                booking.id, booking.status,
            )
        booking.refresh_from_db()
        notifications.notify_booking_confirmed(booking)
    elif payment.kind == Payment.KIND_BALANCE:
        booking.payment_status = Booking.PAYMENT_FULLY_PAID
        booking.save(update_fields=["payment_status", "updated_at"])
        notifications.notify_booking_confirmed(booking, fully_paid=True)


def handle_webhook(event, body):
    """Process a Razorpay webhook (payment.captured / order.paid / payment.failed).
    Idempotent. Returns the Payment or None."""
    payload = (body or {}).get("payload") or {}
    pay_entity = (payload.get("payment") or {}).get("entity") or {}
    order_entity = (payload.get("order") or {}).get("entity") or {}
    order_id = pay_entity.get("order_id") or order_entity.get("id")
    if not order_id:
        logger.warning("Razorpay webhook %s missing order id", event)
        return None
    payment = Payment.objects.filter(phonepe_order_id=order_id).first()
    if payment is None:
        logger.warning("Razorpay webhook for unknown order=%s", order_id)
        return None

    if event in ("payment.captured", "order.paid") or pay_entity.get("status") == "captured":
        state = STATE_COMPLETED
    elif event == "payment.failed":
        state = STATE_FAILED
    else:
        state = ""
    return _apply_state(payment, state, raw=body)


def reconcile_payment(payment):
    """Pull authoritative status from Razorpay and apply it (fallback for missed
    webhooks). Returns the refreshed Payment."""
    result = gw.fetch_order(payment.phonepe_order_id)
    state = STATE_COMPLETED if (result.get("status") or "").lower() == "paid" else ""
    return _apply_state(payment, state, raw=result["raw"])


def _captured_payment_id(payment):
    """Get the Razorpay payment id (pay_...) for a paid payment — from the stored
    signature-verify field, the webhook body, or a live lookup."""
    raw = payment.raw_response or {}
    if raw.get("razorpay_payment_id"):
        return raw["razorpay_payment_id"]
    entity = ((raw.get("payload") or {}).get("payment") or {}).get("entity") or {}
    if entity.get("id"):
        return entity["id"]
    try:
        return gw.captured_payment_id(payment.phonepe_order_id)
    except gw.GatewayError:
        return None


def refund_deposit(booking):
    """Refund a booking's paid deposit via Razorpay and record a refund Payment.

    Used when a departure is cancelled for not reaching the minimum. Returns the
    refund Payment, or None if there's no successful deposit to refund.
    """
    if not gw.is_configured():
        raise gw.GatewayError("Cannot refund — gateway not configured.")
    dep_pay = booking.payments.filter(
        kind=Payment.KIND_DEPOSIT, status=Payment.STATUS_SUCCESS
    ).first()
    if dep_pay is None:
        return None

    pay_id = _captured_payment_id(dep_pay)
    if not pay_id:
        logger.warning("Deposit %s has no captured payment id — refund needs manual handling.", dep_pay.id)
        return None

    refund_moid = f"REF-{booking.id}-{uuid.uuid4().hex[:10]}"
    result = gw.refund(pay_id, dep_pay.amount)
    refund = Payment.objects.create(
        booking=booking,
        kind=Payment.KIND_REFUND,
        merchant_order_id=refund_moid,
        phonepe_order_id=result.get("id", ""),
        amount=dep_pay.amount,
        status=Payment.STATUS_SUCCESS if (result.get("status") or "").lower() in ("processed", "completed")
        else Payment.STATUS_PENDING,
        raw_response=result["raw"],
    )
    booking.payment_status = Booking.PAYMENT_REFUNDED
    booking.save(update_fields=["payment_status", "updated_at"])
    return refund
