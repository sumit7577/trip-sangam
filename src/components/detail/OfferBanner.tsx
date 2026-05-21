"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function calcRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

export function OfferBanner() {
  // Stable target — 21 days from first render. useMemo ensures it doesn't move
  // on every re-render (which would also defeat the countdown).
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d;
  }, []);
  const [t, setT] = useState(() => calcRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setT(calcRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: [string, number][] = [
    ["Days", t.d],
    ["Hrs", t.h],
    ["Min", t.m],
    ["Sec", t.s],
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white md:p-10"
      >
        {/* Subtle hairline frame in champagne brass — quiet luxury accent */}
        <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/8" />
        <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3" /> Early Bird
            </p>
            <h3 className="balance mt-3 font-serif text-2xl leading-tight sm:text-3xl md:text-4xl">
              Book before Dec 31 — save an extra 10% on Spring '26 departures.
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-2 md:flex md:items-center md:justify-end md:gap-3">
            {cells.map(([label, val]) => (
              <div key={label} className="text-center">
                <motion.div
                  key={val}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="grid aspect-square w-full place-items-center rounded-2xl bg-white/15 font-mono text-xl backdrop-blur sm:text-2xl md:h-20 md:w-20 md:text-3xl"
                >
                  {String(val).padStart(2, "0")}
                </motion.div>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
