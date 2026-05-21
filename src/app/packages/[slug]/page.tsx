import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { annapurnaDetail } from "@/data/annapurna";
import { packages, getPackage } from "@/data/packages";
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

export function generateStaticParams() {
  // Pre-render every package slug so cards always land on a valid page
  return packages.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  // We only have full editorial copy for Annapurna; other slugs reuse it.
  // Metadata uses the *shallow* package for accurate title / description per slug.
  const base = getPackage(params.slug);
  if (!base) return { title: "Not found" };
  return {
    title: `${base.name} · ${base.durationDays} days · Sangam Trails`,
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

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  // Prototype: only annapurna-circuit has the long-form detail data.
  // Other slugs render Annapurna's detail body, but the header/CTA show the right name + price.
  const base = getPackage(params.slug);
  if (!base) notFound();

  const pkg = params.slug === annapurnaDetail.slug
    ? annapurnaDetail
    : { ...annapurnaDetail, ...base };

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
      <SimilarPackages currentSlug={pkg.slug} />
      <FinalCTA pkg={pkg} />
      <MobileBookingBar pkg={pkg} />
    </>
  );
}
