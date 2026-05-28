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

from app.BunnyStorage import BunnyStorage
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


def _img_url(field):
    return field.url if field and field.name else ""


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
    photo = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)
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

    def createFileImage(self):
        return f"team/{self.slug}/"

    def save(self, *args, **kwargs):
        if self.photo:
            self.photo.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

    @property
    def photo_src(self):
        return _img_url(self.photo)


@register_snippet
class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    avatar = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)
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

    def createFileImage(self):
        # pk is None on first save — file lands in `_new/` and moves to the
        # numbered dir on the next save (mirrors allcoachingAdmin's pattern
        # for models without a PublicId primary key).
        return f"testimonial/{self.pk or '_new'}/"

    def save(self, *args, **kwargs):
        if self.avatar:
            self.avatar.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

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
    hero_image = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)

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

    def createFileImage(self):
        return "home/"

    def save(self, *args, **kwargs):
        if self.hero_image:
            self.hero_image.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

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
    hero_image = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)

    content_panels = Page.content_panels + [
        FieldPanel("hero_image"),
        FieldPanel("body"),
    ]

    def createFileImage(self):
        return f"pages/{self.slug}/"

    def save(self, *args, **kwargs):
        if self.hero_image:
            self.hero_image.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)


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

    hero_image = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)
    short_description = models.TextField()

    long_description = models.TextField(blank=True)
    pull_quote = models.TextField(blank=True)

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
            ],
            heading="Detail body",
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

    def createFileImage(self):
        return f"package/{self.slug}/hero/"

    def save(self, *args, **kwargs):
        if self.hero_image:
            self.hero_image.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

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
    image = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)
    caption = models.CharField(max_length=200, blank=True)

    panels = [FieldPanel("image"), FieldPanel("caption")]

    def createFileImage(self):
        # `page` is the parent PackagePage (set via ParentalKey before save).
        parent_slug = getattr(self.page, "slug", None) or "_orphan"
        return f"package/{parent_slug}/gallery/"

    def save(self, *args, **kwargs):
        if self.image:
            self.image.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

    @property
    def src(self):
        return _img_url(self.image)


class JourneyStop(Orderable):
    page = ParentalKey(PackagePage, related_name="journey_stops", on_delete=models.CASCADE)
    stop_id = models.CharField(max_length=40, help_text="Stable id, e.g. 's1'")
    name = models.CharField(max_length=120)
    day = models.PositiveIntegerField()
    activity = models.CharField(max_length=200)
    x = models.FloatField(help_text="Normalized 0..1 inside Nepal SVG viewBox")
    y = models.FloatField(help_text="Normalized 0..1 inside Nepal SVG viewBox")

    panels = [
        FieldPanel("stop_id"),
        FieldPanel("name"),
        FieldPanel("day"),
        FieldPanel("activity"),
        FieldPanel("x"),
        FieldPanel("y"),
    ]


class PackageReview(Orderable):
    page = ParentalKey(PackagePage, related_name="reviews", on_delete=models.CASCADE)
    review_id = models.CharField(max_length=40, help_text="Stable id, e.g. 'r1'")
    author = models.CharField(max_length=120)
    location = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)
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

    def createFileImage(self):
        parent_slug = getattr(self.page, "slug", None) or "_orphan"
        return f"package/{parent_slug}/reviews/"

    def save(self, *args, **kwargs):
        if self.avatar:
            self.avatar.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

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
    cover_image = models.ImageField(storage=BunnyStorage(), null=True, blank=True, max_length=500)
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

    def createFileImage(self):
        return f"blog/{self.slug}/"

    def save(self, *args, **kwargs):
        if self.cover_image:
            self.cover_image.storage = BunnyStorage(self.createFileImage())
        super().save(*args, **kwargs)

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
