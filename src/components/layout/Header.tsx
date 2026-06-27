"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ChevronDown, Phone, MessageCircle, Compass, Sparkles, BookOpen, Newspaper, Briefcase, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { AccountMenu, initials } from "@/components/layout/AccountMenu";
import { useCurrency, type Currency } from "@/lib/currency";
import { useModal } from "@/lib/modal";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const nav = [
  { label: "All Trips", href: "/packages" },
  { label: "Destinations", href: "/#packages" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

const drawerNav = [
  { label: "All Trips", href: "/packages", icon: Compass, hint: "Browse & filter every departure" },
  { label: "Destinations", href: "/#packages", icon: Sparkles, hint: "Trails, peaks & valleys" },
  { label: "About", href: "/about", icon: BookOpen, hint: "Our story" },
  { label: "Blog", href: "/blog", icon: Newspaper, hint: "Field notes" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 32));
  const { openSignin } = useModal();
  const { theme } = useTheme();
  const { user, hydrated, logout } = useAuth();
  const isDark = theme === "dark";

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
          ? "border-b border-ink/8 bg-sand/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0E0E0D]/90"
          // Always-on subtle dark scrim — guarantees white text legibility on any hero image (snow, sky, sand…)
          : "bg-ink/25 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fff] shadow-soft ring-1 ring-ink/5">
            <Image
              src="/tripsangam-logo.jpg"
              alt="Trip Sangam"
              width={40}
              height={40}
              priority
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className={cn(
              "font-serif text-base font-medium tracking-tight transition-colors notranslate sm:text-lg",
              scrolled ? "text-ink" : "text-white"
            )} translate="no">
              Trip Sangam
            </span>
            <span className={cn(
              "hidden text-[10px] uppercase tracking-[0.18em] transition-colors sm:inline",
              scrolled ? "text-muted" : "text-white/70"
            )}>
              Journey Beyond Borders
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
          <LanguageSwitcher dark={!scrolled} />
          <ThemeToggle dark={!scrolled} />
          <CurrencySwitcher dark={!scrolled} />
          {hydrated && user ? (
            <div className="hidden lg:block">
              <AccountMenu scrolled={scrolled} />
            </div>
          ) : (
            <button
              onClick={openSignin}
              className={cn(
                "hidden h-10 items-center rounded-xl px-4 text-sm font-medium transition-colors lg:inline-flex",
                scrolled ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/10"
              )}
            >
              Sign In
            </button>
          )}
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
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                backdropFilter: "blur(80px) saturate(180%)",
                WebkitBackdropFilter: "blur(80px) saturate(180%)",
              }}
              className="fixed inset-0 z-[60] bg-white/30 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              style={{
                backgroundColor: isDark ? "#141413" : "#FFFFFF",
                backgroundImage: isDark
                  ? "linear-gradient(165deg, rgba(201,168,118,0.08) 0%, rgba(255,255,255,0) 45%)"
                  : "linear-gradient(165deg, rgba(242,238,230,0.55) 0%, rgba(255,255,255,0) 45%)",
                boxShadow: isDark
                  ? "-36px 0 96px -20px rgba(0,0,0,0.7), inset 1px 0 0 rgba(255,255,255,0.06)"
                  : "-36px 0 96px -20px rgba(28,28,26,0.55), inset 1px 0 0 rgba(255,255,255,0.95)",
              }}
              className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-[88vw] max-w-sm flex-col overflow-hidden rounded-l-[32px] lg:hidden"
            >
              {/* Subtle warm tint at top-right for premium depth */}
              <div className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#fff] shadow-glow ring-1 ring-ink/5">
                    <Image
                      src="/tripsangam-logo.jpg"
                      alt="Trip Sangam"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="font-serif text-[17px] font-medium tracking-tight text-ink notranslate" translate="no">Trip Sangam</span>
                    <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ink/55">
                      Journey Beyond Borders
                    </span>
                  </span>
                </Link>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/60 text-ink/70 backdrop-blur transition-all hover:bg-white/90 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Eyebrow chip */}
              <div className="relative mx-5 mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/8 bg-white/55 px-3 py-1 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink/70">
                  Spring '26 departures open
                </span>
              </div>

              {/* Nav */}
              <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
                {drawerNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-all hover:border-white/60 hover:bg-white/55 hover:shadow-soft"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/60 bg-white/45 text-ink/75 backdrop-blur transition-all group-hover:border-transparent group-hover:bg-ink group-hover:text-white group-hover:shadow-glow">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-serif text-[17px] leading-none text-ink">{item.label}</span>
                        <span className="mt-1 truncate text-[11px] text-muted">{item.hint}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:text-ink/70" />
                    </Link>
                  );
                })}
              </nav>

              {/* CTAs + contact */}
              <div
                className="relative border-t border-white/40 bg-white/30 px-4 pt-4 backdrop-blur"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
              >
                {hydrated && user ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white/55 px-3 py-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-sm font-semibold uppercase text-white shadow-soft">
                        {initials(user.fullName, user.email)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{user.fullName || user.email.split("@")[0]}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        onClick={() => setOpen(false)}
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white/60 text-sm font-medium text-ink transition-colors hover:bg-white"
                      >
                        <UserRound className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        href="/trips"
                        onClick={() => setOpen(false)}
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white/60 text-sm font-medium text-ink transition-colors hover:bg-white"
                      >
                        <Briefcase className="h-4 w-4" /> My Trips
                      </Link>
                    </div>
                    <button
                      onClick={() => { setOpen(false); logout(); }}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-medium text-crimson transition-colors hover:bg-crimson/5"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => { setOpen(false); openSignin(); }}>Sign In</Button>
                    <Button onClick={() => { setOpen(false); scrollToPackages(); }}>Book Now</Button>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted">
                  <a href="tel:+917678538192" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
                    <Phone className="h-3.5 w-3.5" /> Call us
                  </a>
                  <span className="h-3 w-px bg-ink/15" />
                  <a
                    href="https://wa.me/917678538192"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
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
