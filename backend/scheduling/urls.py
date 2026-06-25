from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BookingViewSet, DepartureViewSet, phonepe_webhook

router = DefaultRouter()
router.register(r"departures", DepartureViewSet, basename="departure")
router.register(r"bookings", BookingViewSet, basename="booking")

urlpatterns = [
    path("webhooks/phonepe/", phonepe_webhook, name="phonepe-webhook"),
    *router.urls,
]
