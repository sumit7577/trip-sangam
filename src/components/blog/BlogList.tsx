"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogCategory, BlogPost, TeamMember } from "@/types";
import { BlogCard } from "./BlogCard";
import { cn } from "@/lib/utils";

const filters: ("All" | BlogCategory)[] = ["All", "Trekking", "Culture", "Stories", "Tips", "Wildlife"];

export function BlogList({
  posts,
  authorsBySlug,
}: {
  posts: BlogPost[];
  authorsBySlug: Record<string, TeamMember>;
}) {
  const [active, setActive] = useState<"All" | BlogCategory>("All");

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = useMemo(() => {
    const list = posts.filter((p) => p.slug !== featured.slug);
    return active === "All" ? list : list.filter((p) => p.category === active);
  }, [active, featured.slug, posts]);

  const featuredAuthor = authorsBySlug[featured.authorSlug];

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      {/* Featured */}
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="group min-w-0"
      >
        <Link
          href={`/blog/${featured.slug}`}
          className="grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-line/70 bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift md:grid-cols-2 md:gap-0"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[420px]">
            <Image
              src={featured.coverImage}
              alt={featured.title}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Featured · {featured.category}
            </span>
          </div>

          <div className="flex min-w-0 flex-col justify-center gap-5 p-6 md:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              {featured.date} · {featured.readingTime} min read
            </p>
            <h2 className="balance font-serif text-3xl leading-[1.1] tracking-tight text-ink md:text-4xl">
              {featured.title}
            </h2>
            <p className="pretty line-clamp-3 text-base leading-relaxed text-muted">{featured.excerpt}</p>
            {featuredAuthor && (
              <div className="flex items-center gap-3 pt-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image src={featuredAuthor.photo} alt={featuredAuthor.name} fill sizes="40px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{featuredAuthor.name}</p>
                  <p className="truncate text-xs text-muted">{featuredAuthor.role}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  Read essay <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </Link>
      </motion.article>

      {/* Filters + Grid */}
      <div className="mt-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> Recent dispatches
          </p>
          <h2 className="balance mt-3 font-serif text-3xl tracking-tight md:text-4xl">
            Field notes from the trail<span className="italic text-crimson"> and the teahouse.</span>
          </h2>
        </div>
        <div className="no-scrollbar -mx-5 flex w-screen gap-2 overflow-x-auto px-5 md:mx-0 md:w-auto md:px-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active === f
                  ? "border-transparent bg-ink text-white shadow-glow"
                  : "border-line bg-white text-ink hover:border-ink/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {rest.map((p, i) => (
            <BlogCard key={p.slug} post={p} index={i} author={authorsBySlug[p.authorSlug]} />
          ))}
        </AnimatePresence>
      </motion.div>

      {rest.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted">
          Nothing in this category yet — try another filter.
        </p>
      )}
    </section>
  );
}
