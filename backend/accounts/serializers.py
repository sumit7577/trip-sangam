from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """The `user` object returned by auth endpoints and /me."""

    fullName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "fullName", "phone"]

    def get_fullName(self, obj):
        return getattr(getattr(obj, "profile", None), "full_name", "") or obj.first_name

    def get_phone(self, obj):
        return getattr(getattr(obj, "profile", None), "phone", "")


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    fullName = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(username=value).exists() or User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, data):
        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password=data["password"],
            first_name=data["fullName"][:150],
        )
        Profile.objects.create(user=user, full_name=data["fullName"], phone=data.get("phone", ""))
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])


class ProfileUpdateSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=200, required=False)
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def update(self, user, data):
        email = (data.get("email") or "").lower().strip()
        if email and User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            raise serializers.ValidationError({"email": "This email is already linked to another account."})

        profile, _ = Profile.objects.get_or_create(user=user)
        if "fullName" in data:
            profile.full_name = data["fullName"]
            user.first_name = data["fullName"][:150]
        if "phone" in data:
            profile.phone = data["phone"]
        if email:
            user.email = email
        user.save()
        profile.save()
        return user
