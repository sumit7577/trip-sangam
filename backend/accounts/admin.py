from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Profile

User = get_user_model()


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "phone", "created_at")
    search_fields = ("user__username", "user__email", "full_name", "phone")


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


class UserAdmin(DjangoUserAdmin):
    """Default User admin + the Profile inline so the full traveller record
    (phone, full name) shows on one page, plus a phone column in the list."""

    inlines = [ProfileInline]
    list_display = ("username", "email", "first_name", "phone", "is_staff", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name", "profile__phone")

    @admin.display(description="Phone")
    def phone(self, obj):
        return getattr(getattr(obj, "profile", None), "phone", "")


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
