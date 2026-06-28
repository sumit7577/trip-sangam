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

from . import razorpay_gw as gw, services
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

    callback_url = f"{settings.PAYMENT_REDIRECT_BASE}/{booking.id}"
    result = gw.create_payment_link(
        reference_id=moid,
        amount_paise=amount_paise,
        callback_url=callback_url,
        customer={
            "name": booking.lead_name or "",
            "email": booking.lead_email or "",
            "contact": booking.lead_phone or "",
        },
        description=f"{kind.title()} · {booking.package.title}"[:255] if booking.package_id else kind.title(),
        notes={"booking_id": booking.id, "kind": kind},
    )

    payment.phonepe_order_id = result["id"]  # reused column: Razorpay payment-link id
    payment.redirect_url = result["short_url"]
    payment.status = Payment.STATUS_PENDING
    payment.raw_response = result["raw"]
    payment.save(update_fields=["phonepe_order_id", "redirect_url", "status", "raw_response", "updated_at"])
    return payment


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
    elif payment.kind == Payment.KIND_BALANCE:
        booking.payment_status = Booking.PAYMENT_FULLY_PAID
        booking.save(update_fields=["payment_status", "updated_at"])


def _normalise(status_str, event=""):
    s = (status_str or "").lower()
    if s == "paid" or event == "payment_link.paid":
        return STATE_COMPLETED
    if s in ("cancelled", "expired"):
        return STATE_FAILED
    return ""  # still pending


def handle_webhook(event, body):
    """Process a Razorpay webhook body. Idempotent. Returns the Payment or None."""
    payload = (body or {}).get("payload") or {}
    link = (payload.get("payment_link") or {}).get("entity") or {}
    reference_id = link.get("reference_id")
    if not reference_id:
        logger.warning("Razorpay webhook %s missing payment_link.reference_id", event)
        return None
    payment = Payment.objects.filter(merchant_order_id=reference_id).first()
    if payment is None:
        logger.warning("Razorpay webhook for unknown reference_id=%s", reference_id)
        return None
    return _apply_state(payment, _normalise(link.get("status"), event), raw=body)


def reconcile_payment(payment):
    """Pull authoritative status from Razorpay and apply it (fallback for missed
    webhooks). Returns the refreshed Payment."""
    result = gw.fetch_payment_link(payment.phonepe_order_id)
    return _apply_state(payment, _normalise(result.get("status")), raw=result["raw"])


def _captured_payment_id(payment):
    """Extract the Razorpay payment id (pay_...) from a paid payment's webhook body."""
    raw = payment.raw_response or {}
    entity = ((raw.get("payload") or {}).get("payment") or {}).get("entity") or {}
    return entity.get("id")


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
