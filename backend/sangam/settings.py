from pathlib import Path
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "dev-insecure-change-me-in-production-aaaaaaaaaaaaaaaaaaaa",
)
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Required behind nginx/HTTPS proxy for Wagtail admin POSTs (e.g. login) to
# pass CSRF. Pass full origins including scheme: "https://yourdomain.com"
CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]
# Honor X-Forwarded-Proto from nginx so request.is_secure() returns True when
# the original request was HTTPS — without this, Django builds http:// URLs in
# password-reset emails, redirect responses, etc.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# Production security hardening — only active when DEBUG is off so local dev over
# http keeps working. HSTS + secure cookies + nosniff. SSL redirect stays off by
# default because nginx-proxy already terminates/redirects TLS (avoids loops).
if not DEBUG:
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = os.environ.get("SECURE_HSTS_PRELOAD", "false").lower() == "true"
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "false").lower() == "true"

INSTALLED_APPS = [
    "cms.apps.CmsConfig",
    "api.apps.ApiConfig",
    "bookings.apps.BookingsConfig",
    "scheduling.apps.SchedulingConfig",
    "accounts.apps.AccountsConfig",

    "wagtail.contrib.forms",
    "wagtail.contrib.redirects",
    "wagtail.contrib.settings",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    "wagtail.snippets",
    "wagtail.documents",
    "wagtail.images",
    "wagtail.search",
    "wagtail.admin",
    "wagtail.api.v2",
    "wagtail",

    "modelcluster",
    "taggit",
    "rest_framework",
    "corsheaders",

    # jazzmin must precede django.contrib.admin so it can override the admin
    # templates. It themes /django-admin/ only — the Wagtail admin is untouched.
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    # Whitenoise serves /static/ from gunicorn — required in production because
    # DEBUG=False disables Django's built-in static file handler, so without
    # this the Wagtail admin loads with no CSS/JS.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
]

ROOT_URLCONF = "sangam.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "wagtail.contrib.settings.context_processors.settings",
            ],
        },
    },
]

WSGI_APPLICATION = "sangam.wsgi.application"

