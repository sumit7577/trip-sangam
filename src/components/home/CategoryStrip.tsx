"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, MountainSnow, Landmark, Sparkles, Navigation, TreePine, Palmtree } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: LucideIcon; tint: string };

const ITEMS: Item[] = [
  { label: "All Trips", href: "/packages", icon: Compass, tint: "text-crimson" },
  { label: "Trekking", href: "/packages?category=Trekking", icon: MountainSnow, tint: "text-mountain" },
  { label: "Cultural", href: "/packages?category=Cultural", icon: Landmark, tint: "text-gold" },
  { label: "Spiritual", href: "/packages?category=Spiritual", icon: Sparkles, tint: "text-crimson" },
  { label: "Adventure", href: "/packages?category=Adventure", icon: Navigation, tint: "text-jade" },
  { label: "Wildlife", href: "/packages?category=Wildlife", icon: TreePine, tint: "text-jade" },
  { label: "Leisure", href: "/packages?category=Leisure", icon: Palmtree, tint: "text-gold" },
];

/**
 * Slim, animated "browse by style" icon strip — quick category access right
 * under the hero. Icons gently float; the row scrolls horizontally on mobile.
 */
export function CategoryStrip() {
  return (
    <section className="relative z-10 border-y border-line/70 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto max-w-7xl px-2 md:px-8">
        <div className="flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] md:justify-center md:gap-3 [&::-webkit-scrollbar]:hidden">
          {ITEMS.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={it.href}
                  className="group flex min-w-[74px] shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2.5 py-1.5 transition-colors hover:bg-sand dark:hover:bg-white/5"
                >
                  <motion.span
                    animate={{ y: [0, -3.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-sand text-ink shadow-soft transition-all group-hover:-translate-y-0.5 group-hover:bg-ink group-hover:text-white group-hover:shadow-glow dark:bg-white/10 dark:text-white"
                  >
                    <Icon className={cn("h-5 w-5 transition-colors group-hover:text-white", it.tint)} strokeWidth={1.6} />
                  </motion.span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-ink/70 transition-colors group-hover:text-ink dark:text-white/70 dark:group-hover:text-white">
                    {it.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
