from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BlogPostViewSet,
    PackageViewSet,
    TeamMemberViewSet,
    TestimonialViewSet,
    health,
    homepage_payload,
    preview_view,
)

router = DefaultRouter()
router.register(r"packages", PackageViewSet, basename="package")
router.register(r"blog", BlogPostViewSet, basename="blogpost")
router.register(r"team", TeamMemberViewSet, basename="team")
router.register(r"testimonials", TestimonialViewSet, basename="testimonial")

urlpatterns = [
    path("health/", health, name="health"),
    path("homepage/", homepage_payload, name="homepage-payload"),
    path("preview/", preview_view, name="preview"),
    path("", include(router.urls)),
]