# Database — Postgres when POSTGRES_DB is set (Docker/production), else SQLite
# (local dev + tests run with no env). Lets us cut over to Postgres without a
# code change. See docs/slot-booking-design.md / docker-compose.yml.
if os.environ.get("POSTGRES_DB"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ["POSTGRES_DB"],
            "USER": os.environ.get("POSTGRES_USER", "sangam"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
            "HOST": os.environ.get("POSTGRES_HOST", "127.0.0.1"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": int(os.environ.get("POSTGRES_CONN_MAX_AGE", "60")),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            # DJANGO_DB_PATH lets the SQLite file live on a Docker volume in prod
            # (e.g. /app/data/db.sqlite3) so DB state survives container rebuilds.
            "NAME": os.environ.get("DJANGO_DB_PATH") or str(BASE_DIR / "db.sqlite3"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": f"django.contrib.auth.password_validation.{v}"}
    for v in [
        "UserAttributeSimilarityValidator",
        "MinimumLengthValidator",
        "CommonPasswordValidator",
        "NumericPasswordValidator",
    ]
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kathmandu"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ---------------------------------------------------------------------------
# File storage — Bunny CDN for production, local disk for dev (fallback).
#
# Set BUNNY_STORAGE_ACCESS_KEY in .env to push uploads (Wagtail images,
# documents, any FileField/ImageField with the default storage) to Bunny.
# Without the key set, falls back to Django's local FileSystemStorage
# under MEDIA_ROOT so dev keeps working with no credentials.
# ---------------------------------------------------------------------------

BUNNY_STORAGE_ZONE_NAME = os.environ.get("BUNNY_STORAGE_ZONE_NAME", "")
BUNNY_STORAGE_ACCESS_KEY = os.environ.get("BUNNY_STORAGE_ACCESS_KEY", "")
BUNNY_STORAGE_PUBLIC_HOST = os.environ.get("BUNNY_STORAGE_PUBLIC_HOST", "")
BUNNY_STORAGE_API_HOST = os.environ.get("BUNNY_STORAGE_API_HOST", "storage.bunnycdn.com")
BUNNY_STORAGE_DIRECTORY = os.environ.get("BUNNY_STORAGE_DIRECTORY", "sangam/")

if BUNNY_STORAGE_ACCESS_KEY and BUNNY_STORAGE_ZONE_NAME and BUNNY_STORAGE_PUBLIC_HOST:
    STORAGES = {
        "default": {
            "BACKEND": "app.BunnyStorage.BunnyStorage",
            "OPTIONS": {"directoryName": BUNNY_STORAGE_DIRECTORY},
        },
        "staticfiles": {
            # Whitenoise serves /static/ + gzips collected files. Using the
            # non-manifest variant (no hashes) — Wagtail occasionally references
            # assets dynamically that the manifest version rejects at collect time.
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            # Whitenoise serves /static/ + gzips collected files. Using the
            # non-manifest variant (no hashes) — Wagtail occasionally references
            # assets dynamically that the manifest version rejects at collect time.
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

WAGTAIL_SITE_NAME = "Sangam Travels CMS"

# Where Wagtail "Preview" button redirects to. The Next.js route at this path
# fetches the draft data from /api/preview/ using the signed token.
NEXTJS_PREVIEW_URL = os.environ.get("NEXTJS_PREVIEW_URL", "http://localhost:3000/preview/")
WAGTAILADMIN_BASE_URL = os.environ.get("WAGTAILADMIN_BASE_URL", "http://localhost:8000")
WAGTAIL_FRONTEND_LOGIN_URL = None
WAGTAILDOCS_EXTENSIONS = ["pdf", "doc", "docx", "csv", "txt"]

WAGTAILAPI_BASE_URL = WAGTAILADMIN_BASE_URL
WAGTAILAPI_LIMIT_MAX = 100

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
    # Throttling is applied per-endpoint via ScopedRateThrottle (auth/booking)
    # and WebhookRateThrottle — not globally, so the public read API + SSR are
    # unaffected. Rates are deliberately generous; tighten if abuse appears.
    "DEFAULT_THROTTLE_RATES": {
        "auth": "10/min",        # login/register attempts per IP
        "booking": "40/hour",    # booking writes per user
        "webhook": "240/min",    # PhonePe S2S callbacks (retry-friendly)
    },
}

# Disable throttling under the test runner so suite runs stay deterministic.
import sys as _sys  # noqa: E402
if "test" in _sys.argv:
    REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
        k: None for k in REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]
    }

from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "UPDATE_LAST_LOGIN": True,
}

# ---------------------------------------------------------------------------
# Email (booking notifications + password resets). Console backend in dev
# (links print to the runserver console); real SMTP in prod. Defaults target
# Gmail SMTP — set EMAIL_HOST_USER + EMAIL_HOST_PASSWORD (a Google App Password,
# NOT your normal password) and you're done. See scheduling/notifications.py.
# ---------------------------------------------------------------------------
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG
    else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "true").lower() == "true"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "Trip Sangam <noreply@tripsangam.com>")
SITE_PUBLIC_URL = os.environ.get("SITE_PUBLIC_URL", "http://localhost:3000")

CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

# ---------------------------------------------------------------------------
# PhonePe payment gateway (slot booking deposits/balance).
# See docs/slot-booking-design.md §7. Credentials come from the PhonePe
# business dashboard. Without them the client runs in "unconfigured" mode and
# payment endpoints return 503 (so dev/staging works with no secrets).
# ---------------------------------------------------------------------------
PHONEPE_ENV = os.environ.get("PHONEPE_ENV", "sandbox").lower()  # sandbox | production
PHONEPE_CLIENT_ID = os.environ.get("PHONEPE_CLIENT_ID", "")
PHONEPE_CLIENT_SECRET = os.environ.get("PHONEPE_CLIENT_SECRET", "")
PHONEPE_CLIENT_VERSION = os.environ.get("PHONEPE_CLIENT_VERSION", "1")
# Webhook (S2S callback) Basic credentials configured on the PhonePe dashboard.
# PhonePe sends `Authorization: SHA256(username:password)` on each callback.
PHONEPE_WEBHOOK_USERNAME = os.environ.get("PHONEPE_WEBHOOK_USERNAME", "")
PHONEPE_WEBHOOK_PASSWORD = os.environ.get("PHONEPE_WEBHOOK_PASSWORD", "")

