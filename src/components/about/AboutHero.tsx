"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AboutHero() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="absolute inset-0 animate-ken-burns">
        <Image
          src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=2400&q=85"
          alt="Boudhanath stupa at dawn, Kathmandu"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-grain opacity-15 mix-blend-overlay" />

      <div className="relative mx-auto flex min-h-[68vh] max-w-5xl flex-col items-start justify-end px-5 pb-16 pt-32 text-white md:px-8 md:pb-24 md:pt-40">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          About Trip Sangam
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="balance mt-6 max-w-3xl font-serif text-[clamp(2.5rem,7vw,5.5rem)] font-light leading-[0.95] tracking-tight"
        >
          We grew up in these <em className="italic text-champagne">mountains.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pretty mt-5 max-w-xl text-base text-white/80 md:text-lg"
        >
          A Nepali-owned operator of small-group journeys across the Himalayan belt. Forty-seven guides on
          monthly salaries, group caps of eight, and a 12-week prep plan emailed on the day you book.
        </motion.p>
      </div>
    </section>
  );
}
