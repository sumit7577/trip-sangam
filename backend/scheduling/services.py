"""Slot booking engine: best-fit assignment, holds, and lifecycle transitions.

All capacity mutations go through here inside a single DB transaction with
``select_for_update`` on the affected Departure row, so two concurrent
bookings can never both claim the last seat. (On SQLite ``select_for_update``
is a no-op, but writes are serialised so it stays correct; on Postgres it
takes a real row lock — see docs/slot-booking-design.md §6.)
"""
import logging
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import F, Q
from django.utils import timezone

from .models import Booking, Departure

logger = logging.getLogger(__name__)

HOLD_TTL_MINUTES = 15          # how long a seat is held during checkout
FLEX_TOLERANCE_DAYS = 3        # ± window when a party is date-flexible
MIN_LEAD_DAYS = 7             # earliest a seeded (no-cadence) date can be
_MAX_FORWARD_DATES = 16        # bound the forward scan when seeding dates
_ASSIGN_RETRIES = 3            # retries on the unique-constraint race


class PartyTooLarge(Exception):
    """Party exceeds a single slot's max capacity — needs a private departure."""


class NoCapacity(Exception):
    """No slot could be found or opened — caller should waitlist."""


# ---------------------------------------------------------------------------
# Package config helpers
# ---------------------------------------------------------------------------

def _parse_weekdays(raw):
    out = set()
    for part in (raw or "").split(","):
        part = part.strip()
        if part.isdigit() and 0 <= int(part) <= 6:
            out.add(int(part))
    return out


def scheduled_dates(package, from_date, weeks_ahead=None, limit=None):
    """Upcoming calendar dates a package runs on, per its weekday cadence.

    Empty if the package has no cadence configured (slots are then seeded
    on demand from the traveller's preferred date).
    """
    weekdays = _parse_weekdays(package.departure_weekdays)
    if not weekdays:
        return []
    weeks_ahead = weeks_ahead or package.schedule_weeks_ahead or 12
    horizon = from_date + timedelta(weeks=weeks_ahead)
    dates, day = [], from_date
    while day <= horizon:
        if day.weekday() in weekdays:
            dates.append(day)
            if limit and len(dates) >= limit:
                break
        day += timedelta(days=1)
    return dates


def _next_seed_date(package, from_date):
    """Pick a date to open a brand-new departure on when none exist yet."""
    upcoming = scheduled_dates(package, from_date, limit=1)
    if upcoming:
        return upcoming[0]
    return from_date + timedelta(days=MIN_LEAD_DAYS)


def _new_departure(package, start_date):
    duration = package.duration_days or 1
    return Departure(
        package=package,
        start_date=start_date,
        end_date=start_date + timedelta(days=duration - 1),
        min_capacity=package.min_group or 6,
        max_capacity=package.max_group or 18,
        cutoff_date=start_date - timedelta(days=package.cutoff_days or 0),
        price_inr=package.price_inr,
        auto_created=True,
        status=Departure.STATUS_FORMING,
    )


def ensure_calendar(package, today=None):
    """Pre-create empty group-A departures for the package's cadence window.

    Idempotent: only creates dates that don't already have a departure.
    Returns the number created.
    """
    today = today or timezone.localdate()
    created = 0
    for d in scheduled_dates(package, today):
        if not Departure.objects.filter(package=package, start_date=d).exists():
            try:
                _new_departure(package, d).save()
                created += 1
            except IntegrityError:
                pass
    return created


# ---------------------------------------------------------------------------
# Best-fit assignment
# ---------------------------------------------------------------------------

def _fitting_candidates(package, party_size, today, date_lo=None, date_hi=None):
    """Open departures that can fit `party_size`, ordered best-fit.

    Best-fit = soonest date first, then the *fullest* group that still fits
    (smallest remaining capacity) so slots reach the guarantee fastest.
    """
    qs = (
        Departure.objects.select_for_update()
        .filter(package=package, status__in=Departure.OPEN_STATUSES)
        .filter(start_date__gte=today)
        .filter(Q(cutoff_date__isnull=True) | Q(cutoff_date__gte=today))
        .annotate(remaining=F("max_capacity") - F("seats_confirmed") - F("seats_held"))
        .filter(remaining__gte=party_size)
    )
    if date_lo is not None:
        qs = qs.filter(start_date__gte=date_lo)
    if date_hi is not None:
        qs = qs.filter(start_date__lte=date_hi)
    return qs.order_by("start_date", "remaining")