if PHONEPE_ENV == "production":
    PHONEPE_AUTH_URL = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    PHONEPE_PG_BASE = "https://api.phonepe.com/apis/pg"
else:
    PHONEPE_AUTH_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"
    PHONEPE_PG_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox"

# Allow explicit overrides if PhonePe changes hostnames.
PHONEPE_AUTH_URL = os.environ.get("PHONEPE_AUTH_URL", PHONEPE_AUTH_URL)
PHONEPE_PG_BASE = os.environ.get("PHONEPE_PG_BASE", PHONEPE_PG_BASE)

# Where PhonePe redirects the traveller back to after paying. The booking id is
# appended, e.g. https://tripsangam.com/trips/<id>.
PHONEPE_REDIRECT_BASE = os.environ.get(
    "PHONEPE_REDIRECT_BASE", "http://localhost:3000/trips"
)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

# ---------------------------------------------------------------------------
# Jazzmin — themes the Django admin (/django-admin/) where the booking tables
# live. The Wagtail CMS admin (/admin/) is a separate app and is unaffected.
# ---------------------------------------------------------------------------
JAZZMIN_SETTINGS = {
    "site_title": "Sangam Admin",
    "site_header": "Sangam Travel",
    "site_brand": "Sangam Travel",
    "site_logo": None,
    "welcome_sign": "Sangam Travel — operations dashboard",
    "copyright": "Sangam Travel",
    "search_model": ["scheduling.Booking", "auth.User"],
    # Link back to the Wagtail CMS + the live site from the admin top bar.
    "topmenu_links": [
        {"name": "Bookings", "model": "scheduling.booking"},
        {"name": "CMS (Wagtail)", "url": "/admin/", "new_window": True},
        {"name": "Live site", "url": "https://tripsangam.com", "new_window": True},
    ],
    # Operations apps first, CMS/auth plumbing after.
    "order_with_respect_to": [
        "scheduling",
        "scheduling.departure",
        "scheduling.booking",
        "scheduling.payment",
        "scheduling.bookingtraveller",
        "bookings",
        "accounts",
        "auth",
    ],
    # FontAwesome 5 free icons per model.
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "accounts.Profile": "fas fa-id-card",
        "scheduling.Departure": "fas fa-calendar-day",
        "scheduling.Booking": "fas fa-receipt",
        "scheduling.Payment": "fas fa-money-bill-wave",
        "scheduling.BookingTraveller": "fas fa-hiking",
        "bookings.BookingInquiry": "fas fa-envelope-open-text",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    # User (top-right) menu links.
    "usermenu_links": [
        {"name": "CMS (Wagtail)", "url": "/admin/", "new_window": True},
        {"model": "auth.user"},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "related_modal_active": True,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {"auth.user": "collapsible"},
    "language_chooser": False,
    # Live theme/colour picker in the admin sidebar (superuser convenience).
    # It writes a JAZZMIN_UI_TWEAKS dict you can paste below. Set False to hide.
    "show_ui_builder": True,
}

# Colours & theme. Tweak live via the UI builder (cog on the admin sidebar),
# then paste the generated dict here to make it permanent. Warm/dark palette
# chosen to sit closer to Sangam's brand (crimson accent, dark chrome).
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-danger",          # crimson-ish accent on links/highlights
    "navbar": "navbar-dark",            # dark top bar
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",  # dark sidebar
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": True,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "litera",                  # clean, neutral base
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": True,
}
