import type { Metadata } from "next";
import { getPackages } from "@/lib/api";
import { PackagesBrowser } from "@/components/packages/PackagesBrowser";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Browse All Nepal Trips & Tour Packages",
  description:
    "Browse and filter every Nepal tour package from TripSangam — trekking, cultural, spiritual and wildlife journeys. Filter by category, duration and price.",
  path: "/packages/",
});

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string; duration?: string };
}) {
  const packages = await getPackages();

  return (
    <main className="min-h-screen bg-sand pb-24 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto mb-10 max-w-7xl px-5 md:px-8">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
          <span className="h-px w-8 bg-crimson" /> Find your journey
        </p>
        <h1 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
          {searchParams.q ? <>Trips matching “{searchParams.q}”</> : <>Every Sangam departure</>}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted md:text-base">
          {packages.length} curated journeys across Nepal — filter by category, length and budget to find the one that fits.
        </p>
      </header>

      <PackagesBrowser packages={packages} initial={searchParams} />
    </main>
  );
}
