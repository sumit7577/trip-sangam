"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import type { FAQItem } from "@/types";
import { cn } from "@/lib/utils";

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl">Questions, answered</h2>
        <p className="pretty mt-2 text-muted">
          The eight we get most often. Anything missing?{" "}
          <a
            href="https://wa.me/917070406193?text=Hi%2C%20I%20have%20a%20question%20about%20a%20trek."
            target="_blank"
            rel="noopener noreferrer"
            className="text-crimson underline-offset-4 hover:underline"
          >
            Ask us on WhatsApp.
          </a>
        </p>
      </div>

      <ul className="mx-auto max-w-3xl divide-y divide-ink/10 rounded-3xl border border-ink/8 bg-white">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-sand"
              >
                <span className="font-serif text-lg leading-snug">{item.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors",
                    isOpen ? "border-crimson bg-crimson text-white" : "border-ink/15"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pretty px-6 pb-6 pr-16 text-sm leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
