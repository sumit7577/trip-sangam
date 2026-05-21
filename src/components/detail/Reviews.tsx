"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { PackageDetail } from "@/types";

export function Reviews({ pkg }: { pkg: PackageDetail }) {
  return (
    <div id="reviews">
      <div className="mb-10 max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl">Traveler reviews</h2>
        <p className="pretty mt-2 text-muted">Verified, post-trip reviews from real travelers.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 rounded-3xl border border-ink/8 bg-white p-6 sm:p-7 md:grid-cols-12 md:gap-12 md:p-10">
        <div className="min-w-0 md:col-span-4">
          <div className="flex items-end gap-2">
            <span className="font-serif text-6xl tracking-tight">{pkg.rating}</span>
            <span className="mb-2 text-sm text-muted">/ 5.0</span>
          </div>
          <div className="mt-2 flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
          </div>
          <p className="mt-1 text-sm text-muted">{pkg.reviewCount} verified reviews</p>

          <div className="mt-6 space-y-2">
            {pkg.ratingsBreakdown.map((b) => (
              <div key={b.stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-mono">{b.stars}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-crimson"
                  />
                </div>
                <span className="w-10 font-mono text-muted">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="min-w-0 space-y-7 md:col-span-8">
          {pkg.reviews.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ delay: i * 0.08 }}
              className="border-b border-ink/8 pb-7 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <Image
                  src={r.avatar}
                  alt={r.author}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-medium">{r.author}</p>
                    <p className="text-xs text-muted">· {r.location}</p>
                    <p className="ml-auto text-xs text-muted">{r.date}</p>
                  </div>
                  <div className="mt-1 flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3.5 w-3.5 ${j < r.rating ? "fill-gold text-gold" : "text-ink/15"}`}
                      />
                    ))}
                  </div>
                  <h4 className="mt-3 font-serif text-lg">{r.title}</h4>
                  <p className="pretty mt-1 text-sm leading-relaxed text-muted">{r.body}</p>
                  {r.photos && (
                    <div className="mt-3 flex gap-2">
                      {r.photos.map((p, k) => (
                        <div key={k} className="relative h-16 w-16 overflow-hidden rounded-xl">
                          <Image src={p} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
