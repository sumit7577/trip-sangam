import re
from urllib.parse import unquote

from django.db import models
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.admin.panels import (
    FieldPanel,
    InlinePanel,
    MultiFieldPanel,
)
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.models import Orderable, Page
from wagtail.snippets.models import register_snippet

from cms.preview import HeadlessPreviewMixin

CATEGORY_CHOICES = [
    ("Trekking", "Trekking"),
    ("Cultural", "Cultural"),
    ("Adventure", "Adventure"),
    ("Spiritual", "Spiritual"),
    ("Wildlife", "Wildlife"),
    ("Leisure", "Leisure"),
]

DIFFICULTY_CHOICES = [
    ("Easy", "Easy"),
    ("Moderate", "Moderate"),
    ("Challenging", "Challenging"),
]

BLOG_CATEGORY_CHOICES = [
    ("Trekking", "Trekking"),
    ("Culture", "Culture"),
    ("Stories", "Stories"),
    ("Tips", "Tips"),
    ("Wildlife", "Wildlife"),
]


# Bunny CDN directory routing.
#
# These run during Django's FieldFile.save() — which Wagtail invokes during
# `save_revision` (draft) and Revision.publish() (live). Critically, they
# run BEFORE storage.save() sees the path, so the file lands in the right
# Bunny directory regardless of which Wagtail code path triggered the
# upload. An older save()-override approach didn't catch draft saves and
# left files at the zone root.
def upload_to_team_photo(instance, filename):
    return f"sangam/team/{instance.slug}/{filename}"


def upload_to_testimonial_avatar(instance, filename):
    return f"sangam/testimonial/{instance.pk or '_new'}/{filename}"


def upload_to_home_hero(instance, filename):
    return f"sangam/home/{filename}"


def upload_to_generic_hero(instance, filename):
    return f"sangam/pages/{instance.slug}/{filename}"


def upload_to_package_hero(instance, filename):
    return f"sangam/package/{instance.slug}/hero/{filename}"


def upload_to_package_gallery(instance, filename):
    parent_slug = getattr(instance.page, "slug", None) or "_orphan"
    return f"sangam/package/{parent_slug}/gallery/{filename}"


def upload_to_package_review_avatar(instance, filename):
    parent_slug = getattr(instance.page, "slug", None) or "_orphan"
    return f"sangam/package/{parent_slug}/reviews/{filename}"


def upload_to_blog_cover(instance, filename):
    return f"sangam/blog/{instance.slug}/{filename}"


def upload_to_journey_stop(instance, filename):
    parent_slug = getattr(instance.page, "slug", None) or "_orphan"
    return f"sangam/package/{parent_slug}/journey/{instance.stop_id or 'unnamed'}/{filename}"


def upload_to_journey_stop_panorama(instance, filename):
    parent_slug = getattr(instance.page, "slug", None) or "_orphan"
    return f"sangam/package/{parent_slug}/journey/{instance.stop_id or 'unnamed'}/panorama/{filename}"


def _img_url(field):
    return field.url if field and field.name else ""


def _google_maps_pano_to_equirect(url):
    """Pull a full equirectangular image URL out of a Google Maps photo-sphere
    link. Maps share URLs embed the panorama image on googleusercontent.com;
    requesting that base with a plain `=w<W>-h<H>` size param (no projection
    params) returns the 2:1 equirectangular, which Photo Sphere Viewer can
    render directly — no API key needed. Returns None if no such image is
    present (e.g. a tiled car Street View, which can't be a single image)."""
    decoded = unquote(url)
    m = re.search(r"https?://lh\d+\.googleusercontent\.com/[^\s!]+", decoded)
    if not m:
        return None
    base = re.sub(r"=.*$", "", m.group(0))
    return f"{base}=w4096-h2048"


@register_snippet
class TeamMember(models.Model):
    slug = models.SlugField(max_length=120, unique=True)
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    region = models.CharField(max_length=120)
    years_experience = models.PositiveIntegerField(default=0)
    languages = models.JSONField(
        default=list, help_text="List of language names, e.g. [\"English\", \"Nepali\"]"
    )
    photo = models.ImageField(
        upload_to=upload_to_team_photo,
        null=True, blank=True, max_length=500,
    )
    bio = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    panels = [
        FieldPanel("name"),
        FieldPanel("slug"),
        FieldPanel("role"),
        FieldPanel("region"),
        FieldPanel("years_experience"),
        FieldPanel("languages"),
        FieldPanel("photo"),
        FieldPanel("bio"),
        FieldPanel("sort_order"),
    ]

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

    @property
    def photo_src(self):
        return _img_url(self.photo)


