from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BookingViewSet, DepartureViewSet, razorpay_webhook

router = DefaultRouter()
router.register(r"departures", DepartureViewSet, basename="departure")
router.register(r"bookings", BookingViewSet, basename="booking")

urlpatterns = [
    path("webhooks/razorpay/", razorpay_webhook, name="razorpay-webhook"),
    *router.urls,
]
