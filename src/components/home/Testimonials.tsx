"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const loop = [...testimonials, ...testimonials];

  return (
    <section className="overflow-hidden bg-sand py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> Voices
          </p>
          <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
            What our travelers carry home<br />
            <span className="italic text-crimson">that wasn't in their pack.</span>
          </h2>
        </div>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-sand to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-sand to-transparent" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="flex w-max gap-6"
        >
          {loop.map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              className="w-[300px] shrink-0 rounded-3xl border border-line/70 bg-white p-6 shadow-soft sm:w-[360px] md:w-[420px] md:p-7"
            >
              <Quote className="h-6 w-6 text-crimson/30" />
              <p className="pretty mt-3 font-serif text-lg leading-snug text-ink">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-ink/6 pt-4">
                <Avatar src={t.avatar} alt={t.name} size={44} className="h-11 w-11" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted">{t.location} · {t.trip}</p>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
