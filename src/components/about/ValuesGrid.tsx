"use client";

import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Compass, MessageCircle } from "lucide-react";

const values = [
  {
    icon: MapPin,
    title: "Rooted in Raxaul",
    body: "We are based at the Raxaul–Birgunj border and arrange your journey into Nepal from there, with pickup at Raxaul station or the border.",
  },
  {
    icon: ShieldCheck,
    title: "Border made easy",
    body: "We help you through the Raxaul–Birgunj crossing so the start of your trip is smooth and free of guesswork.",
  },
  {
    icon: Compass,
    title: "Tailored to you",
    body: "Private or group tours for pilgrimage, family and holiday travellers — to Kathmandu, Pokhara, Muktinath, Chitwan and Lumbini.",
  },
  {
    icon: MessageCircle,
    title: "Always reachable",
    body: "Plan your trip and get help over a call or on WhatsApp, both before you travel and while you are on the road.",
  },
];

export function ValuesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 md:px-8 md:py-28">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
          <span className="h-px w-8 bg-crimson" /> How we work
        </p>
        <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
          What you can<span className="italic text-crimson"> count on.</span>
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
