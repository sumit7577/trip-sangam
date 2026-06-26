import logging

from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import (
    action, api_view, authentication_classes, permission_classes, throttle_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from . import payments, phonepe, services
from .models import Booking, Departure, Payment
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingSerializer,
    BookingTravellerSerializer,
    DepartureSerializer,
    PaymentSerializer,
)
from .throttles import WebhookRateThrottle

# Booking actions that mutate state / cost money → rate-limited per user.
_THROTTLED_ACTIONS = {"create", "accept", "decline", "cancel", "pay_deposit", "pay_balance", "travellers"}

logger = logging.getLogger(__name__)

# Statuses shown to travellers in the slot picker (open + sold-out groups).
_VISIBLE = Departure.OPEN_STATUSES + (Departure.STATUS_FULL,)


class DepartureViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/departures/?package=<slug> — upcoming slots for a package (public)."""

    serializer_class = DepartureSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        today = timezone.localdate()
        qs = (
            Departure.objects.select_related("package")
            .filter(start_date__gte=today, status__in=_VISIBLE)
            .order_by("start_date", "group_label")
        )
        slug = self.request.query_params.get("package")
        if slug:
            qs = qs.filter(package__slug=slug)
        return qs


class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Authenticated bookings:
      POST   /api/bookings/             soft-book a trip (login required)
      GET    /api/bookings/             my trips
      GET    /api/bookings/<id>/        booking + slot co-travellers
      POST   /api/bookings/<id>/accept/ accept slot → start deposit payment
      POST   /api/bookings/<id>/decline/ leave the slot
      POST   /api/bookings/<id>/pay-deposit/ | pay-balance/
    """

    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_throttles(self):
        # Throttle only the write/payment actions; reads (list/retrieve) are free.
        if self.action in _THROTTLED_ACTIONS:
            self.throttle_scope = "booking"
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("departure", "departure__package", "package")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return BookingCreateSerializer
        if self.action == "retrieve":
            return BookingDetailSerializer
        return BookingSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if self.request.user.is_authenticated:
            ctx["me_user_id"] = self.request.user.id
        return ctx

    # --- create (soft book) ------------------------------------------------
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        package = serializer.context["package"]

        profile = getattr(request.user, "profile", None)
        lead_name = data.get("leadName") or (profile and profile.full_name) or request.user.first_name or request.user.email
        lead_email = data.get("leadEmail") or request.user.email
        lead_phone = data.get("leadPhone") or (profile and profile.phone) or ""

        try:
            booking = services.create_booking(
                package=package,
                party_size=data["partySize"],
                lead_name=lead_name,
                lead_email=lead_email,
                lead_phone=lead_phone,
                preferred_date=data.get("preferredStartDate"),
                flexible=data.get("flexible", False),
                departure_id=data.get("departureId"),
                user=request.user,
            )
        except services.PartyTooLarge:
            return Response(
                {"detail": f"Parties larger than {package.max_group} need a private departure. "
                           "Please contact us.", "code": "party_too_large"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        out = BookingDetailSerializer(booking, context=self.get_serializer_context())
        return Response(out.data, status=status.HTTP_201_CREATED)

    # --- accept / decline --------------------------------------------------
    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        booking = self.get_object()
        try:
            booking = services.accept_booking(booking)
        except ValueError as exc:
            return Response({"detail": str(exc), "code": "not_acceptable"},
                            status=status.HTTP_409_CONFLICT)
        # Kick off the deposit payment if the gateway is live.
        payment_data = None
        if phonepe.is_configured():
            try:
                payment = payments.initiate_payment(booking, Payment.KIND_DEPOSIT)
                payment_data = PaymentSerializer(payment).data
            except (payments.PaymentNotAllowed, phonepe.PhonePeError) as exc:
                logger.error("Deposit init after accept failed (booking %s): %s", booking.id, exc)
        booking.refresh_from_db()
        return Response({
            "booking": BookingDetailSerializer(booking, context=self.get_serializer_context()).data,
            "payment": payment_data,
        })

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        booking = self.get_object()
        try:
            services.decline_booking(booking)
        except ValueError as exc:
            return Response({"detail": str(exc), "code": "not_declinable"},
                            status=status.HTTP_409_CONFLICT)
        booking.refresh_from_db()
        return Response(BookingDetailSerializer(booking, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Traveller cancels an un-paid booking (pending / accepted / waitlisted).
        Releases any held seats. Confirmed bookings need the refund path, so they
        can't be self-cancelled here."""
        booking = self.get_object()
        if booking.status == Booking.STATUS_CONFIRMED:
            return Response(
                {"detail": "This booking is confirmed — contact us to cancel and arrange a refund.",
                 "code": "already_confirmed"},
                status=status.HTTP_409_CONFLICT,
            )
        # Already gone → idempotent success.
        if booking.status not in (Booking.STATUS_CANCELLED, Booking.STATUS_EXPIRED, Booking.STATUS_DECLINED):
            services.cancel_booking(booking)
            booking.refresh_from_db()
        return Response(BookingDetailSerializer(booking, context=self.get_serializer_context()).data)

    # --- travellers (per-head details for permits) -------------------------
    @action(detail=True, methods=["get", "post"])
    def travellers(self, request, pk=None):
        booking = self.get_object()
        if request.method == "GET":
            return Response(BookingTravellerSerializer(booking.travellers.all(), many=True).data)

        # POST replaces the traveller list for this booking.
        serializer = BookingTravellerSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        if len(serializer.validated_data) > booking.party_size:
            return Response(
                {"detail": f"At most {booking.party_size} travellers for this booking.",
                 "code": "too_many_travellers"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.travellers.all().delete()
        for row in serializer.validated_data:
            booking.travellers.create(**row)
        return Response(
            BookingTravellerSerializer(booking.travellers.all(), many=True).data,
            status=status.HTTP_200_OK,
        )

    # --- payments ----------------------------------------------------------
    @action(detail=True, methods=["post"], url_path="pay-deposit")
    def pay_deposit(self, request, pk=None):
        return self._initiate(self.get_object(), Payment.KIND_DEPOSIT)

    @action(detail=True, methods=["post"], url_path="pay-balance")
    def pay_balance(self, request, pk=None):
        return self._initiate(self.get_object(), Payment.KIND_BALANCE)

    def _initiate(self, booking, kind):
        if not phonepe.is_configured():
            return Response(
                {"detail": "Payments are not available yet.", "code": "gateway_unconfigured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            payment = payments.initiate_payment(booking, kind)
        except payments.PaymentNotAllowed as exc:
            return Response({"detail": str(exc), "code": "payment_not_allowed"},
                            status=status.HTTP_409_CONFLICT)
        except phonepe.PhonePeError as exc:
            logger.error("PhonePe %s init failed for booking %s: %s", kind, booking.id, exc)
            return Response({"detail": "Could not start payment. Please try again.",
                             "code": "gateway_error"}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([WebhookRateThrottle])
def phonepe_webhook(request):
    """PhonePe S2S callback. Validates the SHA256(user:pass) Authorization
    header, applies the outcome idempotently, and always acks 2xx fast."""
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not phonepe.verify_webhook_auth(auth):
        return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    body = request.data if isinstance(request.data, dict) else {}
    event = body.get("event", "")
    payload = body.get("payload") or {}
    try:
        payments.handle_webhook(event, payload)
    except Exception:  # never 500 at PhonePe — log and ack
        logger.exception("Error handling PhonePe webhook event=%s", event)
    return Response({"ok": True}, status=status.HTTP_200_OK)
