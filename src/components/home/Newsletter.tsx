"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, Send } from "lucide-react";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 md:px-8 md:py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-ink p-10 md:p-20">
        {/* Single subtle bone hairline at top, no glowing blobs */}
        <div className="absolute inset-x-12 top-0 h-px foil-rule" />

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              <Mail className="h-3.5 w-3.5" /> Field notes
            </p>
            <h2 className="balance mt-4 font-serif text-4xl tracking-tight text-white md:text-5xl">
              Dispatches from the<br />
              <span className="italic">trail.</span>
            </h2>
            <p className="pretty mt-4 max-w-md text-white/70">
              One thoughtful email a month. New routes, guide stories, and quiet seasons worth flying for.
              Unsubscribe in one click.
            </p>
          </div>

          <form onSubmit={onSubmit} className="relative">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-14 flex-1 rounded-2xl border border-white/15 bg-white/10 px-5 text-white placeholder:text-white/40 backdrop-blur focus:border-gold focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-sand px-7 text-sm font-medium text-ink transition-colors hover:bg-white"
                  >
                    Subscribe
                    <Send className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-5 text-white"
                >
                  <motion.span
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink"
                  >
                    <Check className="h-5 w-5" />
                  </motion.span>
                  <div>
                    <p className="font-medium">You're on the list.</p>
                    <p className="text-sm text-white/70">First dispatch arrives next week.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </section>
  );
}
