# Sangam Travels — Backend (Django + Wagtail)

Headless CMS for the Sangam Travels tourism site. Manages packages, blog posts,
team, testimonials, and homepage content via the Wagtail admin and exposes them
as JSON to the Next.js frontend in `../src/`.

## Stack

- **Python 3.12+**, Django 5.1, Wagtail 6.3
- **DRF** for custom API endpoints shaped to match the existing TS types in `../src/types/`
- **django-cors-headers** so Next.js (`localhost:3000`) can fetch
- SQLite for dev; swap to Postgres in production by setting `DATABASES`

## Quick start

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env                # edit DJANGO_SECRET_KEY for real use
python manage.py migrate
python manage.py seed_data          # imports content from src/data/*.ts mirror
python manage.py createsuperuser    # for the Wagtail admin
python manage.py runserver
```

- Wagtail admin: http://localhost:8000/admin/
- Django admin (bookings): http://localhost:8000/django-admin/
- API root: http://localhost:8000/api/

Re-seed (wipes existing pages/snippets first):

```bash
python manage.py seed_data --wipe
```

## API endpoints

All endpoints return JSON with **camelCase keys matching `src/types/index.ts`** so
the Next.js side can drop them straight into existing interfaces.

| Endpoint | Returns | Matches TS type |
|---|---|---|
| `GET /api/packages/` | List of package summaries | `Package[]` |
| `GET /api/packages/<slug>/` | Full package detail | `PackageDetail` |
| `GET /api/blog/` | List of blog posts | `BlogPost[]` |
| `GET /api/blog/<slug>/` | Single blog post | `BlogPost` |
| `GET /api/team/` | Guides | `TeamMember[]` |
| `GET /api/testimonials/` | Testimonials | `Testimonial[]` |
| `GET /api/homepage/` | Consolidated homepage payload (hero, stats, featured packages, testimonials, contact) | — |

Plus Wagtail's built-in API (raw page tree, useful for debugging):

| Endpoint | What |
|---|---|
| `GET /api/v2/pages/` | All published pages |
| `GET /api/v2/images/` | Uploaded images with renditions |
| `GET /api/v2/documents/` | Uploaded documents |

## How the Next.js frontend will consume this

Replace imports in the Next.js side. For example:

```ts
// before — src/app/page.tsx
import { packages } from "@/data/packages";

// after
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages/`, {
  next: { revalidate: 300 },   // ISR: re-fetch every 5 min
});
const packages: Package[] = await res.json();
```

Set in the Next.js side's `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Content model overview

### Page tree

```
Root
└── HomePage (singleton, slug=home)
    ├── PackageIndexPage (singleton, slug=packages)
    │   └── PackagePage × N  (one per tour)
    ├── BlogIndexPage (singleton, slug=blog)
    │   └── BlogPostPage × N
    └── GenericPage × N  (about, privacy, terms…)
```

### Snippets (Wagtail admin → Snippets)

- `TeamMember` — guide profiles, referenced from blog posts
- `Testimonial` — homepage carousel quotes

### Site settings (Wagtail admin → Settings → Contact & social)

- `ContactSettings` — business email, phone, WhatsApp, social URLs

### `PackagePage` inline children (edit on the page itself)

- Itinerary days, inclusions, exclusions, gallery images, journey-map stops,
  reviews, ratings breakdown, FAQs

## Images

Every image field comes as a pair:

- `*_image` — uploaded Wagtail image (preferred; gets renditions)
- `*_image_url` — fallback URL (used by the initial seed for Unsplash sources)

The serializer returns the Wagtail rendition URL if uploaded, otherwise the URL
field. This lets us seed quickly without downloading 50+ Unsplash assets and
upgrade individual images later via the admin.

### Bunny CDN storage

Uploaded images, documents, and any other file fields go to **Bunny CDN Storage**
via `app/BunnyStorage.py` (mirrors the class used by the allcoaching project).
The storage backend is wired in `settings.STORAGES` and falls back to local
`MEDIA_ROOT` when no Bunny credentials are configured — so dev keeps working
without keys.

To enable Bunny, set in `.env`:

```bash
BUNNY_STORAGE_ZONE_NAME=your-zone-name
BUNNY_STORAGE_ACCESS_KEY=your-access-key
BUNNY_STORAGE_PUBLIC_HOST=your-zone.b-cdn.net
BUNNY_STORAGE_API_HOST=storage.bunnycdn.com    # or sg.storage.bunnycdn.com etc.
BUNNY_STORAGE_DIRECTORY=sangam/                # path prefix inside the zone
```

Grab the zone name, access key, and pull-zone hostname from Bunny dashboard →
Storage → your zone → FTP & API Access.

## Bookings (Phase 2)

The `bookings` app contains a `BookingInquiry` model that's already admin-editable
at `/django-admin/`. The API endpoint (`POST /api/bookings/`) and the user-facing
auth/login are not yet wired — that's the next phase.

When ready:
- Add `BookingInquirySerializer` + create-only viewset to `api/`
- Add a custom `User` model + DRF session-auth endpoints
- Wire the Next.js `BookingModal` submit to `POST /api/bookings/inquiry/`

## Production checklist (when you deploy)

- [ ] Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, real `DJANGO_ALLOWED_HOSTS`
- [ ] Switch to Postgres in `DATABASES`
- [ ] Set `WAGTAILADMIN_BASE_URL` and `CORS_ALLOWED_ORIGINS` to real domains
- [ ] Run `python manage.py collectstatic`
- [ ] Configure a media backend (S3 / R2) — `DEFAULT_FILE_STORAGE` + `django-storages`
- [ ] Put Nginx/Caddy in front; gunicorn for WSGI

## Layout

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── sangam/             # Django project: settings, urls, wsgi, asgi
├── cms/                # Wagtail page models + snippets + seed command
│   └── management/commands/seed_data.py
├── api/                # DRF serializers + viewsets matching TS types
└── bookings/           # BookingInquiry model (Phase 2 placeholder)
```
