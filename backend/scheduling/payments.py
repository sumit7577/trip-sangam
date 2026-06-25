"""PhonePe payment orchestration for bookings.

Bridges the slotting engine (services.py) and the PhonePe client (phonepe.py):
creates deposit/balance orders, and applies payment outcomes idempotently from
either the S2S webhook or a status-check reconciliation.

Deposit success → services.confirm_booking() (seat confirmed, departure may
guarantee). Balance success → payment_status = fully_paid.
"""
import logging
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from . import phonepe, services
from .models import Booking, Payment

logger = logging.getLogger(__name__)

# Keep the seat held a little longer than the standard hold while the traveller
# is on the PhonePe page, so it doesn't expire mid-payment.
PAYMENT_WINDOW_MINUTES = 20

# PhonePe terminal states (root-level payload.state).
STATE_COMPLETED = "COMPLETED"
STATE_FAILED = "FAILED"


def _merchant_order_id(prefix, booking):
    return f"{prefix}-{booking.id}-{uuid.uuid4().hex[:10]}"


class PaymentNotAllowed(Exception):
    """The booking isn't in a state where this payment kind is valid."""


def initiate_payment(booking, kind):
    """Create a PhonePe order for a booking's deposit or balance.

    Returns the Payment row (with redirect_url set). Raises PaymentNotAllowed
    if the booking isn't in the right state, or phonepe.PhonePeError on a
    gateway failure.
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

    redirect_url = f"{settings.PHONEPE_REDIRECT_BASE}/{booking.id}"
    result = phonepe.create_order(
        moid, amount_paise, redirect_url,
        meta={"udf1": str(booking.id), "udf2": kind},
    )

    payment.phonepe_order_id = result["orderId"]
    payment.redirect_url = result["redirectUrl"]
    payment.status = Payment.STATUS_PENDING
    payment.raw_response = result["raw"]
    payment.save(update_fields=["phonepe_order_id", "redirect_url", "status", "raw_response", "updated_at"])
    return payment


def _apply_state(payment, state, raw=None):
    """Idempotently apply a terminal PhonePe state to a payment + its booking."""
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
            # held seat. Flag for ops; Phase 3 adds auto re-slot / refund.
            logger.warning(
                "Deposit paid but booking %s not holdable (status=%s) — needs manual re-slot.",
                booking.id, booking.status,
            )
    elif payment.kind == Payment.KIND_BALANCE:
        booking.payment_status = Booking.PAYMENT_FULLY_PAID
        booking.save(update_fields=["payment_status", "updated_at"])


def handle_webhook(event, payload):
    """Process a PhonePe S2S callback. Idempotent. Returns the Payment or None."""
    moid = (payload or {}).get("merchantOrderId")
    if not moid:
        logger.warning("PhonePe webhook %s missing merchantOrderId", event)
        return None
    payment = Payment.objects.filter(merchant_order_id=moid).first()
    if payment is None:
        logger.warning("PhonePe webhook for unknown merchantOrderId=%s", moid)
        return None
    state = (payload.get("state") or "").upper()
    return _apply_state(payment, state, raw=payload)


def reconcile_payment(payment):
    """Pull authoritative status from PhonePe and apply it (fallback for missed
    webhooks). Returns the refreshed Payment."""
    result = phonepe.order_status(payment.merchant_order_id)
    return _apply_state(payment, (result["state"] or "").upper(), raw=result["raw"])


def refund_deposit(booking):
    """Refund a booking's paid deposit via PhonePe and record a refund Payment.

    Used when a departure is cancelled for not reaching the minimum. Returns the
    refund Payment, or None if there's no successful deposit to refund.
    """
    if not phonepe.is_configured():
        raise phonepe.PhonePeError("Cannot refund — gateway not configured.")
    dep_pay = booking.payments.filter(
        kind=Payment.KIND_DEPOSIT, status=Payment.STATUS_SUCCESS
    ).first()
    if dep_pay is None:
        return None

    refund_moid = f"REF-{booking.id}-{uuid.uuid4().hex[:10]}"
    result = phonepe.refund(refund_moid, dep_pay.merchant_order_id, dep_pay.amount)
    refund = Payment.objects.create(
        booking=booking,
        kind=Payment.KIND_REFUND,
        merchant_order_id=refund_moid,
        amount=dep_pay.amount,
        status=Payment.STATUS_SUCCESS if (result["state"] or "").upper() in ("COMPLETED", "CONFIRMED")
        else Payment.STATUS_PENDING,
        raw_response=result["raw"],
    )
    booking.payment_status = Booking.PAYMENT_REFUNDED
    booking.save(update_fields=["payment_status", "updated_at"])
    return refund
