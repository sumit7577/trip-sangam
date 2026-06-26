"""Surface the booking tables (managed in the Django admin) inside the Wagtail
dashboard, so operators don't need to know the separate /django-admin/ URL.

These link to the Django admin change-lists (which carry the rich inlines and
actions like "Mark deposit received"). Shown to superusers only.
"""
from django.urls import reverse
from wagtail import hooks
from wagtail.admin.menu import Menu, MenuItem, SubmenuMenuItem


class SuperuserMenuItem(MenuItem):
    def is_shown(self, request):
        return request.user.is_superuser


@hooks.register("register_admin_menu_item")
def register_bookings_menu():
    menu = Menu(
        items=[
            SuperuserMenuItem("Bookings", reverse("admin:scheduling_booking_changelist"), icon_name="list-ul", order=10),
            SuperuserMenuItem("Departures", reverse("admin:scheduling_departure_changelist"), icon_name="date", order=20),
            SuperuserMenuItem("Payments", reverse("admin:scheduling_payment_changelist"), icon_name="form", order=30),
            SuperuserMenuItem("Travellers", reverse("admin:scheduling_bookingtraveller_changelist"), icon_name="group", order=40),
            SuperuserMenuItem("Users", reverse("admin:auth_user_changelist"), icon_name="user", order=50),
        ]
    )
    return SubmenuMenuItem("Bookings", menu, icon_name="calendar", order=200)
