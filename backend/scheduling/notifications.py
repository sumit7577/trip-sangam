"""Booking notifications (email now; WhatsApp/SMS hooks for later).

Every send is best-effort and swallowed on failure — a notification problem must
never break a booking or payment flow. Wired from services.py and the background
sweep commands.
"""
import logging

from django.conf import settings
from django.core.mail import send_mail

from .models import Booking

logger = logging.getLogger(__name__)


def _send(to_email, subject, body):
    if not to_email:
        return
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False)
    except Exception:
        logger.exception("Failed to email %s (%s)", to_email, subject)


def send_whatsapp(phone, message):
    """Stub — wire to the WhatsApp Business API / configured number in a later pass."""
    if phone:
        logger.info("WhatsApp → %s: %s", phone, message)


def _trip_url(booking):
    return f"{settings.SITE_PUBLIC_URL}/trips/{booking.id}"


def notify_booking_created(booking):
    when = booking.departure.start_date if booking.departure_id else "your preferred dates"
    _send(
        booking.lead_email,
        f"You're in a forming group — {booking.package.title}",
        f"Hi {booking.lead_name},\n\n"
        f"We've added your party of {booking.party_size} to a forming group for "
        f"{booking.package.title} ({when}).\n\n"
        f"You'll be notified as the group fills. Track it here: {_trip_url(booking)}\n\n"
        f"— Trip Sangam",
    )


def notify_departure_guaranteed(departure):
    """Tell every confirmed traveller the departure is now guaranteed."""
    for b in departure.bookings.filter(status=Booking.STATUS_CONFIRMED):
        _send(
            b.lead_email,
            f"Confirmed! Your {departure.package.title} departure is guaranteed 🎉",
            f"Hi {b.lead_name},\n\n"
            f"Great news — your group for {departure.package.title} on "
            f"{departure.start_date} has reached the minimum and is now GUARANTEED to run.\n\n"
            f"Details: {_trip_url(b)}\n\n— Trip Sangam",
        )
        send_whatsapp(b.lead_phone, f"Your {departure.package.title} trip on {departure.start_date} is confirmed!")


def notify_balance_due(booking):
    _send(
        booking.lead_email,
        f"Balance due — {booking.package.title}",
        f"Hi {booking.lead_name},\n\n"
        f"Your departure for {booking.package.title} is approaching. The remaining balance of "
        f"₹{booking.balance_amount:,} is now due.\n\n"
        f"Pay here: {_trip_url(booking)}\n\n— Trip Sangam",
    )


def notify_departure_cancelled(booking):
    _send(
        booking.lead_email,
        f"Update on your {booking.package.title} booking",
        f"Hi {booking.lead_name},\n\n"
        f"Unfortunately the group for {booking.package.title} "
        f"{('on ' + str(booking.departure.start_date)) if booking.departure_id else ''} "
        f"did not reach the minimum number of travellers by the cut-off, so it won't run.\n\n"
        f"If you paid a deposit, a refund is being processed. Please reply to rebook on another "
        f"date — we'd love to get you on the trail.\n\n— Trip Sangam",
    )
