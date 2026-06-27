"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Tag } from "lucide-react";
import type { Package } from "@/types";
import { useCurrency, formatPrice } from "@/lib/currency";

export function DealsStrip({ packages }: { packages: Package[] }) {
  const { currency } = useCurrency();
  const deals = [...packages]
    .filter((p) => p.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 8);

  if (deals.length === 0) return null;

  return (
    <section className="bg-ink py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              <Tag className="h-3.5 w-3.5" /> Deals &amp; offers
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">Limited-time departures</h2>
            <p className="mt-2 max-w-md text-sm text-white/60">Lock these in before the group fills — savings drop as seats sell.</p>
          </div>
          <Link href="/packages?sort=price_asc" className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-white/90 underline-offset-4 hover:underline sm:inline-flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
          {deals.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: (i % 4) * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-[260px] shrink-0 snap-start sm:w-[300px]"
            >
              <Link
                href={`/packages/${p.slug}`}
                className="group block overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition-all hover:ring-white/25"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.heroImage}
                    alt={p.name}
                    fill
                    sizes="300px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 font-mono text-[11px] font-bold text-ink shadow-soft">
                    −{p.discountPct}%
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/90">{p.category}</p>
                  <h3 className="mt-1.5 truncate font-serif text-lg leading-tight">{p.name}</h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/55">
                    <Clock className="h-3 w-3" /> {p.durationDays} days · {p.location}
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-lg font-bold text-white">{formatPrice(p.priceINR, currency)}</span>
                    <span className="font-mono text-xs text-white/40 line-through">{formatPrice(p.originalPriceINR, currency)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
