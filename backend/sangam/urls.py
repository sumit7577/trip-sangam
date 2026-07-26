from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as static_serve
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.documents import urls as wagtaildocs_urls
from wagtail.documents.api.v2.views import DocumentsAPIViewSet
from wagtail.images.api.v2.views import ImagesAPIViewSet

wagtail_api_router = WagtailAPIRouter("wagtailapi")
wagtail_api_router.register_endpoint("pages", PagesAPIViewSet)
wagtail_api_router.register_endpoint("images", ImagesAPIViewSet)
wagtail_api_router.register_endpoint("documents", DocumentsAPIViewSet)

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("api/v2/", wagtail_api_router.urls),
    path("api/", include("api.urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("scheduling.urls")),
]

# Media (uploaded images/documents) has no CDN in front of it unless Bunny is
# configured — serve it directly regardless of DEBUG, or local-storage
# fallback uploads would save fine but 404 when viewed in production. Must
# come BEFORE the wagtail_urls catch-all below, which matches any remaining
# path as a page slug and would otherwise swallow /media/... first.
#
# NOT using django.conf.urls.static.static() here — it silently returns an
# empty urlpatterns list whenever DEBUG is False (a hardcoded guard inside
# Django itself, independent of any `if settings.DEBUG` around the call
# site), so it can never actually serve anything in production. Registering
# django.views.static.serve directly is the same view, minus that guard.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", static_serve, {"document_root": settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    # Static assets are served by whitenoise's middleware in production
    # (see STORAGES in settings.py); this route is only needed in dev.
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += [
    path("", include(wagtail_urls)),
]
