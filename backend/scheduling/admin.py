from django.contrib import admin, messages

from . import services
from .models import Booking, BookingTraveller, Departure, Payment


@admin.register(Departure)
class DepartureAdmin(admin.ModelAdmin):
    list_display = (
        "package",
        "start_date",
        "group_label",
        "status",
        "fill",
        "min_capacity",
        "max_capacity",
        "cutoff_date",
        "auto_created",
    )
    list_filter = ("status", "auto_created", "package")
    search_fields = ("package__title", "guide", "notes")
    date_hierarchy = "start_date"
    readonly_fields = ("seats_confirmed", "seats_held", "guaranteed_at", "created_at", "updated_at")
    actions = ("action_recompute", "action_lock", "action_cancel")

    @admin.display(description="Seats")
    def fill(self, obj):
        return f"{obj.seats_confirmed}✓ + {obj.seats_held}⏳ / {obj.max_capacity}"

    @admin.action(description="Recompute status from seat counts")
    def action_recompute(self, request, queryset):
        for dep in queryset:
            services._recompute(dep)
        self.message_user(request, f"Recomputed {queryset.count()} departure(s).")

    @admin.action(description="Lock (close to new bookings)")
    def action_lock(self, request, queryset):
        n = queryset.exclude(status=Departure.STATUS_CANCELLED).update(status=Departure.STATUS_LOCKED)
        self.message_user(request, f"Locked {n} departure(s).")

    @admin.action(description="Cancel departure")
    def action_cancel(self, request, queryset):
        n = queryset.update(status=Departure.STATUS_CANCELLED)
        self.message_user(
            request,
            f"Cancelled {n} departure(s). Re-slot/refund affected bookings manually (Phase 2).",
            level=messages.WARNING,
        )


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ("kind", "merchant_order_id", "amount", "status", "phonepe_order_id", "created_at")
    readonly_fields = fields
    can_delete = False
    show_change_link = True


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("merchant_order_id", "booking", "kind", "amount", "status", "created_at")
    list_filter = ("kind", "status")
    search_fields = ("merchant_order_id", "phonepe_order_id", "booking__lead_name")
    readonly_fields = ("raw_response", "created_at", "updated_at")
    date_hierarchy = "created_at"


class TravellerInline(admin.TabularInline):
    model = BookingTraveller
    extra = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    inlines = [TravellerInline, PaymentInline]
    list_display = (
        "lead_name",
        "package",
        "party_size",
        "departure",
        "status",
        "payment_status",
        "deposit_amount",
        "created_at",
    )
    list_filter = ("status", "payment_status", "package")
    search_fields = ("lead_name", "lead_email", "lead_phone")
    date_hierarchy = "created_at"
    autocomplete_fields = ()
    readonly_fields = (
        "total_amount",
        "deposit_amount",
        "balance_amount",
        "hold_expires_at",
        "created_at",
        "updated_at",
    )
    actions = ("action_mark_deposit_paid", "action_cancel")

    @admin.action(description="Mark deposit received (confirm seat)")
    def action_mark_deposit_paid(self, request, queryset):
        ok, failed = 0, 0
        for booking in queryset:
            try:
                services.confirm_booking(booking)
                ok += 1
            except ValueError:
                failed += 1
        self.message_user(
            request,
            f"Confirmed {ok} booking(s)." + (f" Skipped {failed} (not in a holdable state)." if failed else ""),
            level=messages.WARNING if failed else messages.SUCCESS,
        )

    @admin.action(description="Cancel booking (release seats)")
    def action_cancel(self, request, queryset):
        for booking in queryset:
            services.cancel_booking(booking)
        self.message_user(request, f"Cancelled {queryset.count()} booking(s).")
