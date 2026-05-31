"""
Serializers shaped to match src/types/index.ts on the Next.js side.
Field names are camelCase to drop straight into the existing TS interfaces.
"""

from rest_framework import serializers

from cms.models import (
    BlogPostPage,
    ContactSettings,
    HomePage,
    PackagePage,
    TeamMember,
    Testimonial,
)


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------


class PackageSummarySerializer(serializers.ModelSerializer):
    """Matches the `Package` TS interface — card-level data."""

    name = serializers.CharField(source="title")
    durationDays = serializers.IntegerField(source="duration_days")
    groupSize = serializers.CharField(source="group_size")
    reviewCount = serializers.IntegerField(source="review_count")
    priceINR = serializers.IntegerField(source="price_inr")
    originalPriceINR = serializers.IntegerField(source="original_price_inr")
    discountPct = serializers.IntegerField(source="discount_pct")
    bestSeason = serializers.CharField(source="best_season")
    heroImage = serializers.SerializerMethodField()
    shortDescription = serializers.CharField(source="short_description")
    rating = serializers.SerializerMethodField()

    class Meta:
        model = PackagePage
        fields = [
            "slug",
            "name",
            "location",
            "category",
            "difficulty",
            "durationDays",
            "groupSize",
            "rating",
            "reviewCount",
            "priceINR",
            "originalPriceINR",
            "discountPct",
            "bestSeason",
            "heroImage",
            "shortDescription",
        ]

    def get_heroImage(self, obj):
        return obj.hero_src

    def get_rating(self, obj):
        return float(obj.rating)


class ItineraryDaySerializer(serializers.Serializer):
    day = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    altitude = serializers.IntegerField()
    meals = serializers.CharField()
    accommodation = serializers.CharField()
    activities = serializers.ListField(child=serializers.CharField())


class JourneyStopSerializer(serializers.Serializer):
    id = serializers.CharField(source="stop_id")
    name = serializers.CharField()
    day = serializers.IntegerField()
    activity = serializers.CharField()
    lat = serializers.FloatField(source="latitude")
    lng = serializers.FloatField(source="longitude")
    image = serializers.SerializerMethodField()
    panorama = serializers.SerializerMethodField()

    def get_image(self, obj):
        return obj.image_src

    def get_panorama(self, obj):
        return obj.panorama_src


class ReviewSerializer(serializers.Serializer):
    id = serializers.CharField(source="review_id")
    author = serializers.CharField()
    location = serializers.CharField()
    avatar = serializers.SerializerMethodField()
    rating = serializers.IntegerField()
    date = serializers.CharField()
    title = serializers.CharField()
    body = serializers.CharField()
    photos = serializers.ListField(child=serializers.CharField(), required=False)

    def get_avatar(self, obj):
        return obj.avatar_src


class RatingsBreakdownSerializer(serializers.Serializer):
    stars = serializers.IntegerField()
    pct = serializers.IntegerField()


class FAQSerializer(serializers.Serializer):
    q = serializers.CharField(source="question")
    a = serializers.CharField(source="answer")


class PackageDetailSerializer(PackageSummarySerializer):
    """Matches the `PackageDetail` TS interface — full long-form data."""

    longDescription = serializers.CharField(source="long_description")
    pullQuote = serializers.CharField(source="pull_quote")
    overviewNote = serializers.CharField(source="overview_note")
    tripStyle = serializers.CharField(source="trip_style")
    maxAltitude = serializers.CharField(source="max_altitude")
    dailyWalking = serializers.CharField(source="daily_walking")
    startEnd = serializers.CharField(source="start_end")
    minAge = serializers.CharField(source="min_age")
    languages = serializers.CharField()
    galleryImages = serializers.SerializerMethodField()
    itinerary = ItineraryDaySerializer(source="itinerary_days", many=True)
    inclusions = serializers.SerializerMethodField()
    exclusions = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True)
    ratingsBreakdown = RatingsBreakdownSerializer(source="ratings_breakdown", many=True)
    faqs = FAQSerializer(many=True)
    journey = JourneyStopSerializer(source="journey_stops", many=True)

    class Meta(PackageSummarySerializer.Meta):
        fields = PackageSummarySerializer.Meta.fields + [
            "longDescription",
            "pullQuote",
            "overviewNote",
            "tripStyle",
            "maxAltitude",
            "dailyWalking",
            "startEnd",
            "minAge",
            "languages",
            "galleryImages",
            "itinerary",
            "inclusions",
            "exclusions",
            "reviews",
            "ratingsBreakdown",
            "faqs",
            "journey",
        ]

    def get_galleryImages(self, obj):
        return [g.src for g in obj.gallery_images.all()]

    def get_inclusions(self, obj):
        return [i.text for i in obj.inclusions.all()]

    def get_exclusions(self, obj):
        return [e.text for e in obj.exclusions.all()]


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------


