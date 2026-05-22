from django.contrib import admin

from .models import BookingInquiry


@admin.register(BookingInquiry)
class BookingInquiryAdmin(admin.ModelAdmin):
    list_display = ("full_name", "package", "status", "travelers", "preferred_start_date", "created_at")
    list_filter = ("status", "package")
    search_fields = ("full_name", "email", "phone", "message")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"
