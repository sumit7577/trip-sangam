"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Clock, Users, Star, ArrowUpRight } from "lucide-react";
import type { Package } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency, formatPrice } from "@/lib/currency";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// All restrained luxury tones — no bright defaults
const categoryColor: Record<Package["category"], string> = {
  Trekking: "bg-crimson",
  Cultural: "bg-gold",
  Adventure: "bg-mountain",
  Spiritual: "bg-ink",
  Wildlife: "bg-jade",
  Leisure: "bg-coral",
};

const difficultyTone: Record<Package["difficulty"], "green" | "gold" | "crimson"> = {
  Easy: "green",
  Moderate: "gold",
  Challenging: "crimson",
};

export function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const { has, toggle } = useWishlist();
  const { currency } = useCurrency();
  const saved = has(pkg.slug);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full min-w-0"
    >
      <Link href={`/packages/${pkg.slug}`} className="block h-full">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="flex h-full flex-col overflow-hidden rounded-3xl border border-line/70 bg-white shadow-soft transition-shadow duration-500 group-hover:shadow-lift"
        >
          {/* Image — fixed 4:3 ratio, always landscape, suits mountain photos */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={pkg.heroImage}
                alt={pkg.name}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.div>
            {/* Quiet bone wash on hover */}
            <div className="absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/5" />

            {/* Top-left floating chips */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <Badge tone={difficultyTone[pkg.difficulty]} className="bg-white/95 shadow-soft backdrop-blur">
                {pkg.difficulty}
              </Badge>
              {pkg.discountPct >= 20 && (
                <span className="inline-flex w-fit items-center rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-white ring-1 ring-white/30">
                  −{pkg.discountPct}%
                </span>
              )}
            </div>

            {/* Top-right heart */}
            <button
              onClick={(e) => {
                e.preventDefault();
                const wasSaved = saved;
                toggle(pkg.slug);
                toast(wasSaved ? "Removed from wishlist" : `${pkg.name} saved`, "success");
              }}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition-transform hover:scale-110"
            >
              <motion.span animate={saved ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                <Heart className={cn("h-4 w-4 transition-colors", saved ? "fill-crimson text-crimson" : "text-ink")} />
              </motion.span>
            </button>
          </div>

          {/* Content — fluid height, all cards equal height via grid h-full */}
          <div className="flex flex-1 flex-col gap-4 p-6">
            {/* Category */}
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", categoryColor[pkg.category])} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{pkg.category}</span>
            </div>

            {/* Title + location */}
            <div className="space-y-1.5">
              <h3 className="font-serif text-[22px] leading-[1.15] tracking-tight text-ink line-clamp-2">
                {pkg.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{pkg.location}</span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span className="font-mono">{pkg.durationDays}d</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                <span className="font-mono">{pkg.groupSize}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="font-mono font-medium text-ink">{pkg.rating}</span>
                <span>({pkg.reviewCount})</span>
              </span>
            </div>

            {/* Spacer pushes price to bottom for equal-height cards */}
            <div className="flex-1" />

            {/* Price + view-arrow */}
            <div className="flex items-end justify-between border-t border-line pt-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">From</p>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold text-crimson">
                    {formatPrice(pkg.priceINR, currency)}
                  </span>
                  <span className="font-mono text-xs text-muted line-through">
                    {formatPrice(pkg.originalPriceINR, currency)}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-ink opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                View
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}
