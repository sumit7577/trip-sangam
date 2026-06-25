"""camelCase serializers for the slot booking API (matches the Next.js side)."""
import re

from rest_framework import serializers

from cms.models import PackagePage

from .models import Booking, BookingTraveller, Departure, Payment


def mask_phone(phone):
    """Show only the first 4 digits, e.g. '9876543210' -> '9876••••••'."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) <= 4:
        return digits
    return digits[:4] + "•" * (len(digits) - 4)


class PaymentSerializer(serializers.ModelSerializer):
    """Returned when a deposit/balance order is created — the frontend redirects
    the user to `redirectUrl`."""

    bookingId = serializers.IntegerField(source="booking_id", read_only=True)
    merchantOrderId = serializers.CharField(source="merchant_order_id", read_only=True)
    redirectUrl = serializers.CharField(source="redirect_url", read_only=True)
    amountPaise = serializers.IntegerField(source="amount", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "bookingId", "kind", "merchantOrderId", "amountPaise", "status", "redirectUrl"]


class DepartureSerializer(serializers.ModelSerializer):
    packageSlug = serializers.CharField(source="package.slug", read_only=True)
    packageName = serializers.CharField(source="package.title", read_only=True)
    startDate = serializers.DateField(source="start_date", read_only=True)
    endDate = serializers.DateField(source="end_date", read_only=True)
    groupLabel = serializers.CharField(source="group_label", read_only=True)
    minCapacity = serializers.IntegerField(source="min_capacity", read_only=True)
    maxCapacity = serializers.IntegerField(source="max_capacity", read_only=True)
    seatsConfirmed = serializers.IntegerField(source="seats_confirmed", read_only=True)
    seatsLeft = serializers.IntegerField(source="seats_left", read_only=True)
    isGuaranteed = serializers.BooleanField(source="is_guaranteed", read_only=True)
    priceINR = serializers.IntegerField(source="effective_price_inr", read_only=True)
    cutoffDate = serializers.DateField(source="cutoff_date", read_only=True)

    class Meta:
        model = Departure
        fields = [
            "id", "packageSlug", "packageName", "startDate", "endDate",
            "groupLabel", "status", "isGuaranteed", "minCapacity", "maxCapacity",
            "seatsConfirmed", "seatsLeft", "priceINR", "cutoffDate",
        ]


class CoTravellerSerializer(serializers.Serializer):
    """A fellow traveller in the same slot — name + privacy-masked phone."""

    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    partySize = serializers.IntegerField(source="party_size")
    status = serializers.CharField()
    isYou = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.lead_name or "Traveller"

    def get_phone(self, obj):
        return mask_phone(obj.lead_phone)

    def get_isYou(self, obj):
        me = self.context.get("me_user_id")
        return bool(me and obj.user_id == me)


class BookingSerializer(serializers.ModelSerializer):
    """Read view for a booking (list / 'My Trips')."""

    packageSlug = serializers.CharField(source="package.slug", read_only=True)
    packageName = serializers.CharField(source="package.title", read_only=True)
    partySize = serializers.IntegerField(source="party_size", read_only=True)
    paymentStatus = serializers.CharField(source="payment_status", read_only=True)
    totalAmount = serializers.IntegerField(source="total_amount", read_only=True)
    depositAmount = serializers.IntegerField(source="deposit_amount", read_only=True)
    balanceAmount = serializers.IntegerField(source="balance_amount", read_only=True)
    holdExpiresAt = serializers.DateTimeField(source="hold_expires_at", read_only=True)
    departure = DepartureSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "status", "paymentStatus", "packageSlug", "packageName", "partySize",
            "totalAmount", "depositAmount", "balanceAmount", "holdExpiresAt",
            "departure", "createdAt",
        ]


class BookingDetailSerializer(BookingSerializer):
    """Booking + the co-travellers in its slot (only the owner sees this)."""

    coTravellers = serializers.SerializerMethodField()

    class Meta(BookingSerializer.Meta):
        fields = BookingSerializer.Meta.fields + ["coTravellers"]

    def get_coTravellers(self, obj):
        if obj.departure_id is None:
            return []
        mates = (
            obj.departure.bookings.filter(status__in=Booking.IN_SLOT_STATUSES)
            .select_related("user")
            .order_by("created_at")
        )
        return CoTravellerSerializer(mates, many=True, context=self.context).data


class BookingTravellerSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name", max_length=200)
    idType = serializers.CharField(source="id_type", required=False, allow_blank=True)
    idNumber = serializers.CharField(source="id_number", required=False, allow_blank=True)

    class Meta:
        model = BookingTraveller
        fields = ["id", "fullName", "age", "gender", "idType", "idNumber"]


class BookingCreateSerializer(serializers.Serializer):
    """Write payload for POST /api/bookings/ (lead details default to the user)."""

    packageSlug = serializers.SlugField()
    partySize = serializers.IntegerField(min_value=1)
    preferredStartDate = serializers.DateField(required=False, allow_null=True)
    flexible = serializers.BooleanField(required=False, default=False)
    departureId = serializers.IntegerField(required=False, allow_null=True)
    # Optional overrides — otherwise taken from the logged-in user's profile.
    leadName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    leadEmail = serializers.EmailField(required=False, allow_blank=True)
    leadPhone = serializers.CharField(max_length=40, required=False, allow_blank=True)

    def validate_packageSlug(self, value):
        pkg = PackagePage.objects.live().filter(slug=value).first()
        if pkg is None:
            raise serializers.ValidationError("Unknown package.")
        self.context["package"] = pkg
        return value
