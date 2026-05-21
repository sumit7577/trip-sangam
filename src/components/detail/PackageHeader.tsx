"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Mountain, Users, CalendarDays, Star } from "lucide-react";
import type { PackageDetail } from "@/types";

export function PackageHeader({ pkg }: { pkg: PackageDetail }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-14">
      <motion.nav
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-xs text-muted"
      >
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/#packages" className="hover:text-ink">Treks</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{pkg.name}</span>
      </motion.nav>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="balance mt-6 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-7xl"
      >
        {pkg.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="pretty mt-4 max-w-2xl text-lg text-muted"
      >
        {pkg.shortDescription}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mt-8 border-y border-ink/8 py-5 text-sm"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 md:flex md:flex-wrap md:items-center md:gap-6">
          <Stat icon={<Clock className="h-4 w-4" />} label="Duration" value={`${pkg.durationDays} days`} />
          <Stat icon={<Mountain className="h-4 w-4" />} label="Difficulty" value={pkg.difficulty} />
          <Stat icon={<Users className="h-4 w-4" />} label="Group" value={pkg.groupSize} />
          <Stat icon={<CalendarDays className="h-4 w-4" />} label="Best season" value={pkg.bestSeason} />
          <div className="col-span-2 mt-1 flex items-center gap-2 border-t border-ink/8 pt-4 sm:col-span-4 md:ml-auto md:mt-0 md:border-0 md:pt-0">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <span className="font-medium">{pkg.rating}</span>
            <a href="#reviews" className="text-muted underline-offset-4 hover:underline">
              {pkg.reviewCount} reviews
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-crimson">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