def _open_group_on_date(package, start_date):
    """Open the next parallel group (A, B, …) on a date, or None if at cap."""
    used = Departure.objects.filter(package=package, start_date=start_date).count()
    if used >= (package.max_groups_per_date or 1):
        return None
    dep = _new_departure(package, start_date)
    dep.group_label = chr(ord("A") + used)
    dep.save()
    return dep


def assign_departure(package, party_size, preferred_date=None, flexible=False):
    """Return a Departure that can hold `party_size`, creating one if needed.

    Must be called inside a transaction. Raises NoCapacity if nothing fits and
    nothing can be opened.
    """
    today = timezone.localdate()

    # Determine the search window.
    if preferred_date and preferred_date >= today:
        if flexible:
            lo = max(today, preferred_date - timedelta(days=FLEX_TOLERANCE_DAYS))
            hi = preferred_date + timedelta(days=FLEX_TOLERANCE_DAYS)
        else:
            lo = hi = preferred_date
    else:
        lo = hi = None  # any upcoming date

    # 1. Best-fit into an existing open group.
    candidate = _fitting_candidates(package, party_size, today, lo, hi).first()
    if candidate is not None:
        return candidate

    # 2. Open a new group / seed a new date.
    if preferred_date and preferred_date >= today:
        dep = _open_group_on_date(package, preferred_date)
        if dep is not None:
            return dep
        if not flexible:
            raise NoCapacity("Preferred date is full.")
        # flexible: fall through to scan nearby/forward dates

    # No usable preferred date (or it was saturated + flexible): scan forward.
    seed = _next_seed_date(package, today if lo is None else lo)
    for _ in range(_MAX_FORWARD_DATES):
        dep = _open_group_on_date(package, seed)
        if dep is not None:
            return dep
        nxt = scheduled_dates(package, seed + timedelta(days=1), limit=1)
        seed = nxt[0] if nxt else seed + timedelta(days=1)
    raise NoCapacity("No date with available capacity.")


# ---------------------------------------------------------------------------
# Booking lifecycle
# ---------------------------------------------------------------------------

def quote(package, party_size, departure=None):
    price = (departure.effective_price_inr if departure else package.price_inr) or 0
    total = price * party_size
    deposit = round(total * (package.deposit_pct or 0) / 100)
    return {"total": total, "deposit": deposit, "balance": total - deposit}


ACCEPT_TTL_MINUTES = 30  # accepted-but-unpaid reverts to pending after this


def create_booking(
    *,
    package,
    party_size,
    lead_name,
    lead_email,
    lead_phone="",
    preferred_date=None,
    flexible=False,
    departure_id=None,
    user=None,
):
    """Soft-book: reserve a seat in a slot as 'pending' interest (no payment).

    The traveller later accepts the slot (see ``accept_booking``) and pays a
    deposit to confirm. Returns the Booking; if no slot can be found/opened it
    is saved 'waitlisted' with no departure. Raises PartyTooLarge if the party
    can't fit any single slot.
    """
    if party_size < 1:
        raise ValueError("party_size must be >= 1")
    if party_size > (package.max_group or 18):
        raise PartyTooLarge(party_size)

    last_err = None
    for _ in range(_ASSIGN_RETRIES):
        try:
            with transaction.atomic():
                dep = None
                if departure_id is not None:
                    dep = (
                        Departure.objects.select_for_update()
                        .filter(pk=departure_id)
                        .first()
                    )
                    if dep is not None and not (
                        dep.is_bookable and dep.seats_left >= party_size
                    ):
                        dep = None  # fall back to auto-assign by demand
                if dep is None:
                    try:
                        dep = assign_departure(package, party_size, preferred_date, flexible)
                    except NoCapacity:
                        dep = None

                amounts = quote(package, party_size, dep)
                if dep is None:
                    return Booking.objects.create(
                        package=package,
                        user=user,
                        lead_name=lead_name,
                        lead_email=lead_email,
                        lead_phone=lead_phone,
                        party_size=party_size,
                        preferred_start_date=preferred_date,
                        date_flexible=flexible,
                        status=Booking.STATUS_WAITLISTED,
                        total_amount=amounts["total"],
                        deposit_amount=amounts["deposit"],
                        balance_amount=amounts["balance"],
                    )

                dep.seats_held = F("seats_held") + party_size
                dep.save(update_fields=["seats_held", "updated_at"])
                dep.refresh_from_db()
                _recompute(dep)

                booking = Booking.objects.create(
                    package=package,
                    departure=dep,
                    user=user,
                    lead_name=lead_name,
                    lead_email=lead_email,
                    lead_phone=lead_phone,
                    party_size=party_size,
                    preferred_start_date=preferred_date,
                    date_flexible=flexible,
                    status=Booking.STATUS_PENDING,
                    total_amount=amounts["total"],
                    deposit_amount=amounts["deposit"],
                    balance_amount=amounts["balance"],
                )

                def _on_created(b=booking):
                    from . import notifications
                    notifications.notify_booking_created(b)

                transaction.on_commit(_on_created)
                return booking
        except IntegrityError as exc:  # group-label race on Postgres — retry
            last_err = exc
            continue
    raise last_err  # pragma: no cover


