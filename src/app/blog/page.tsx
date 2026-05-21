import type { Metadata } from "next";
import Image from "next/image";
import { BlogList } from "@/components/blog/BlogList";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Field Notes · Sangam Trails",
  description:
    "Editorial dispatches from our guides — trekking essays, cultural notes, practical tips, and stories from the trail.",
};

export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <BlogList />
      <Newsletter />
    </>
  );
}

function BlogHero() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="absolute inset-0 animate-ken-burns">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85"
          alt="Rhododendron forest, Langtang"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative mx-auto flex min-h-[56vh] max-w-5xl flex-col items-start justify-end px-5 pb-14 pt-32 text-white md:px-8 md:pb-20 md:pt-40">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Journal
        </span>
        <h1 className="balance mt-6 max-w-3xl font-serif text-[clamp(2.25rem,6.5vw,4.75rem)] font-light leading-[0.98] tracking-tight">
          Field <em className="italic text-champagne">notes.</em>
        </h1>
        <p className="pretty mt-4 max-w-xl text-base text-white/80 md:text-lg">
          Slow, considered writing from the people who walk our routes — guides on the trail, designers in
          Kathmandu, and the occasional traveler we couldn't stop quoting.
        </p>
      </div>
    </section>
  );
}
