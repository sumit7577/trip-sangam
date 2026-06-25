from django.conf import settings
from django.db import models


class Profile(models.Model):
    """Lightweight extension of the built-in User for traveller details.

    Auth uses Django's User (username = email). Phone/full name live here so we
    can prefill bookings and show co-travellers. Phone/Google login can be added
    later without changing this.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    full_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=40, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.username}"
