"""Booking notifications (email now; WhatsApp/SMS hooks for later).

Every send is best-effort and swallowed on failure — a notification problem must
never break a booking or payment flow. Wired from services.py and the background
sweep commands.
"""
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail

from .models import Booking
from .voucher import booking_ref, build_voucher_pdf

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


def notify_booking_confirmed(booking, fully_paid=False):
    """Sent right after a successful payment — deposit (seat locked) or final
    balance (fully paid). Branded HTML confirmation + a PDF voucher attachment,
    MakeMyTrip-style. Best-effort: never raises into the payment flow."""
    to_email = booking.lead_email
    if not to_email:
        return
    dep = booking.departure
    ref = booking_ref(booking)
    dates = (str(dep.start_date) + (f" – {dep.end_date}" if dep.end_date else "")) if dep else ""
    paid = booking.total_amount if fully_paid else booking.deposit_amount

    subject = (
        f"{'Payment complete' if fully_paid else 'Booking confirmed'} "
        f"— {booking.package.title} ({ref})"
    )
    text = (
        f"Hi {booking.lead_name},\n\n"
        f"{'Your payment is complete — everything is set for your journey.' if fully_paid else 'Your deposit is in and your seat is locked. 🎉'}\n\n"
        f"Booking reference: {ref}\n"
        f"Package: {booking.package.title}\n"
        + (f"Travel dates: {dates}\n" if dates else "")
        + f"Travellers: {booking.party_size}\n"
        f"Amount paid: ₹{paid:,}\n"
        + ("" if fully_paid else f"Balance of ₹{booking.balance_amount:,} is payable later.\n")
        + f"\nView your booking: {_trip_url(booking)}\n\n"
        "Your voucher is attached as a PDF.\n\n— Trip Sangam"
    )

    try:
        msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [to_email])
        msg.attach_alternative(_confirmed_html(booking, ref, dates, fully_paid, paid), "text/html")
        pdf = build_voucher_pdf(booking)
        if pdf:
            msg.attach(f"TripSangam-Voucher-{ref}.pdf", pdf, "application/pdf")
        msg.send(fail_silently=False)
    except Exception:
        logger.exception("Failed to send confirmation to %s (%s)", to_email, ref)

    send_whatsapp(
        booking.lead_phone,
        f"Trip Sangam: Booking {ref} {'fully paid' if fully_paid else 'confirmed'} for "
        f"{booking.package.title}" + (f" ({dates})" if dates else "")
        + f". Paid ₹{paid:,}. {_trip_url(booking)}",
    )


def _confirmed_html(booking, ref, dates, fully_paid, paid):
    dep = booking.departure

    def tr(label, value, strong=True):
        v = f"font-weight:600;color:#1C1C1A" if strong else "color:#1C1C1A"
        return (
            f'<tr><td style="padding:7px 0;color:#8a8a86;font-size:13px">{label}</td>'
            f'<td style="padding:7px 0;text-align:right;font-size:13px;{v}">{value}</td></tr>'
        )

    trip = tr("Package", booking.package.title)
    if dates:
        trip += tr("Travel dates", dates)
    if dep:
        trip += tr("Group", dep.group_label)
    trip += tr("Travellers", booking.party_size)

    pay = tr("Trip total", f"₹{booking.total_amount:,}", strong=False)
    pay += tr("Deposit paid", f"₹{booking.deposit_amount:,}", strong=False)
    if fully_paid:
        pay += tr("Balance paid", f"₹{booking.balance_amount:,}", strong=False)
    else:
        pay += tr("Balance (pay later)", f"₹{booking.balance_amount:,}", strong=False)

    headline = "Payment complete \U0001F389" if fully_paid else "Booking confirmed \U0001F389"
    sub = ("You're fully paid — everything's set for your journey."
           if fully_paid else "Your deposit is in and your seat is locked.")
    img = booking.package.hero_src if hasattr(booking.package, "hero_src") else ""
    hero = (f'<img src="{img}" alt="" width="100%" '
            f'style="display:block;max-height:180px;object-fit:cover;border-radius:14px 14px 0 0">' if img else "")

    return f"""\
<div style="margin:0;background:#F3EFE7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)">
    {hero}
    <div style="background:linear-gradient(135deg,#1C1C1A,#3a2a24);padding:22px 24px;color:#fff">
      <div style="font-family:Georgia,serif;font-size:20px;font-weight:600">Trip Sangam</div>
      <div style="color:#cebc9c;font-size:12px;letter-spacing:.04em">JOURNEY BEYOND BORDERS</div>
    </div>
    <div style="padding:26px 24px">
      <h1 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:#1C1C1A">{headline}</h1>
      <p style="margin:0 0 18px;color:#8a8a86;font-size:14px">Hi {booking.lead_name}, {sub}</p>

      <div style="display:inline-block;background:#EAF4EE;color:#1f7a4d;font-size:12px;font-weight:700;padding:6px 12px;border-radius:999px;margin-bottom:18px">
        Reference&nbsp;{ref}
      </div>

      <div style="background:#FAF8F3;border:1px solid #EDE7DA;border-radius:12px;padding:14px 16px;margin-bottom:14px">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a9a39a;margin-bottom:4px">Trip details</div>
        <table width="100%" cellpadding="0" cellspacing="0">{trip}</table>
      </div>

      <div style="background:#FAF8F3;border:1px solid #EDE7DA;border-radius:12px;padding:14px 16px">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a9a39a;margin-bottom:4px">Payment summary</div>
        <table width="100%" cellpadding="0" cellspacing="0">{pay}</table>
        <div style="border-top:1px dashed #DcD4c4;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between">
          <span style="font-weight:700;color:#1C1C1A;font-size:14px">Amount paid</span>
          <span style="font-weight:700;color:#1C1C1A;font-size:16px">₹{paid:,}</span>
        </div>
      </div>

      <a href="{_trip_url(booking)}" style="display:block;text-align:center;margin-top:20px;background:#1C1C1A;color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:600;font-size:14px">
        View your booking
      </a>
      <p style="margin:16px 0 0;color:#a9a39a;font-size:12px;text-align:center">
        Your voucher is attached as a PDF. Payments secured by Razorpay &middot; RBI-compliant.
      </p>
    </div>
  </div>
</div>"""


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
