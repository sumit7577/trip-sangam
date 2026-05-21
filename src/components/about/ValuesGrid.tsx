"use client";

import { motion } from "framer-motion";
import { Users, HandCoins, Clock, Leaf } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "Local-first",
    body: "Every guide, porter and office hire is Nepali. Every itinerary is designed and led by someone born in the region you're visiting.",
  },
  {
    icon: Clock,
    title: "Slow journeys",
    body: "We cap groups at eight, build in true rest days, and walk slower than the brochures. The mountains are not the place to be efficient.",
  },
  {
    icon: HandCoins,
    title: "Fair-wage porters",
    body: "Monthly salaries, full health and rescue insurance, weight limits enforced, warm gear provided. Our porters renew with us year after year.",
  },
  {
    icon: Leaf,
    title: "Carbon-light",
    body: "We offset 120% of every trip — flights included — and have planted two community forests on the Annapurna and Langtang corridors since 2021.",
  },
];

export function ValuesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 md:px-8 md:py-28">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
          <span className="h-px w-8 bg-crimson" /> Our principles
        </p>
        <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
          Four things we won't<span className="italic text-crimson"> compromise on.</span>
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => (
          <motion.article
            key={v.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group min-w-0 rounded-3xl border border-line/70 bg-white p-7 transition-all hover:border-ink/20 hover:shadow-soft"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white transition-transform group-hover:rotate-6 group-hover:scale-110">
              <v.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-serif text-xl tracking-tight">{v.title}</h3>
            <p className="pretty mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
