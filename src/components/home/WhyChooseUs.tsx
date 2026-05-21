"use client";

import { motion } from "framer-motion";
import { Users, BadgeIndianRupee, Headphones, Leaf } from "lucide-react";

const items = [
  {
    icon: Users,
    title: "Local guides",
    body: "Every guide is born and raised in Nepal — and certified by the Nepal Mountaineering Association.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Best price, period",
    body: "Find a cheaper itinerary like-for-like and we'll beat it by 10%. No fine print, no upsells.",
  },
  {
    icon: Headphones,
    title: "24/7 on-trail support",
    body: "Sat-phones with every group leader and a Kathmandu ops desk that never closes.",
  },
  {
    icon: Leaf,
    title: "Carbon-light by design",
    body: "We offset 120% of every trip, employ porters at fair-wage rates, and pack out what we pack in.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-white py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> Why us
          </p>
          <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
            Built for travelers who want it<br />
            <span className="italic text-crimson">done properly.</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-3xl border border-ink/8 p-7 transition-all hover:border-coral/40 hover:shadow-sunset"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sunset text-white shadow-glow transition-transform group-hover:rotate-6 group-hover:scale-110">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl">{item.title}</h3>
              <p className="pretty mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
