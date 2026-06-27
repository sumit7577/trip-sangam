"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X, ArrowRight, Copy, Check } from "lucide-react";
import { useModal } from "@/lib/modal";
import { useAuth } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { WELCOME_OFFER } from "@/components/layout/PromoBanner";

/**
 * Auto-appearing welcome offer. Pops ~1.1s after every visit / refresh for
 * logged-out visitors, promoting the first-trip discount. Dismissible; the CTA
 * opens the existing sign-in modal. (To show once per session instead of every
 * load, gate the timeout on sessionStorage.)
 */
export function WelcomePopup() {
  const { user, hydrated } = useAuth();
  const { openSignin } = useModal();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hydrated || user) return;
    const t = setTimeout(() => {
      const m = useModal.getState();
      if (!m.signin && !m.booking) setShow(true); // don't stack over an open modal
    }, 1100);
    return () => clearTimeout(t);
  }, [hydrated, user]);

  // Close on Escape.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(WELCOME_OFFER.code);
      setCopied(true);
      toast("Code copied — paste it when you book", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function startSignin() {
    setShow(false);
    openSignin();
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <button
            aria-label="Close"
            onClick={() => setShow(false)}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-label="Welcome offer"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_-24px_rgba(28,28,26,0.55)] dark:bg-[#1A1A18]"
          >
            {/* Festive header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gold via-crimson to-ink px-6 pb-8 pt-7 text-white">
              {/* floating sparkles */}
              {[
                { left: "12%", top: "30%", d: 0 },
                { left: "82%", top: "22%", d: 0.5 },
                { left: "68%", top: "62%", d: 1 },
                { left: "26%", top: "68%", d: 1.4 },
              ].map((s, i) => (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute text-white/70"
                  style={{ left: s.left, top: s.top }}
                  animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4], rotate: [0, 20, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: s.d }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
              ))}

              <button
                onClick={() => setShow(false)}
                aria-label="Dismiss"
                className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white/90 backdrop-blur transition-colors hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>

              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}
                className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 shadow-glow backdrop-blur"
              >
                <Gift className="h-7 w-7" />
              </motion.span>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/80">
                Welcome to Trip Sangam
              </p>
              <h2 className="mt-1 font-serif text-[30px] leading-none tracking-tight">
                Flat {WELCOME_OFFER.percent}% off
              </h2>
              <p className="mt-1.5 text-sm text-white/85">on your very first trip with us.</p>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 pt-5">
              {/* Code chip */}
              <button
                onClick={copyCode}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-ink/25 bg-sand/60 px-4 py-3 transition-colors hover:border-ink/50 dark:border-white/20 dark:bg-white/5"
              >
                <span className="flex flex-col items-start">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Use code</span>
                  <span className="font-mono text-lg font-bold tracking-wider text-ink dark:text-white">
                    {WELCOME_OFFER.code}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white transition-transform group-active:scale-95">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={startSignin}
                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white shadow-glow transition-colors hover:bg-ink/90"
              >
                Login / Sign up to claim
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <button
                onClick={() => setShow(false)}
                className="mt-3 w-full text-center text-xs text-muted transition-colors hover:text-ink dark:hover:text-white"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