@register_snippet
class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    avatar = models.ImageField(
        upload_to=upload_to_testimonial_avatar,
        null=True, blank=True, max_length=500,
    )
    rating = models.PositiveSmallIntegerField(default=5)
    quote = models.TextField()
    trip = models.CharField(max_length=200, help_text="Name of the trip/package")
    sort_order = models.PositiveIntegerField(default=0)

    panels = [
        FieldPanel("name"),
        FieldPanel("location"),
        FieldPanel("avatar"),
        FieldPanel("rating"),
        FieldPanel("quote"),
        FieldPanel("trip"),
        FieldPanel("sort_order"),
    ]

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.name} — {self.trip}"

    @property
    def avatar_src(self):
        return _img_url(self.avatar)


class HomePage(HeadlessPreviewMixin, Page):
    """Singleton root page. Holds editable hero copy + stats for the landing page."""

    intro = RichTextField(blank=True)
    hero_eyebrow = models.CharField(max_length=200, blank=True, default="Nepal · Curated Journeys")
    hero_title = models.CharField(max_length=200, default="Where the Sky Begins")
    hero_subtitle = models.TextField(
        blank=True,
        default="Trekking, cultural and spiritual experiences led by lifelong local guides.",
    )
    hero_image = models.ImageField(
        upload_to=upload_to_home_hero,
        null=True, blank=True, max_length=500,
    )

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("hero_eyebrow"),
                FieldPanel("hero_title"),
                FieldPanel("hero_subtitle"),
                FieldPanel("hero_image"),
            ],
            heading="Hero",
        ),
        FieldPanel("intro"),
        InlinePanel("stats", label="Stats strip"),
        InlinePanel("featured_packages", label="Featured packages (ordered)"),
    ]

    subpage_types = ["cms.PackageIndexPage", "cms.BlogIndexPage", "cms.GenericPage"]
    max_count = 1

    class Meta:
        verbose_name = "Home page"

    @property
    def hero_src(self):
        return _img_url(self.hero_image)


class HomePageStat(Orderable):
    page = ParentalKey(HomePage, related_name="stats", on_delete=models.CASCADE)
    value = models.CharField(max_length=40, help_text="e.g. '12+' or '4.9★'")
    label = models.CharField(max_length=80, help_text="e.g. 'years guiding'")

    panels = [FieldPanel("value"), FieldPanel("label")]


class HomePageFeaturedPackage(Orderable):
    page = ParentalKey(HomePage, related_name="featured_packages", on_delete=models.CASCADE)
    package = models.ForeignKey(
        "cms.PackagePage", on_delete=models.CASCADE, related_name="+"
    )

    panels = [FieldPanel("package")]


class GenericPage(HeadlessPreviewMixin, Page):
    """Simple rich-text page for About, Privacy, Terms, etc."""

    body = RichTextField(blank=True)
    hero_image = models.ImageField(
        upload_to=upload_to_generic_hero,
        null=True, blank=True, max_length=500,
    )

    content_panels = Page.content_panels + [
        FieldPanel("hero_image"),
        FieldPanel("body"),
    ]


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------


