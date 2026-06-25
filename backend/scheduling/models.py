"""Slot booking / auto-grouping data model.

See docs/slot-booking-design.md for the full design. The booking *logic*
(best-fit assignment, holds, guarantee transitions) lives in services.py —
these models stay thin and own only field-level invariants.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone


class Departure(models.Model):
    """One running group/slot for a package on a given date.

    Capacity is tracked as two counters so we never oversell and never
    "guarantee" on unpaid interest:
      * seats_confirmed — deposit paid; counts toward the min-N guarantee.
      * seats_held      — party mid-checkout (expires); counts toward max-N.
    """

    STATUS_FORMING = "forming"
    STATUS_GUARANTEED = "guaranteed"
    STATUS_FULL = "full"
    STATUS_LOCKED = "locked"
    STATUS_DEPARTED = "departed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_FORMING, "Forming"),
        (STATUS_GUARANTEED, "Guaranteed"),
        (STATUS_FULL, "Full"),
        (STATUS_LOCKED, "Locked (cutoff passed)"),
        (STATUS_DEPARTED, "Departed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]
    # Statuses that can still accept bookings.
    OPEN_STATUSES = (STATUS_FORMING, STATUS_GUARANTEED)
    # Statuses the engine must never auto-mutate.
    TERMINAL_STATUSES = (STATUS_LOCKED, STATUS_DEPARTED, STATUS_CANCELLED)

    package = models.ForeignKey(
        "cms.PackagePage", on_delete=models.PROTECT, related_name="departures"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    group_label = models.CharField(max_length=4, default="A", help_text="A, B, C … for parallel groups on the same date.")

    min_capacity = models.PositiveSmallIntegerField(default=6)
    max_capacity = models.PositiveSmallIntegerField(default=18)
    seats_confirmed = models.PositiveSmallIntegerField(default=0)
    seats_held = models.PositiveSmallIntegerField(default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_FORMING)
    guaranteed_at = models.DateTimeField(null=True, blank=True)
    cutoff_date = models.DateField(null=True, blank=True)

    price_inr = models.PositiveIntegerField(null=True, blank=True, help_text="Per-person price for this departure. Falls back to the package price if blank.")

    auto_created = models.BooleanField(default=False, help_text="Created by the slotting engine vs. an admin.")
    guide = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "group_label"]
        constraints = [
            models.UniqueConstraint(
                fields=["package", "start_date", "group_label"],
                name="uniq_departure_group",
            )
        ]
        indexes = [models.Index(fields=["package", "start_date", "status"])]

    def __str__(self):
        return f"{self.package.title} · {self.start_date} ({self.group_label}) {self.seats_confirmed}/{self.max_capacity}"

    # --- derived ---------------------------------------------------------
    @property
    def seats_taken(self):
        return self.seats_confirmed + self.seats_held

    @property
    def seats_left(self):
        return max(0, self.max_capacity - self.seats_taken)

    @property
    def is_guaranteed(self):
        return self.seats_confirmed >= self.min_capacity

    @property
    def cutoff_passed(self):
        return self.cutoff_date is not None and self.cutoff_date < timezone.localdate()

    @property
    def is_bookable(self):
        return (
            self.status in self.OPEN_STATUSES
            and not self.cutoff_passed
            and self.start_date >= timezone.localdate()
        )

    @property
    def effective_price_inr(self):
        return self.price_inr or self.package.price_inr


class Booking(models.Model):
    """A party booking against a departure."""

    STATUS_PENDING = "pending"          # soft-booked / interested, in a slot
    STATUS_ACCEPTED = "accepted"        # user accepted the slot, deposit pending
    STATUS_HELD = "held"                # legacy alias for accepted (kept for safety)
    STATUS_CONFIRMED = "confirmed"      # deposit paid
    STATUS_DECLINED = "declined"        # user declined the slot
    STATUS_CANCELLED = "cancelled"
    STATUS_EXPIRED = "expired"
    STATUS_WAITLISTED = "waitlisted"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending (interested)"),
        (STATUS_ACCEPTED, "Accepted (awaiting deposit)"),
        (STATUS_HELD, "Held"),
        (STATUS_CONFIRMED, "Confirmed (deposit paid)"),
        (STATUS_DECLINED, "Declined"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXPIRED, "Expired"),
        (STATUS_WAITLISTED, "Waitlisted"),
    ]
    # Statuses that occupy a (paid or unpaid) seat in a slot.
    RESERVING_STATUSES = (STATUS_PENDING, STATUS_ACCEPTED, STATUS_HELD)
    # Statuses shown as "in this slot" to co-travellers.
    IN_SLOT_STATUSES = (STATUS_PENDING, STATUS_ACCEPTED, STATUS_HELD, STATUS_CONFIRMED)

    PAYMENT_UNPAID = "unpaid"
    PAYMENT_DEPOSIT_PAID = "deposit_paid"
    PAYMENT_FULLY_PAID = "fully_paid"
    PAYMENT_REFUNDED = "refunded"
    PAYMENT_CHOICES = [
        (PAYMENT_UNPAID, "Unpaid"),
        (PAYMENT_DEPOSIT_PAID, "Deposit paid"),
        (PAYMENT_FULLY_PAID, "Fully paid"),
        (PAYMENT_REFUNDED, "Refunded"),
    ]

    package = models.ForeignKey(
        "cms.PackagePage", on_delete=models.PROTECT, related_name="bookings"
    )
    departure = models.ForeignKey(
        Departure, null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="slot_bookings",
    )

    lead_name = models.CharField(max_length=200)
    lead_email = models.EmailField()
    lead_phone = models.CharField(max_length=40, blank=True)

    party_size = models.PositiveSmallIntegerField(default=1)
    preferred_start_date = models.DateField(null=True, blank=True)
    date_flexible = models.BooleanField(default=False)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default=PAYMENT_UNPAID)

    total_amount = models.PositiveIntegerField(default=0)
    deposit_amount = models.PositiveIntegerField(default=0)
    balance_amount = models.PositiveIntegerField(default=0)

    hold_expires_at = models.DateTimeField(null=True, blank=True)
    balance_reminded_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.lead_name} ×{self.party_size} — {self.package.title} ({self.status})"


class BookingTraveller(models.Model):
    """Per-head details for permits / manifests (collected after confirmation)."""

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="travellers")
    full_name = models.CharField(max_length=200)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    id_type = models.CharField(max_length=40, blank=True, help_text="Passport / Aadhaar / etc.")
    id_number = models.CharField(max_length=80, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.full_name} ({self.booking_id})"


class Payment(models.Model):
    """A single PhonePe interaction for a booking (deposit, balance or refund).

    `merchant_order_id` is the id we generate and send to PhonePe; the webhook
    and status-check echo it back so we can map a callback to this row.
    """

    KIND_DEPOSIT = "deposit"
    KIND_BALANCE = "balance"
    KIND_REFUND = "refund"
    KIND_CHOICES = [
        (KIND_DEPOSIT, "Deposit"),
        (KIND_BALANCE, "Balance"),
        (KIND_REFUND, "Refund"),
    ]

    STATUS_CREATED = "created"      # row made, order not yet placed
    STATUS_PENDING = "pending"     # order placed, awaiting outcome
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_CREATED, "Created"),
        (STATUS_PENDING, "Pending"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="payments")
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    merchant_order_id = models.CharField(max_length=64, unique=True)
    phonepe_order_id = models.CharField(max_length=80, blank=True)
    amount = models.PositiveIntegerField(help_text="Amount in paise.")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_CREATED)
    redirect_url = models.URLField(max_length=2000, blank=True)
    raw_response = models.JSONField(null=True, blank=True, help_text="Last status/webhook payload (audit + idempotency).")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.kind} {self.amount/100:.2f} — {self.merchant_order_id} ({self.status})"
