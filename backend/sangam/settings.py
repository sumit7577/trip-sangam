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

INSTALLED_APPS = [
    "cms.apps.CmsConfig",
    "api.apps.ApiConfig",
    "bookings.apps.BookingsConfig",

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

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
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

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
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
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
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
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
