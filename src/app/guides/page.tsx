import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const PATH = "/guides/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Travel Guides for Indian Travellers",
  description:
    "Practical Nepal travel guides from TripSangam Travels — documents for Indian citizens, the Raxaul–Birgunj border crossing and the best time to visit Nepal.",
  path: PATH,
});

export default function GuidesHubPage() {
  return (
    <main className="min-h-screen bg-sand pb-20 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Travel Guides", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Travel Guides
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Straightforward, practical guides for travelling to Nepal from India — written for real
          travellers planning a trip from Raxaul and beyond.
        </p>

        <div className="mt-10 space-y-3">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}/`}
              className="group flex items-center justify-between gap-4 rounded-3xl border border-line bg-white p-6 transition-colors hover:border-crimson/30 dark:bg-white/5"
            >
              <span className="min-w-0">
                <span className="font-serif text-xl text-ink dark:text-white">{g.title}</span>
                <span className="mt-1 block text-sm text-muted">{g.excerpt}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
