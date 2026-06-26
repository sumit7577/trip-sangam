from django.apps import apps
from django.db import connection
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from cms.models import (
    BlogIndexPage,
    BlogPostPage,
    ContactSettings,
    GenericPage,
    HomePage,
    PackageIndexPage,
    PackagePage,
    TeamMember,
    Testimonial,
)
from cms.preview import verify_preview_token
from .serializers import (
    BlogPostSerializer,
    ContactSettingsSerializer,
    HomePagePayloadSerializer,
    PackageDetailSerializer,
    PackageSummarySerializer,
    TeamMemberSerializer,
    TestimonialSerializer,
)


class PackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PackagePage.objects.none()
    lookup_field = "slug"
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PackageDetailSerializer
        return PackageSummarySerializer

    def get_queryset(self):
        qs = PackagePage.objects.live().public().order_by("path")
        if self.action == "retrieve":
            qs = qs.prefetch_related(
                "itinerary_days",
                "inclusions",
                "exclusions",
                "gallery_images",
                "journey_stops",
                "reviews",
                "ratings_breakdown",
                "faqs",
            )
        return qs


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPostPage.objects.none()
    serializer_class = BlogPostSerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return (
            BlogPostPage.objects.live()
            .public()
            .select_related("author")
            .prefetch_related("paragraphs")
            .order_by("-publish_date")
        )


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    lookup_field = "slug"
    pagination_class = None


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    pagination_class = None


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Liveness/readiness probe for the proxy & monitoring. 200 if the DB
    answers, 503 otherwise."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_ok = True
    except Exception:
        db_ok = False
    return Response(
        {"status": "ok" if db_ok else "degraded", "database": db_ok},
        status=200 if db_ok else 503,
    )


@api_view(["GET"])
def homepage_payload(request):
    """Consolidated payload for the Next.js homepage.

    Returns: hero copy, stats strip, featured packages, testimonials, contact info.
    """
    home = HomePage.objects.live().first()
    if not home:
        return Response({"detail": "HomePage not configured"}, status=404)

    data = HomePagePayloadSerializer(home, context={"request": request}).data
    data["testimonials"] = TestimonialSerializer(
        Testimonial.objects.all()[:6], many=True, context={"request": request}
    ).data

    contact = ContactSettings.objects.first()
    if contact:
        data["contact"] = ContactSettingsSerializer(contact, context={"request": request}).data
    return Response(data)


@api_view(["GET"])
def preview_view(request):
    """Return the latest unsaved draft of a Page, in the same shape as the
    published endpoints. Token-protected; called by the Next.js /preview route.
    """
    ct = request.query_params.get("type", "")
    page_id = request.query_params.get("id", "")
    token = request.query_params.get("token", "")

    if not (ct and page_id and token):
        return Response({"detail": "Missing type, id, or token"}, status=400)
    if not verify_preview_token(page_id, token):
        return Response({"detail": "Invalid or expired token"}, status=403)

    try:
        app_label, model_name = ct.split(".")
        model = apps.get_model(app_label, model_name)
    except (LookupError, ValueError):
        return Response({"detail": f"Unknown content type: {ct}"}, status=404)

    page = model.objects.filter(pk=page_id).first()
    if not page:
        return Response({"detail": "Page not found"}, status=404)

    # `get_latest_revision_as_object` returns the page with inline-child relations
    # populated from the draft revision via django-modelcluster — safe to feed
    # to our existing serializers without further work.
    draft = page.get_latest_revision_as_object() if page.latest_revision_id else page

    ctx = {"request": request}
    if isinstance(draft, PackagePage):
        payload = PackageDetailSerializer(draft, context=ctx).data
        return Response({"_type": "package", **payload})
    if isinstance(draft, BlogPostPage):
        payload = BlogPostSerializer(draft, context=ctx).data
        return Response({"_type": "blogpost", **payload})
    if isinstance(draft, HomePage):
        payload = HomePagePayloadSerializer(draft, context=ctx).data
        payload["testimonials"] = TestimonialSerializer(
            Testimonial.objects.all()[:6], many=True, context=ctx
        ).data
        return Response({"_type": "homepage", **payload})
    if isinstance(draft, (PackageIndexPage, BlogIndexPage, GenericPage)):
        return Response(
            {
                "_type": "info",
                "title": draft.title,
                "message": (
                    "Index/static pages don't have a dedicated frontend preview yet. "
                    "Use the published site at /, /packages, or /blog."
                ),
            }
        )
    return Response(
        {"_type": "unknown", "detail": f"No preview renderer for {type(draft).__name__}"},
        status=200,
    )
