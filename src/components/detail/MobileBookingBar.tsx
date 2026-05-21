"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PackageDetail } from "@/types";
import { useCurrency, formatPrice, convert } from "@/lib/currency";
import { useModal } from "@/lib/modal";
import { formatINR } from "@/lib/utils";

export function MobileBookingBar({ pkg }: { pkg: PackageDetail }) {
  const { currency } = useCurrency();
  const { openBooking } = useModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Saving = original − current, formatted in current currency, abbreviated to "K"
  const savings = pkg.originalPriceINR - pkg.priceINR;
  const savingsInCurrency = convert(savings, currency);
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "Rs";
  const savingsShort =
    savingsInCurrency >= 1000
      ? `${symbol}${Math.round(savingsInCurrency / 1000)}K`
      : `${symbol}${formatINR(savingsInCurrency)}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 shadow-[0_-16px_44px_-12px_rgba(28,28,26,0.18)] backdrop-blur-xl md:hidden"
        >
          <div className="flex items-end gap-3">
            {/* Price block */}
            <div className="min-w-0 flex-1">
              {/* Big price + strikethrough */}
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-mono text-[26px] font-bold leading-none tracking-tight text-ink"
                >
                  {formatPrice(pkg.priceINR, currency)}
                </motion.span>
                <span className="font-mono text-xs text-muted/80 line-through leading-none">
                  {formatPrice(pkg.originalPriceINR, currency)}
                </span>
              </div>

              {/* Savings pill + per-person */}
              <div className="mt-2 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-jade/14 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-jade"
                >
                  <motion.span
                    animate={{ rotate: [0, 12, -8, 0] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.span>
                  SAVE {savingsShort}
                </motion.span>
                <span className="text-[11px] text-muted">per person</span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -1 }}
              onClick={() => openBooking({ pkg })}
              className="relative inline-flex h-12 shrink-0 items-center gap-1.5 overflow-hidden rounded-2xl bg-ink px-5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-lift"
            >
              {/* Subtle inner shine */}
              <motion.span
                aria-hidden
                animate={{ x: ["-110%", "110%"] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1.6,
                }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-white/15"
              />
              <span className="relative">Book</span>
              <ArrowRight className="relative h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
