"""Surface the booking tables (managed in the Django admin) inside the Wagtail
dashboard, so operators don't need to know the separate /django-admin/ URL.

These link to the Django admin change-lists (which carry the rich inlines and
actions like "Mark deposit received"). Shown to superusers only.
"""
from django.urls import NoReverseMatch, reverse
from wagtail import hooks
from wagtail.admin.menu import Menu, MenuItem, SubmenuMenuItem


class SuperuserMenuItem(MenuItem):
    def is_shown(self, request):
        return request.user.is_superuser


# (label, admin url-name, icon, order). Built defensively: any entry whose URL
# can't be resolved (e.g. the model isn't registered in the Django admin) is
# skipped rather than raising — a single bad link must never 500 the whole
# Wagtail sidebar, which renders all menu items in one pass.
_LINKS = [
    ("Bookings", "admin:scheduling_booking_changelist", "list-ul", 10),
    ("Departures", "admin:scheduling_departure_changelist", "date", 20),
    ("Payments", "admin:scheduling_payment_changelist", "form", 30),
    ("Travellers", "admin:scheduling_bookingtraveller_changelist", "group", 40),
    ("Users", "admin:auth_user_changelist", "user", 50),
]


@hooks.register("register_admin_menu_item")
def register_bookings_menu():
    items = []
    for label, url_name, icon, order in _LINKS:
        try:
            url = reverse(url_name)
        except NoReverseMatch:
            continue
        items.append(SuperuserMenuItem(label, url, icon_name=icon, order=order))
    return SubmenuMenuItem("Bookings", Menu(items=items), icon_name="calendar", order=200)
