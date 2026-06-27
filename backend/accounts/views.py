import logging

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .firebase_auth import firebase_configured, verify_phone_token
from .models import Profile
from .serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


def _user_for_phone(phone):
    """Find or create the account tied to a verified phone number."""
    phone = (phone or "").strip()
    prof = Profile.objects.filter(phone=phone).select_related("user").first()
    if prof:
        return prof.user
    user = User.objects.filter(username=phone).first()
    if user:
        Profile.objects.get_or_create(user=user, defaults={"phone": phone})
        return user
    user = User.objects.create_user(username=phone)  # OTP-only account, no password
    Profile.objects.create(user=user, phone=phone, full_name="")
    return user


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data, **_tokens_for(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Email + password login → JWT access/refresh."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        email = (request.data.get("email") or "").lower().strip()
        password = request.data.get("password") or ""
        user = authenticate(username=email, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response({"user": UserSerializer(user).data, **_tokens_for(user)})


def _send_reset_email(user):
    """Email a time-limited password-reset link. Best-effort — never raises."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"{settings.SITE_PUBLIC_URL}/reset-password/?uid={uid}&token={token}"
    name = (getattr(getattr(user, "profile", None), "full_name", "") or user.first_name or "there")
    try:
        send_mail(
            "Reset your Trip Sangam password",
            f"Hi {name},\n\n"
            f"We received a request to reset your Trip Sangam password. "
            f"Click the link below to choose a new one:\n\n{link}\n\n"
            f"This link expires in 3 days. If you didn't request this, you can safely "
            f"ignore this email — your password won't change.\n\n— Trip Sangam",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send password-reset email to %s", user.email)


class PasswordResetRequestView(APIView):
    """Request a reset link. Always 200 — never reveal whether an email exists."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = (
            User.objects.filter(email__iexact=email).first()
            or User.objects.filter(username__iexact=email).first()
        )
        if user is not None and user.is_active:
            _send_reset_email(user)
        return Response(
            {"detail": "If an account exists for that email, a reset link is on its way."}
        )


class PasswordResetConfirmView(APIView):
    """Confirm a reset with uid + token from the emailed link and set a new password."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, data["token"]):
            return Response(
                {"detail": "This reset link is invalid or has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Your password has been reset. You can now sign in."})


class FirebasePhoneLoginView(APIView):
    """Exchange a Firebase phone-auth ID token for our JWT + user."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        if not firebase_configured():
            return Response(
                {"detail": "Phone login isn't set up yet. Please use email."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        id_token = request.data.get("idToken") or ""
        phone = verify_phone_token(id_token)
        if not phone:
            return Response(
                {"detail": "Couldn't verify that phone number. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = _user_for_phone(phone)
        return Response({"user": UserSerializer(user).data, **_tokens_for(user)})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.update(request.user, serializer.validated_data)
        return Response(UserSerializer(user).data)