def _release_seats(dep, status, party_size):
    """Decrement the right counter for a booking leaving a slot."""
    if status in Booking.RESERVING_STATUSES:
        dep.seats_held = max(0, dep.seats_held - party_size)
    elif status == Booking.STATUS_CONFIRMED:
        dep.seats_confirmed = max(0, dep.seats_confirmed - party_size)


def accept_booking(booking):
    """Traveller accepts their slot — moves pending → accepted and starts the
    deposit window. The caller then initiates the PhonePe deposit. Idempotent.
    """
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.status in (Booking.STATUS_ACCEPTED, Booking.STATUS_CONFIRMED):
            return booking
        if booking.status != Booking.STATUS_PENDING or booking.departure_id is None:
            raise ValueError("Only pending bookings in a slot can be accepted.")
        booking.status = Booking.STATUS_ACCEPTED
        booking.hold_expires_at = timezone.now() + timedelta(minutes=ACCEPT_TTL_MINUTES)
        booking.save(update_fields=["status", "hold_expires_at", "updated_at"])
    return booking


def decline_booking(booking):
    """Traveller declines/leaves the slot before paying — releases the seat."""
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.status not in (Booking.STATUS_PENDING, Booking.STATUS_ACCEPTED):
            raise ValueError("Only un-paid bookings can be declined.")
        dep = None
        if booking.departure_id is not None:
            dep = Departure.objects.select_for_update().get(pk=booking.departure_id)
            _release_seats(dep, booking.status, booking.party_size)
            dep.save(update_fields=["seats_held", "seats_confirmed", "updated_at"])
        booking.status = Booking.STATUS_DECLINED
        booking.save(update_fields=["status", "updated_at"])
        if dep is not None:
            _recompute(dep)
    return booking


def confirm_booking(booking):
    """Mark an accepted booking confirmed (deposit received). Moves the party
    from held → confirmed and guarantees the departure if it crosses the minimum.

    Driven by the PhonePe webhook (Phase 2) or the admin "Mark deposit received"
    action. Idempotent.
    """
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.status == Booking.STATUS_CONFIRMED:
            return booking
        if booking.status not in (Booking.STATUS_ACCEPTED, Booking.STATUS_HELD, Booking.STATUS_PENDING) \
                or booking.departure_id is None:
            raise ValueError("Only an accepted booking with a seat can be confirmed.")

        dep = Departure.objects.select_for_update().get(pk=booking.departure_id)
        dep.seats_held = max(0, dep.seats_held - booking.party_size)
        dep.seats_confirmed = dep.seats_confirmed + booking.party_size
        dep.save(update_fields=["seats_held", "seats_confirmed", "updated_at"])

        booking.status = Booking.STATUS_CONFIRMED
        booking.payment_status = Booking.PAYMENT_DEPOSIT_PAID
        booking.hold_expires_at = None
        booking.save(update_fields=["status", "payment_status", "hold_expires_at", "updated_at"])

        _recompute(dep)
    return booking


def cancel_booking(booking):
    """Release a booking's seats and mark it cancelled (admin / refund path)."""
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.status in (Booking.STATUS_CANCELLED, Booking.STATUS_EXPIRED,
                              Booking.STATUS_DECLINED):
            return booking
        dep = None
        if booking.departure_id is not None:
            dep = Departure.objects.select_for_update().get(pk=booking.departure_id)
            _release_seats(dep, booking.status, booking.party_size)
            dep.save(update_fields=["seats_held", "seats_confirmed", "updated_at"])
        booking.status = Booking.STATUS_CANCELLED
        booking.save(update_fields=["status", "updated_at"])
        if dep is not None:
            _recompute(dep)
    return booking


