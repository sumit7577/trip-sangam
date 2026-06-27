# SEO Audit — tripsangam.com (TripSangam Travels)

_Audited and implemented: 2026-06-27. Framework: **Next.js 14.2.5 (App Router)**, hybrid **SSR/SSG + ISR** (`output: standalone`, `trailingSlash: true`), data from a Django/Wagtail API, deployed on AWS EC2 behind nginx-proxy._

## Public routes
`/`, `/packages/`, `/packages/[slug]/`, `/blog/`, `/blog/[slug]/`, `/about/`, `/contact/` (new), `/nepal-tour-packages/` (new), `/nepal-tour-package-from-raxaul/` (new), `/raxaul-to-kathmandu-travel/` (new). Private/utility: `/account/`, `/trips/`, `/trips/[id]/`, `/preview/` (now `noindex`).

## Findings & fixes

| # | Issue | Severity | Affected file | Solution | Fixed |
|---|-------|----------|---------------|----------|-------|
| 1 | `robots.ts` fallback domain was `himalayan-trails.example.com` — wrong host if env unset | Critical | `src/app/robots.ts` | Import `SITE_URL` from central `lib/seo` (defaults to `https://tripsangam.com`) | ✅ |
| 2 | No `metadataBase` → OG/canonical relative URLs couldn't resolve to absolute | Critical | `src/app/layout.tsx` | Added `metadataBase: new URL(SITE_URL)` | ✅ |
| 3 | No canonical tags on any page | High | all pages | `alternates.canonical` via `pageMeta()` helper + per-page `path` | ✅ |
| 4 | Sitemap URLs had **no trailing slash** but site uses `trailingSlash: true` → every sitemap URL 308-redirected | High | `src/app/sitemap.ts` | All URLs now trailing-slashed; added new pages | ✅ |
| 5 | No structured data (Organization / LocalBusiness / Breadcrumb / FAQ) | High | site-wide | `lib/seo` JSON-LD builders + `<JsonLd>`; TravelAgency+WebSite on home/contact, BreadcrumbList on landing+package pages, FAQPage on home+landing pages | ✅ |
| 6 | Homepage title/desc generic (“Where the Sky Begins”), no Raxaul keywords | High | `layout.tsx`, `page.tsx` | Title “Nepal Tour Packages from Raxaul \| TripSangam Travels” + keyword description | ✅ |
| 7 | No `<h1>` with the target keyword on homepage (only the editorial hero h1) | High | `HomeIntro.tsx`, `Hero.tsx` | Hero demoted to non-heading; single H1 “Nepal Tour Packages from Raxaul” in a new intro section | ✅ |
| 8 | No Twitter card / default OG image | Medium | `layout.tsx` | Default `twitter` card + `openGraph.images` (brand image) | ✅ |
| 9 | Private pages (`/account`, `/trips`, `/preview`) indexable | Medium | new `layout.tsx` per route | `robots: { index:false, follow:false }` + robots.txt disallow | ✅ |
| 10 | No contact page / NAP | High | `src/app/contact/page.tsx` (new) | NAP, click-to-call, WhatsApp form, LocalBusiness schema | ✅ |
| 11 | No keyword landing pages for primary searches | High | 3 new pages | `/raxaul-to-kathmandu-travel/`, `/nepal-tour-package-from-raxaul/`, `/nepal-tour-packages/` | ✅ |
| 12 | No favicon / web manifest | Medium | `layout.tsx`, `manifest.ts` | `icons` (logo) + `app/manifest.ts` | ✅ |
| 13 | Package title used “·” + brand duplication, no canonical | Medium | `packages/[slug]/page.tsx` | `pageMeta()` with canonical, OG image = hero, cleaner title | ✅ |
| 14 | About/Blog/Packages titles inconsistent, no canonical | Medium | those pages | Migrated to `pageMeta()` + title template | ✅ |
| 15 | robots.txt only blocked `/api/` | Low | `robots.ts` | Also disallow `/account/`, `/trips/`, `/preview/` | ✅ |
| 16 | Sitemap missing key pages (packages hub, contact, landing pages) | Medium | `sitemap.ts` | Added all canonical public URLs | ✅ |

## Verified-good (no change needed)
- HTTPS enforced by proxy; content is server-rendered (Google sees text without JS).
- `next/image` used across the app (responsive, lazy by default; hero is `priority`).
- `trailingSlash: true` is consistent — canonicals/sitemap now match it.

## Not changed (needs business-owner confirmation — see chat)
- Existing claims already in the site (“since 2018”, guide counts, ratings) were left as-is; **no AggregateRating/Review schema added** (avoids fake-rating risk).
- No street address, business hours, prices, durations or meal inclusions were invented. Package facts come from the existing CMS.
- About-page body copy not rewritten (only metadata) — a deeper About rewrite needs confirmed business history.

## Open items / next
- Optional travel-guide blog posts (Raxaul–Birgunj border guide, documents for Indians, best time to visit) — these live in the Wagtail CMS; can be added there or as static guide routes.
- Submit sitemap + verify domain in Google Search Console (see `SEARCH-CONSOLE-CHECKLIST.md`).