class PackageIndexPage(HeadlessPreviewMixin, Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    subpage_types = ["cms.PackagePage"]
    max_count = 1

    class Meta:
        verbose_name = "Packages index"


class PackagePage(HeadlessPreviewMixin, Page):
    location = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    duration_days = models.PositiveIntegerField()
    group_size = models.CharField(max_length=40, help_text="e.g. '4-12'")
    rating = models.FloatField(default=5.0, help_text="0.0 - 5.0")
    review_count = models.PositiveIntegerField(default=0)
    price_inr = models.PositiveIntegerField()
    original_price_inr = models.PositiveIntegerField()
    discount_pct = models.PositiveSmallIntegerField(default=0)
    best_season = models.CharField(max_length=80)

    hero_image = models.ImageField(
        upload_to=upload_to_package_hero,
        null=True, blank=True, max_length=500,
    )
    short_description = models.TextField()

    long_description = models.TextField(blank=True)
    pull_quote = models.TextField(blank=True)
    overview_note = models.TextField(
        blank=True,
        help_text="Secondary paragraph under the pull quote in the Overview tab (pace, highlights, etc.). Optional.",
    )

    # "At a glance" card on the detail page. Free-form display strings (include
    # units), all optional — blank fields are simply hidden on the frontend.
    trip_style = models.CharField(max_length=120, blank=True, help_text="e.g. 'Small-group teahouse trek'")
    max_altitude = models.CharField(max_length=80, blank=True, help_text="e.g. '5,416m (Thorong La)'")
    daily_walking = models.CharField(max_length=80, blank=True, help_text="e.g. '5–7 hrs'")
    start_end = models.CharField(max_length=120, blank=True, help_text="e.g. 'Kathmandu / Pokhara'")
    min_age = models.CharField(max_length=40, blank=True, help_text="e.g. '14 years'")
    languages = models.CharField(max_length=120, blank=True, help_text="e.g. 'English, Hindi, Nepali'")

    # ------------------------------------------------------------------
    # Slot booking / auto-grouping config (see docs/slot-booking-design.md).
    # `group_size` above stays as the human display string ("4-12"); these
    # numeric fields drive the actual slotting engine in the `scheduling` app.
    # ------------------------------------------------------------------
    min_group = models.PositiveSmallIntegerField(
        default=6, help_text="Minimum travellers for a departure to be guaranteed/run."
    )
    max_group = models.PositiveSmallIntegerField(
        default=50, help_text="Maximum travellers per group/slot."
    )
    max_groups_per_date = models.PositiveSmallIntegerField(
        default=2,
        help_text="How many parallel groups (A, B, …) may run on the same date — limited by guides/permits.",
    )
    deposit_pct = models.PositiveSmallIntegerField(
        default=50, help_text="Percent of total payable as deposit to confirm a seat (e.g. 50)."
    )
    cutoff_days = models.PositiveSmallIntegerField(
        default=14, help_text="Booking closes this many days before a departure's start date."
    )
    departure_weekdays = models.CharField(
        max_length=20,
        blank=True,
        help_text="Comma-separated weekdays the auto-calendar seeds departures on. Mon=0 … Sun=6. e.g. '5' = Saturdays. Blank = no auto-calendar (slots seeded on demand).",
    )
    schedule_weeks_ahead = models.PositiveSmallIntegerField(
        default=12, help_text="How many weeks ahead the auto-calendar pre-creates empty departures."
    )

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("location"),
                FieldPanel("category"),
                FieldPanel("difficulty"),
                FieldPanel("duration_days"),
                FieldPanel("group_size"),
                FieldPanel("best_season"),
            ],
            heading="Basics",
        ),
        MultiFieldPanel(
            [
                FieldPanel("price_inr"),
                FieldPanel("original_price_inr"),
                FieldPanel("discount_pct"),
            ],
            heading="Pricing",
        ),
        MultiFieldPanel(
            [
                FieldPanel("rating"),
                FieldPanel("review_count"),
            ],
            heading="Ratings (display)",
        ),
        MultiFieldPanel(
            [
                FieldPanel("hero_image"),
                FieldPanel("short_description"),
            ],
            heading="Card / hero",
        ),
        MultiFieldPanel(
            [
                FieldPanel("long_description"),
                FieldPanel("pull_quote"),
                FieldPanel("overview_note"),
            ],
            heading="Detail body",
        ),
        MultiFieldPanel(
            [
                FieldPanel("trip_style"),
                FieldPanel("max_altitude"),
                FieldPanel("daily_walking"),
                FieldPanel("start_end"),
                FieldPanel("min_age"),
                FieldPanel("languages"),
            ],
            heading="At a glance",
        ),
        MultiFieldPanel(
            [
                FieldPanel("min_group"),
                FieldPanel("max_group"),
                FieldPanel("max_groups_per_date"),
                FieldPanel("deposit_pct"),
                FieldPanel("cutoff_days"),
                FieldPanel("departure_weekdays"),
                FieldPanel("schedule_weeks_ahead"),
            ],
            heading="Departures & slots",
        ),
        InlinePanel("itinerary_days", label="Itinerary"),
        InlinePanel("inclusions", label="Inclusions"),
        InlinePanel("exclusions", label="Exclusions"),
        InlinePanel("gallery_images", label="Gallery"),
        InlinePanel("journey_stops", label="Journey map stops"),
        InlinePanel("reviews", label="Reviews"),
        InlinePanel("ratings_breakdown", label="Ratings breakdown (5 rows)"),
        InlinePanel("faqs", label="FAQs"),
    ]

    parent_page_types = ["cms.PackageIndexPage"]
    subpage_types = []

    class Meta:
        verbose_name = "Package"

    @property
    def hero_src(self):
        return _img_url(self.hero_image)


