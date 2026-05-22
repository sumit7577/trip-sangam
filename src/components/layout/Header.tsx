"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Mountain, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCurrency, type Currency } from "@/lib/currency";
import { useModal } from "@/lib/modal";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Destinations", href: "/#packages" },
  { label: "Experiences", href: "/#packages" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 32));
  const { openSignin } = useModal();

  function scrollToPackages() {
    const el = document.getElementById("packages");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // We're not on the homepage — go there and target the packages section
      window.location.href = "/#packages";
    }
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-ink/8 bg-sand/90 backdrop-blur-xl"
          // Always-on subtle dark scrim — guarantees white text legibility on any hero image (snow, sky, sand…)
          : "bg-ink/25 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-ink shadow-soft">
            <Mountain className="h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className={cn(
              "font-serif text-base font-medium tracking-tight transition-colors sm:text-lg",
              scrolled ? "text-ink" : "text-white"
            )}>
              Sangam Travels
            </span>
            <span className={cn(
              "hidden text-[10px] uppercase tracking-[0.18em] transition-colors sm:inline",
              scrolled ? "text-muted" : "text-white/70"
            )}>
              Tour &amp; Taxi Service
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-ink/70 hover:bg-ink/5 hover:text-ink"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2">
          <CurrencySwitcher dark={!scrolled} />
          <button
            onClick={openSignin}
            className={cn(
              "hidden h-10 items-center rounded-xl px-4 text-sm font-medium transition-colors lg:inline-flex",
              scrolled ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/10"
            )}
          >
            Sign In
          </button>
          <Button size="sm" onClick={scrollToPackages} className="hidden h-10 lg:inline-flex">Book Now</Button>
          <button
            aria-label="Menu"
            className={cn(
              "grid h-10 w-10 place-items-center rounded-xl transition-colors lg:hidden",
              scrolled ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/10"
            )}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-sand p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg">Menu</span>
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-ink/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-8 flex flex-col gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-medium hover:bg-ink/5"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { setOpen(false); openSignin(); }}>Sign In</Button>
                <Button onClick={() => { setOpen(false); scrollToPackages(); }}>Book Now</Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function CurrencySwitcher({ dark }: { dark: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    if (open) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className={cn(
          "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-mono font-medium transition-colors",
          dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5"
        )}
      >
        {currency}
        <ChevronDown className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-lift"
          >
            {(["INR", "USD", "NPR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => { setCurrency(c); setOpen(false); }}
                className={cn(
                  "block w-full px-4 py-2.5 text-left text-sm font-mono transition-colors hover:bg-sand",
                  currency === c && "bg-sand text-crimson"
                )}
              >
                {c}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