class BlogPostSerializer(serializers.ModelSerializer):
    """Matches the `BlogPost` TS interface."""

    title = serializers.CharField()
    authorSlug = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    isoDate = serializers.SerializerMethodField()
    readingTime = serializers.IntegerField(source="reading_time")
    coverImage = serializers.SerializerMethodField()
    excerpt = serializers.CharField()
    body = serializers.SerializerMethodField()
    pullQuote = serializers.CharField(source="pull_quote")
    featured = serializers.BooleanField()

    class Meta:
        model = BlogPostPage
        fields = [
            "slug",
            "title",
            "category",
            "authorSlug",
            "date",
            "isoDate",
            "readingTime",
            "coverImage",
            "excerpt",
            "body",
            "pullQuote",
            "featured",
        ]

    def get_authorSlug(self, obj):
        return obj.author.slug if obj.author else ""

    def get_date(self, obj):
        return obj.publish_date.strftime("%B %-d, %Y") if obj.publish_date else ""

    def get_isoDate(self, obj):
        return obj.publish_date.isoformat() if obj.publish_date else ""

    def get_coverImage(self, obj):
        return obj.cover_src

    def get_body(self, obj):
        return [p.text for p in obj.paragraphs.all()]


# ---------------------------------------------------------------------------
# Team & testimonials (snippets)
# ---------------------------------------------------------------------------


class TeamMemberSerializer(serializers.ModelSerializer):
    yearsExperience = serializers.IntegerField(source="years_experience")
    photo = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            "slug",
            "name",
            "role",
            "region",
            "yearsExperience",
            "languages",
            "photo",
            "bio",
        ]

    def get_photo(self, obj):
        return obj.photo_src


class TestimonialSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ["id", "name", "location", "avatar", "rating", "quote", "trip"]

    def get_id(self, obj):
        return f"t{obj.id}"

    def get_avatar(self, obj):
        return obj.avatar_src


# ---------------------------------------------------------------------------
# Site-wide payload helpers
# ---------------------------------------------------------------------------


class ContactSettingsSerializer(serializers.ModelSerializer):
    businessName = serializers.CharField(source="business_name")
    instagramUrl = serializers.URLField(source="instagram_url")
    facebookUrl = serializers.URLField(source="facebook_url")
    twitterUrl = serializers.URLField(source="twitter_url")

    class Meta:
        model = ContactSettings
        fields = [
            "businessName",
            "email",
            "phone",
            "whatsapp",
            "address",
            "instagramUrl",
            "facebookUrl",
            "twitterUrl",
        ]


class HomePagePayloadSerializer(serializers.Serializer):
    """One-shot payload for the Next.js homepage."""

    heroEyebrow = serializers.CharField(source="hero_eyebrow")
    heroTitle = serializers.CharField(source="hero_title")
    heroSubtitle = serializers.CharField(source="hero_subtitle")
    heroImage = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    featuredPackages = serializers.SerializerMethodField()

    def get_heroImage(self, obj):
        return obj.hero_src

    def get_stats(self, obj):
        return [{"value": s.value, "label": s.label} for s in obj.stats.all()]

    def get_featuredPackages(self, obj):
        pkgs = [fp.package for fp in obj.featured_packages.all().select_related("package")]
        return PackageSummarySerializer(pkgs, many=True, context=self.context).data