def expire_holds(now=None):
    """Revert accepted-but-unpaid bookings back to pending once their deposit
    window lapses (the seat stays reserved as interest). Returns count."""
    now = now or timezone.now()
    reverted = 0
    stale = Booking.objects.filter(
        status=Booking.STATUS_ACCEPTED, hold_expires_at__lt=now
    ).values_list("pk", flat=True)
    for pk in list(stale):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=pk)
            if booking.status != Booking.STATUS_ACCEPTED:
                continue
            booking.status = Booking.STATUS_PENDING
            booking.hold_expires_at = None
            booking.save(update_fields=["status", "hold_expires_at", "updated_at"])
            reverted += 1
    return reverted


def sweep_cutoff(today=None):
    """At each departure's cut-off: lock guaranteed groups (they run) and cancel
    under-min groups (refund + notify). Returns {locked, cancelled}.
    """
    today = today or timezone.localdate()
    locked = cancelled = 0
    due = Departure.objects.filter(
        status__in=Departure.OPEN_STATUSES, cutoff_date__lt=today
    )
    for dep in list(due):
        if dep.seats_confirmed >= dep.min_capacity:
            dep.status = Departure.STATUS_LOCKED
            dep.save(update_fields=["status", "updated_at"])
            locked += 1
        else:
            _cancel_departure(dep)
            cancelled += 1
    return {"locked": locked, "cancelled": cancelled}


def _cancel_departure(dep):
    """Cancel a departure that failed to reach minimum: cancel its bookings,
    refund any paid deposits (best effort), notify travellers."""
    from . import notifications, payments  # local import avoids cycle

    affected = list(dep.bookings.filter(status__in=Booking.IN_SLOT_STATUSES))
    for b in affected:
        was_confirmed = b.status == Booking.STATUS_CONFIRMED
        cancel_booking(b)
        if was_confirmed:
            try:
                payments.refund_deposit(b)
            except Exception:
                logger.exception("Refund failed for booking %s — refund manually", b.id)
        try:
            notifications.notify_departure_cancelled(b)
        except Exception:
            logger.exception("Cancel notice failed for booking %s", b.id)

    dep.status = Departure.STATUS_CANCELLED
    dep.save(update_fields=["status", "updated_at"])


def send_balance_reminders(days_before=7, today=None, now=None):
    """Remind confirmed travellers whose balance is due as the trip approaches.
    Dedupes via balance_reminded_at so it can run daily. Returns count."""
    from . import notifications

    today = today or timezone.localdate()
    now = now or timezone.now()
    window_end = today + timedelta(days=days_before)
    qs = Booking.objects.filter(
        status=Booking.STATUS_CONFIRMED,
        payment_status=Booking.PAYMENT_DEPOSIT_PAID,
        balance_amount__gt=0,
        balance_reminded_at__isnull=True,
        departure__start_date__lte=window_end,
        departure__start_date__gte=today,
    )
    sent = 0
    for b in list(qs):
        notifications.notify_balance_due(b)
        b.balance_reminded_at = now
        b.save(update_fields=["balance_reminded_at", "updated_at"])
        sent += 1
    return sent


def _recompute(dep):
    """Re-derive a departure's status from its seat counters.

    Upgrades forming → guaranteed once min confirmed is reached (never
    downgrades a guarantee), and toggles full ↔ open as held/confirmed seats
    change. Never touches terminal (locked/departed/cancelled) departures.
    """
    if dep.status in Departure.TERMINAL_STATUSES:
        return

    fields = ["status", "updated_at"]
    newly_guaranteed = False

    if dep.seats_confirmed >= dep.min_capacity:
        base = Departure.STATUS_GUARANTEED
        if dep.guaranteed_at is None:
            dep.guaranteed_at = timezone.now()
            fields.append("guaranteed_at")
            newly_guaranteed = True
    elif dep.status == Departure.STATUS_GUARANTEED:
        base = Departure.STATUS_GUARANTEED  # promise already made; keep it
    else:
        base = Departure.STATUS_FORMING

    dep.status = Departure.STATUS_FULL if dep.seats_taken >= dep.max_capacity else base
    dep.save(update_fields=fields)

    if newly_guaranteed:
        notify_departure_guaranteed(dep)


def notify_departure_guaranteed(dep):
    logger.info(
        "Departure GUARANTEED: %s %s (%s) — %d confirmed",
        dep.package_id, dep.start_date, dep.group_label, dep.seats_confirmed,
    )
    from . import notifications  # local import avoids an import cycle
    notifications.notify_departure_guaranteed(dep)
