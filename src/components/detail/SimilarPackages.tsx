"use client";

import { packages } from "@/data/packages";
import { PackageCard } from "@/components/home/PackageCard";

export function SimilarPackages({ currentSlug }: { currentSlug: string }) {
  const list = packages.filter((p) => p.slug !== currentSlug).slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 md:px-8 md:py-24">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> More from us
          </p>
          <h2 className="balance mt-3 font-serif text-3xl tracking-tight md:text-4xl">
            You might also like
          </h2>
        </div>
      </div>

      <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 md:-mx-8 md:px-8">
        {list.map((pkg, i) => (
          <div key={pkg.slug} className="w-[80vw] shrink-0 sm:w-[360px]">
            <PackageCard pkg={pkg} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
