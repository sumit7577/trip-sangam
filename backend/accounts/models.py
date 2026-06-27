from django.conf import settings
from django.db import models

from app.BunnyStorage import BunnyStorage


def upload_to_avatar(instance, filename):
    return f"sangam/profile/{instance.user_id}/{filename}"


class Profile(models.Model):
    """Extension of the built-in User for traveller details.

    Auth uses Django's User; richer profile fields (photo, document for the
    border crossing, emergency contact) live here and prefill bookings.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    full_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=40, blank=True)

    avatar = models.ImageField(
        storage=BunnyStorage(), upload_to=upload_to_avatar, null=True, blank=True, max_length=500
    )
    gender = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=120, blank=True)
    # Travel document for the Raxaul–Birgunj border crossing.
    document_type = models.CharField(max_length=40, blank=True)
    document_number = models.CharField(max_length=80, blank=True)
    # Emergency contact (useful on treks / group departures).
    emergency_name = models.CharField(max_length=200, blank=True)
    emergency_phone = models.CharField(max_length=40, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.username}"
