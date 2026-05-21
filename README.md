# Himalayan Trails

A production-ready prototype for a Nepal tourism booking platform. Premium, ultra-luxury-minimalist design system. Built with Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, and Zustand.

```text
13 routes prerendered · 87 kB shared JS · all pages static
```

---

## Quick start

```powershell
cd D:/mockups/himalayan-trails
npm install
npm run dev
# open http://localhost:3000
```

### Static HTML export

The project is configured with `output: "export"` in `next.config.js` so every build emits a fully-static bundle to `out/` — pure HTML/CSS/JS, no Node server required.

```powershell
npm run build      # generates out/ — 20 HTML pages, 4.2 MB total
npm run serve      # preview at http://localhost:4000
```

After `npm run build`, you can:

- **Open it directly** — double-click `out/index.html` from your file explorer (works because all routes use trailing-slash + relative paths).
- **Drag-and-drop deploy** — drop the `out/` folder onto Netlify, Cloudflare Pages, or Vercel — they auto-detect a static site.
- **Upload to S3 / Cloudflare R2 / GitHub Pages / any web host.**
- **Serve with nginx / Caddy / Apache.**

```powershell
npm run lint
```

---

## What's in here

| Route | What it is |
|---|---|
| `/` | Homepage — Annapurna hero, search bar (with autocomplete + traveler counter), stats strip, 5-vehicle convoy, package grid, why-us, testimonials marquee, newsletter |
| `/about` | About — Boudha hero, founding story with pull quote, 4-stat row, 4 values, team grid (4 guides), press quotes, newsletter |
| `/blog` | Field-notes index — large featured post, category filters (All / Trekking / Culture / Stories / Tips / Wildlife), 3-col card grid |
| `/blog/[slug]` | Article page — 6 posts pre-rendered, cover image with overlay, author strip, body + optional pull quote, author bio, 3 related posts |
| `/packages/[slug]` | Package detail — hero slider with fullscreen view, package header, sticky booking sidebar, sticky tab nav (Overview / Itinerary / Inclusions / Gallery / Reviews / FAQ), animated SVG journey map, countdown offer banner, 5-vehicle convoy, similar packages, full-bleed final CTA, mobile sticky booking bar |
| `/sitemap.xml` | Auto-generated sitemap (3 static + 9 packages + 6 blog posts) |
| `/robots.txt` | Robots policy |
| `/not-found` | Custom 404 (off-the-map editorial) |

`error.tsx` and `loading.tsx` provide root-level error and loading boundaries.

---

## Design system

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1C1C1A` | Espresso — primary text + primary buttons |
| `sand` | `#F2EEE6` | Bone / oat — page background |
| `crimson` | `#2C3D2E` | Loden green — accent (token name kept for backwards-compat) |
| `gold` | `#C9A876` | Champagne brass — highlights on dark backgrounds |
| `mountain` | `#1C2E3D` | Midnight navy — secondary surface |
| `jade` | `#3B5C4B` | Forest — confirmation states, WhatsApp |
| `coral` | `#9B8868` | Camel — subtle accent |
| `line` | `#E2DBCB` | Parchment — hairline dividers |

Header height token: `--header-h: 64px (mobile) / 72px (md+)` — used by sticky tabs + page spacers so everything aligns mathematically across breakpoints.

Type scale:
- Headings: **Fraunces** (serif, editorial)
- Body: **Inter** (sans)
- Numbers / prices / metadata: **JetBrains Mono** (tabular-nums)

---

## Architecture notes

- **Stores (Zustand, persisted to localStorage):**
  `useWishlist` (heart icon state) · `useCurrency` (INR / USD / NPR conversion) · `useModal` (booking + signin modal context) · `useToast` (toast notifications)
- **Modals** mounted once in `app/providers.tsx`; opened from anywhere via `useModal()`
- **Toaster** mounted once globally; fire from anywhere via `toast(message, tone)`
- **Framer Motion**: wrapped in `LazyMotion` (domAnimation only) for smaller bundle; `MotionConfig reducedMotion="user"` respects OS reduced-motion setting

---

## Responsive

Tested at 360 / 390 / 414 / 768 / 1024 / 1280+. The two critical fixes that took the longest:

1. **`html, body { overflow-x: hidden; width: 100%; }`** in `globals.css`. Do NOT use `max-width: 100vw` — on Windows `100vw` includes the scrollbar gutter and pushes content past the visible edge.
2. **`min-w-0` on every grid/flex child that contains text content.** Grid items default to `min-width: auto`, which makes them at least as wide as their intrinsic content (a long sentence), pushing the entire track wider than the container. Setting `min-width: 0` lets them shrink to the track width.

Both pages and every section now honor the visible viewport on every breakpoint with no horizontal scroll.

---

## Production readiness checklist

