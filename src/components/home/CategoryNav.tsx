"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MountainSnow, Landmark, Sparkles, Compass, TreePine, Palmtree } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Package, Category } from "@/types";

const CATS: { key: Category; label: string; hint: string; icon: LucideIcon }[] = [
  { key: "Trekking", label: "Trekking", hint: "Peaks & passes", icon: MountainSnow },
  { key: "Cultural", label: "Cultural", hint: "Heritage & cities", icon: Landmark },
  { key: "Spiritual", label: "Spiritual", hint: "Temples & pilgrimage", icon: Sparkles },
  { key: "Adventure", label: "Adventure", hint: "Rafting & rides", icon: Compass },
  { key: "Wildlife", label: "Wildlife", hint: "Jungle safaris", icon: TreePine },
  { key: "Leisure", label: "Leisure", hint: "Lakes & retreats", icon: Palmtree },
];

export function CategoryNav({ packages }: { packages: Package[] }) {
  const counts = packages.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const cats = CATS.filter((c) => (counts[c.key] ?? 0) > 0);

  return (
    <section className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-24">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> Browse by style
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">What kind of journey?</h2>
        </div>
        <Link href="/packages" className="hidden shrink-0 text-sm font-semibold text-ink underline-offset-4 hover:underline dark:text-white sm:inline">
          View all trips →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {cats.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/packages?category=${c.key}`}
                className="group flex h-full flex-col items-center justify-center gap-2.5 rounded-3xl border border-line bg-white px-4 py-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-crimson/30 hover:shadow-lift dark:border-white/10 dark:bg-white/5"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand text-ink transition-colors group-hover:bg-ink group-hover:text-white dark:bg-white/10 dark:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <span className="font-serif text-base leading-tight text-ink dark:text-white">{c.label}</span>
                <span className="text-[11px] text-muted">{counts[c.key]} trip{counts[c.key] === 1 ? "" : "s"} · {c.hint}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
