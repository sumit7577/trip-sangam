from django.conf import settings
from django.db import models


class BookingInquiry(models.Model):
    """Phase 1: just an inquiry. No payment, no availability calendar.

    Wired to API + admin actions in Phase 2 alongside user auth.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("contacted", "Contacted"),
        ("confirmed", "Confirmed"),
        ("declined", "Declined"),
        ("cancelled", "Cancelled"),
    ]

    package = models.ForeignKey(
        "cms.PackagePage",
        on_delete=models.PROTECT,
        related_name="inquiries",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="inquiries",
        help_text="Null for guest inquiries; populated once user accounts ship.",
    )

    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)

    preferred_start_date = models.DateField(null=True, blank=True)
    travelers = models.PositiveSmallIntegerField(default=1)
    message = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    internal_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Booking inquiries"

    def __str__(self):
        return f"{self.full_name} — {self.package.title} ({self.status})"
