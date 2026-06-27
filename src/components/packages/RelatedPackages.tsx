import { PackageCard } from "@/components/home/PackageCard";
import type { Package } from "@/types";

export function RelatedPackages({
  packages,
  heading,
  intro,
}: {
  packages: Package[];
  heading: string;
  intro?: string;
}) {
  if (!packages.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{heading}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p, i) => (
          <PackageCard key={p.slug} pkg={p} index={i} />
        ))}
      </div>
    </section>
  );
}
