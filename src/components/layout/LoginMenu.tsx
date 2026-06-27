"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserRound, ArrowRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Logged-out account control: a goibibo-style hover/click popup with a big
 * Login / Sign-up button and a welcome banner. `onSignin` opens the auth modal.
 */
export function LoginMenu({ scrolled, onSignin }: { scrolled: boolean; onSignin: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  function startSignin() {
    setOpen(false);
    onSignin();
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors",
          scrolled ? "hover:bg-ink/5" : "hover:bg-white/10"
        )}
      >
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full ring-2 transition-colors",
            scrolled ? "bg-ink/5 text-ink ring-white/70" : "bg-white/15 text-white ring-white/40"
          )}
        >
          <UserRound className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </span>
        <span className={cn("hidden text-sm font-medium xl:inline", scrolled ? "text-ink" : "text-white")}>
          Sign in
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
            scrolled ? "text-ink/60" : "text-white/80"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 pt-2"
          >
            <div className="w-[300px] overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-lift dark:border-white/10 dark:bg-[#1A1A18]">
              <div className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-crimson/80">
                  Welcome to Trip Sangam
                </p>
                <p className="mt-1.5 text-sm leading-snug text-ink dark:text-white">
                  Sign in to book trips, join departure groups and track your bookings & slots.
                </p>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={startSignin}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white shadow-glow transition-colors hover:bg-ink/90"
                >
                  Login / Sign up
                  <ArrowRight className="h-4 w-4" />
                </motion.button>

                {/* Welcome banner — swap copy for a real offer (e.g. a code/%) when you run one. */}
                <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-jade/20 bg-jade/8 px-3 py-2.5">
                  <Gift className="h-5 w-5 shrink-0 text-jade" strokeWidth={1.6} />
                  <p className="text-[12px] leading-snug text-ink/80 dark:text-white/80">
                    <span className="font-semibold text-jade">Free to join.</span> Save trips you love and get
                    early word when a departure fills.
                  </p>
                </div>

                <button
                  onClick={startSignin}
                  className="mt-3 w-full text-center text-xs text-muted transition-colors hover:text-ink dark:hover:text-white"
                >
                  New here? <span className="font-medium text-ink dark:text-white">Create an account</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