class ItineraryDay(Orderable):
    page = ParentalKey(PackagePage, related_name="itinerary_days", on_delete=models.CASCADE)
    day = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    altitude = models.PositiveIntegerField(help_text="meters", default=0)
    meals = models.CharField(max_length=40, blank=True, help_text="e.g. 'B, L, D'")
    accommodation = models.CharField(max_length=200, blank=True)
    activities = models.JSONField(default=list, help_text="List of activity strings")

    panels = [
        FieldPanel("day"),
        FieldPanel("title"),
        FieldPanel("description"),
        FieldPanel("altitude"),
        FieldPanel("meals"),
        FieldPanel("accommodation"),
        FieldPanel("activities"),
    ]


class Inclusion(Orderable):
    page = ParentalKey(PackagePage, related_name="inclusions", on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    panels = [FieldPanel("text")]


class Exclusion(Orderable):
    page = ParentalKey(PackagePage, related_name="exclusions", on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    panels = [FieldPanel("text")]


class GalleryImage(Orderable):
    page = ParentalKey(PackagePage, related_name="gallery_images", on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to=upload_to_package_gallery,
        null=True, blank=True, max_length=500,
    )
    caption = models.CharField(max_length=200, blank=True)

    panels = [FieldPanel("image"), FieldPanel("caption")]

    @property
    def src(self):
        return _img_url(self.image)


class JourneyStop(Orderable):
    page = ParentalKey(PackagePage, related_name="journey_stops", on_delete=models.CASCADE)
    stop_id = models.CharField(max_length=40, help_text="Stable id, e.g. 's1'")
    name = models.CharField(max_length=120)
    day = models.PositiveIntegerField()
    activity = models.CharField(max_length=200)
    latitude = models.FloatField(
        null=True, blank=True,
        help_text="WGS84 latitude, e.g. 27.7172 for Kathmandu",
    )
    longitude = models.FloatField(
        null=True, blank=True,
        help_text="WGS84 longitude, e.g. 85.3240 for Kathmandu",
    )
    image = models.ImageField(
        upload_to=upload_to_journey_stop,
        null=True, blank=True, max_length=500,
        help_text="Photo shown in a lightbox when the user clicks this stop's marker on the map.",
    )
    panorama = models.ImageField(
        upload_to=upload_to_journey_stop_panorama,
        null=True, blank=True, max_length=500,
        help_text="Equirectangular 360° photo (2:1 ratio, e.g. 4096×2048). Shown as an interactive panorama when the marker is clicked.",
    )
    panorama_url = models.URLField(
        blank=True, max_length=2000,
        help_text="Alternative to uploading: paste a Google Maps Street View / photo-sphere link (the full maps.google URL) and the 360° image is pulled out automatically. A direct equirectangular image URL also works. Used only when no panorama is uploaded above.",
    )

    panels = [
        FieldPanel("stop_id"),
        FieldPanel("name"),
        FieldPanel("day"),
        FieldPanel("activity"),
        FieldPanel("latitude"),
        FieldPanel("longitude"),
        FieldPanel("image"),
        FieldPanel("panorama"),
        FieldPanel("panorama_url"),
    ]

    @property
    def image_src(self):
        return self.image.url if self.image and self.image.name else ""

    @property
    def panorama_src(self):
        if self.panorama and self.panorama.name:
            return self.panorama.url
        url = self.panorama_url or ""
        if "google." in url and "/maps" in url:
            extracted = _google_maps_pano_to_equirect(url)
            if extracted:
                return extracted
        return url


class PackageReview(Orderable):
    page = ParentalKey(PackagePage, related_name="reviews", on_delete=models.CASCADE)
    review_id = models.CharField(max_length=40, help_text="Stable id, e.g. 'r1'")
    author = models.CharField(max_length=120)
    location = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(
        upload_to=upload_to_package_review_avatar,
        null=True, blank=True, max_length=500,
    )
    rating = models.PositiveSmallIntegerField(default=5)
    date = models.CharField(max_length=40, help_text="Human-readable, e.g. 'Oct 2025'")
    title = models.CharField(max_length=200)
    body = models.TextField()
    photos = models.JSONField(default=list, help_text="List of photo URLs (optional)")

    panels = [
        FieldPanel("review_id"),
        FieldPanel("author"),
        FieldPanel("location"),
        FieldPanel("avatar"),
        FieldPanel("rating"),
        FieldPanel("date"),
        FieldPanel("title"),
        FieldPanel("body"),
        FieldPanel("photos"),
    ]

    @property
    def avatar_src(self):
        return _img_url(self.avatar)


class RatingsBreakdownRow(Orderable):
    page = ParentalKey(PackagePage, related_name="ratings_breakdown", on_delete=models.CASCADE)
    stars = models.PositiveSmallIntegerField()
    pct = models.PositiveSmallIntegerField(help_text="0-100")

    panels = [FieldPanel("stars"), FieldPanel("pct")]


class FAQItem(Orderable):
    page = ParentalKey(PackagePage, related_name="faqs", on_delete=models.CASCADE)
    question = models.CharField(max_length=300)
    answer = models.TextField()

    panels = [FieldPanel("question"), FieldPanel("answer")]


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------


class BlogIndexPage(HeadlessPreviewMixin, Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    subpage_types = ["cms.BlogPostPage"]
    max_count = 1

    class Meta:
        verbose_name = "Blog index"


class BlogPostPage(HeadlessPreviewMixin, Page):
    category = models.CharField(max_length=20, choices=BLOG_CATEGORY_CHOICES)
    author = models.ForeignKey(
        TeamMember,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="blog_posts",
    )
    publish_date = models.DateField(help_text="Used as the canonical date")
    reading_time = models.PositiveSmallIntegerField(default=5, help_text="Minutes")
    cover_image = models.ImageField(
        upload_to=upload_to_blog_cover,
        null=True, blank=True, max_length=500,
    )
    excerpt = models.TextField()
    pull_quote = models.TextField(blank=True)
    featured = models.BooleanField(default=False)

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("category"),
                FieldPanel("author"),
                FieldPanel("publish_date"),
                FieldPanel("reading_time"),
                FieldPanel("featured"),
            ],
            heading="Meta",
        ),
        MultiFieldPanel(
            [
                FieldPanel("cover_image"),
                FieldPanel("excerpt"),
                FieldPanel("pull_quote"),
            ],
            heading="Hero / excerpt",
        ),
        InlinePanel("paragraphs", label="Body paragraphs"),
    ]

    parent_page_types = ["cms.BlogIndexPage"]
    subpage_types = []

    class Meta:
        verbose_name = "Blog post"

    @property
    def cover_src(self):
        return _img_url(self.cover_image)


class BlogParagraph(Orderable):
    page = ParentalKey(BlogPostPage, related_name="paragraphs", on_delete=models.CASCADE)
    text = models.TextField()

    panels = [FieldPanel("text")]


# ---------------------------------------------------------------------------
# Site-wide settings (contact info, WhatsApp/phone for the chat bubble, etc.)
# ---------------------------------------------------------------------------


@register_setting
class ContactSettings(BaseSiteSetting):
    business_name = models.CharField(max_length=120, default="Sangam Travels")
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True, help_text="Click-to-call number")
    whatsapp = models.CharField(max_length=40, blank=True, help_text="WhatsApp number")
    address = models.TextField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)

    panels = [
        FieldPanel("business_name"),
        FieldPanel("email"),
        FieldPanel("phone"),
        FieldPanel("whatsapp"),
        FieldPanel("address"),
        FieldPanel("instagram_url"),
        FieldPanel("facebook_url"),
        FieldPanel("twitter_url"),
    ]

    class Meta:
        verbose_name = "Contact & social"
