"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { packages } from "@/data/packages";
import { PackageCard } from "./PackageCard";
import { cn } from "@/lib/utils";

const filters = ["All", "Trekking", "Cultural", "Adventure", "Spiritual", "Wildlife"] as const;
type Filter = (typeof filters)[number];

export function FeaturedPackages() {
  const [active, setActive] = useState<Filter>("All");
  const filtered = useMemo(
    () => (active === "All" ? packages : packages.filter((p) => p.category === active)),
    [active]
  );

  return (
    <section id="packages" className="mx-auto max-w-7xl px-5 py-16 sm:py-20 md:px-8 md:py-28">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson"
          >
            <span className="h-px w-8 bg-crimson" /> Handpicked
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl"
          >
            Journeys curated by people<br />
            <span className="italic text-crimson">who walk them.</span>
          </motion.h2>
        </div>

        <div className="no-scrollbar -mx-5 flex w-screen gap-2 overflow-x-auto px-5 md:mx-0 md:w-auto md:px-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                "relative whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active === f
                  ? "border-transparent bg-sunset text-white shadow-glow"
                  : "border-ink/15 bg-white text-ink hover:border-crimson/40 hover:text-crimson"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((pkg, i) => (
            <PackageCard key={pkg.slug} pkg={pkg} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
