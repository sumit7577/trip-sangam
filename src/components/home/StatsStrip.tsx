"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";

const stats = [
  { value: 500, suffix: "+", label: "Travelers hosted" },
  { value: 12, suffix: "", label: "Destinations" },
  { value: 4.9, suffix: "★", label: "Average rating", decimals: 1 },
  { value: 2018, label: "Established", separator: false },
];

export function StatsStrip() {
  return (
    <section className="relative z-10 -mt-12 px-5 md:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-ink/8 bg-white p-2 shadow-lift">
        <div className="grid grid-cols-2 divide-x divide-ink/8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 py-6 text-center md:px-8 md:py-8"
            >
              <p className="font-serif text-3xl tracking-tight md:text-5xl">
                {s.prefix && <span className="text-base text-muted">{s.prefix}</span>}
                <CountUp
                  to={s.value}
                  suffix={s.suffix ?? ""}
                  decimals={s.decimals ?? 0}
                  separator={s.separator ?? true}
                />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted md:text-sm md:tracking-wider">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
