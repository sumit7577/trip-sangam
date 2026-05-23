import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PackageDetail } from "@/types";
import { getPackage, getPackages } from "@/lib/api";
import { HeroSlider } from "@/components/detail/HeroSlider";
import { JourneyMap } from "@/components/detail/JourneyMap";
import { PackageHeader } from "@/components/detail/PackageHeader";
import { BookingCard } from "@/components/detail/BookingCard";
import { TabsSection } from "@/components/detail/TabsSection";
import { OfferBanner } from "@/components/detail/OfferBanner";
import { SimilarPackages } from "@/components/detail/SimilarPackages";
import { FinalCTA } from "@/components/detail/FinalCTA";
import { MobileBookingBar } from "@/components/detail/MobileBookingBar";
import { CarStrip } from "@/components/ui/CarStrip";

const FALLBACK_BODY_SLUG = "annapurna-circuit";

export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const base = await getPackage(params.slug);
  if (!base) return { title: "Not found" };
  return {
    title: `${base.name} · ${base.durationDays} days · Trip Sangam`,
    description: base.shortDescription,
    openGraph: {
      title: base.name,
      description: base.shortDescription,
      images: [{ url: base.heroImage, width: 1600, height: 1000, alt: base.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: base.name,
      description: base.shortDescription,
      images: [base.heroImage],
    },
  };
}

/** Use the slug's own body if filled in; otherwise reuse annapurna-circuit's body. */
function withBody(base: PackageDetail, fallback: PackageDetail | null): PackageDetail {
  if (base.itinerary.length > 0) return base;
  if (!fallback) return base;
  return {
    ...fallback,
    // Header/card data wins from `base`:
    slug: base.slug,
    name: base.name,
    location: base.location,
    category: base.category,
    difficulty: base.difficulty,
    durationDays: base.durationDays,
    groupSize: base.groupSize,
    rating: base.rating,
    reviewCount: base.reviewCount,
    priceINR: base.priceINR,
    originalPriceINR: base.originalPriceINR,
    discountPct: base.discountPct,
    bestSeason: base.bestSeason,
    heroImage: base.heroImage,
    shortDescription: base.shortDescription,
  };
}

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const [base, packages, fallback] = await Promise.all([
    getPackage(params.slug),
    getPackages(),
    params.slug === FALLBACK_BODY_SLUG ? Promise.resolve(null) : getPackage(FALLBACK_BODY_SLUG),
  ]);
  if (!base) notFound();
  const pkg = withBody(base, fallback);

  return (
    <>
      <div className="h-[var(--header-h)]" />
      <HeroSlider images={pkg.galleryImages.slice(0, 6)} title={pkg.name} />

      <PackageHeader pkg={pkg} />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-8">
            <TabsSection pkg={pkg} />
          </div>
          <div className="hidden min-w-0 md:col-span-4 md:block">
            <div className="md:sticky md:top-[calc(var(--header-h)+24px)]">
              <BookingCard pkg={pkg} />
            </div>
          </div>
        </div>
      </div>

      <JourneyMap stops={pkg.journey} />
      <OfferBanner />
      <CarStrip />
      <SimilarPackages currentSlug={pkg.slug} packages={packages} />
      <FinalCTA pkg={pkg} />
      <MobileBookingBar pkg={pkg} />
    </>
  );
}