| | Item |
|---|---|
| ✅ | `npm run build` passes cleanly (13/13 static pages, no TS errors) |
| ✅ | Per-route metadata (title, description, OpenGraph, Twitter card) on every page |
| ✅ | `app/robots.ts` and `app/sitemap.ts` (uses `NEXT_PUBLIC_SITE_URL` env var) |
| ✅ | `app/not-found.tsx` — custom 404 |
| ✅ | `app/error.tsx` — global error boundary |
| ✅ | `app/loading.tsx` — top-edge progress bar during route transitions |
| ✅ | All icon-only buttons have `aria-label` or visible text label |
| ✅ | All `<input>` fields have associated `<label>` |
| ✅ | Reduced-motion respected via `MotionConfig` |
| ✅ | Mobile touch targets ≥ 44 px on critical CTAs (booking, traveler counter, slider arrows) |
| ✅ | Focus rings: 2 px crimson outline with 3 px offset via global `*:focus-visible` |
| ✅ | iOS font-size ≥ 16 px on inputs (prevents auto-zoom on focus) |
| ✅ | `env(safe-area-inset-bottom)` honored on mobile sticky CTA + floating actions |
| ✅ | `next/font` for Fraunces / Inter / JetBrains Mono (no FOUT, self-hosted) |
| ✅ | `next/image` with explicit `sizes` on every image (no oversize downloads) |
| ✅ | `remotePatterns` in `next.config.js` whitelists Unsplash only |

---

## Environment variables

Optional. Sensible fallbacks shipped.

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://himalayan-trails.example.com` | Used by `sitemap.ts` and `robots.ts` to emit absolute URLs |

Create `.env.local` for development:

```ini
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Deploy

The build is **fully static**. `npm run build` produces an `out/` folder of plain HTML + CSS + JS — every host on earth can serve it.

| Host | How |
|---|---|
| **Vercel** | `npx vercel out` (or `npx vercel --prod out`) |
| **Netlify** | drag `out/` onto app.netlify.com/drop, or `netlify deploy --dir=out --prod` |
| **Cloudflare Pages** | connect the repo, set build command `npm run build`, output dir `out` |
| **GitHub Pages** | push `out/` to a `gh-pages` branch (or use the official Pages action) |
| **AWS S3** | `aws s3 sync out/ s3://your-bucket --delete` |
| **Nginx / Apache / Caddy** | point document root at the absolute path to `out/` |
| **File system** | open `out/index.html` directly — no server needed |

Set `NEXT_PUBLIC_SITE_URL` **before** `npm run build` so robots.txt and sitemap.xml carry your real domain.

```powershell
$env:NEXT_PUBLIC_SITE_URL="https://sangamtrails.com"
npm run build
```

---

## File map

```
src/
├── app/
│   ├── layout.tsx                root + fonts + providers
│   ├── globals.css               tokens + overflow guard + utilities
│   ├── providers.tsx             LazyMotion + MotionConfig + modals + toaster
│   ├── page.tsx                  homepage
│   ├── not-found.tsx             404
│   ├── error.tsx                 global error boundary (client)
│   ├── loading.tsx               route-transition progress bar
│   ├── robots.ts                 robots.txt
│   ├── sitemap.ts                sitemap.xml
│   ├── about/page.tsx
│   ├── blog/
│   │   ├── page.tsx              index
│   │   └── [slug]/page.tsx       article (generateStaticParams for all 6 posts)
│   └── packages/[slug]/page.tsx  package detail (generateStaticParams for all 9 slugs)
│
├── components/
│   ├── layout/                   Header, Footer, ChatBubble (floating WhatsApp + Phone)
│   ├── home/                     Hero, StatsStrip, FeaturedPackages, PackageCard, WhyChooseUs, Testimonials, Newsletter
│   ├── about/                    AboutHero, ValuesGrid
│   ├── blog/                     BlogCard, BlogList
│   ├── detail/                   HeroSlider, JourneyMap, PackageHeader, BookingCard, TabsSection,
│   │                              Itinerary, Inclusions, Gallery, Reviews, FAQ, OfferBanner,
│   │                              SimilarPackages, FinalCTA, MobileBookingBar
│   ├── modals/                   ModalShell, BookingModal, SignInModal
│   └── ui/                       Button, Badge, CountUp, SearchBar, Skeleton, Toaster, CarStrip, vehicles
│
├── data/
│   ├── packages.ts               9 package summaries
│   ├── annapurna.ts              full long-form detail (itinerary, gallery, reviews, FAQ, journey)
│   ├── testimonials.ts           6 testimonials
│   ├── team.ts                   4 guide profiles
│   └── blog.ts                   6 articles
│
├── lib/
│   ├── utils.ts                  cn() + formatINR()
│   ├── currency.ts               INR/USD/NPR store + conversion + formatting
│   ├── wishlist.ts               persisted slug list
│   ├── modal.ts                  booking + signin modal store
│   └── toast.ts                  toast store + imperative `toast()` helper
│
└── types/index.ts                Package, PackageDetail, ItineraryDay, Review, JourneyStop, etc.
```

---

## Known prototype limits

- Only `annapurna-circuit` has full long-form detail data. The other 8 package slugs render Annapurna's body but show their own title, price, image, and metadata in the header / CTA / mobile bar. To add a second full detail, copy `src/data/annapurna.ts` to `src/data/<slug>.ts`, populate the long-form fields, and import it in `app/packages/[slug]/page.tsx` with a lookup map.
- Booking and Sign-In modals are visual prototypes — submit handlers fire a toast and reset; there is no real backend.
- All imagery is from Unsplash. For production swap to your own CDN + add real `priority`/`loading` strategy.
- Currency rates in `lib/currency.ts` are static. Hook into a live exchange-rate API for accurate conversion.
```
