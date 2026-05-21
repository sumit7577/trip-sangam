"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function Inclusions({
  inclusions,
  exclusions,
}: {
  inclusions: string[];
  exclusions: string[];
}) {
  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl">What's covered</h2>
        <p className="pretty mt-2 text-muted">
          Every quoted price already includes the items on the left. The right column is what you'll
          want to budget for separately.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Column
          title="Included"
          items={inclusions}
          tone="emerald"
          Icon={Check}
        />
        <Column
          title="Not included"
          items={exclusions}
          tone="crimson"
          Icon={X}
        />
      </div>
    </div>
  );
}

function Column({
  title,
  items,
  tone,
  Icon,
}: {
  title: string;
  items: string[];
  tone: "emerald" | "crimson";
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const bg = tone === "emerald" ? "bg-jade/12 text-jade" : "bg-crimson/12 text-crimson";
  return (
    <div className="rounded-3xl border border-ink/8 bg-white p-7">
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${bg}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-serif text-xl">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 text-sm leading-relaxed"
          >
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${bg}`}>
              <Icon className="h-3 w-3" />
            </span>
            <span className="text-ink">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
