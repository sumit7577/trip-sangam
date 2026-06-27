from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """The `user` object returned by auth endpoints and /me."""

    fullName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    avatarUrl = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    dateOfBirth = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    documentType = serializers.SerializerMethodField()
    documentNumber = serializers.SerializerMethodField()
    emergencyName = serializers.SerializerMethodField()
    emergencyPhone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "fullName", "phone", "avatarUrl", "gender", "dateOfBirth",
            "city", "state", "documentType", "documentNumber", "emergencyName", "emergencyPhone",
        ]

    @staticmethod
    def _p(obj):
        return getattr(obj, "profile", None)

    def get_fullName(self, obj):
        return getattr(self._p(obj), "full_name", "") or obj.first_name

    def get_phone(self, obj):
        return getattr(self._p(obj), "phone", "")

    def get_avatarUrl(self, obj):
        p = self._p(obj)
        return p.avatar.url if p and p.avatar and p.avatar.name else ""

    def get_gender(self, obj):
        return getattr(self._p(obj), "gender", "")

    def get_dateOfBirth(self, obj):
        dob = getattr(self._p(obj), "date_of_birth", None)
        return dob.isoformat() if dob else ""

    def get_city(self, obj):
        return getattr(self._p(obj), "city", "")

    def get_state(self, obj):
        return getattr(self._p(obj), "state", "")

    def get_documentType(self, obj):
        return getattr(self._p(obj), "document_type", "")

    def get_documentNumber(self, obj):
        return getattr(self._p(obj), "document_number", "")

    def get_emergencyName(self, obj):
        return getattr(self._p(obj), "emergency_name", "")

    def get_emergencyPhone(self, obj):
        return getattr(self._p(obj), "emergency_phone", "")


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
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)
    dateOfBirth = serializers.DateField(required=False, allow_null=True)
    city = serializers.CharField(max_length=120, required=False, allow_blank=True)
    state = serializers.CharField(max_length=120, required=False, allow_blank=True)
    documentType = serializers.CharField(max_length=40, required=False, allow_blank=True)
    documentNumber = serializers.CharField(max_length=80, required=False, allow_blank=True)
    emergencyName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    emergencyPhone = serializers.CharField(max_length=40, required=False, allow_blank=True)

    # camelCase API field → snake_case Profile field
    _MAP = {
        "gender": "gender", "dateOfBirth": "date_of_birth", "city": "city", "state": "state",
        "documentType": "document_type", "documentNumber": "document_number",
        "emergencyName": "emergency_name", "emergencyPhone": "emergency_phone",
    }

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
        for camel, snake in self._MAP.items():
            if camel in data:
                setattr(profile, snake, data[camel])
        user.save()
        profile.save()
        return user
