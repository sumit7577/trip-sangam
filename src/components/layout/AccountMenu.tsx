"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserRound, Briefcase, LogOut, LifeBuoy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function initials(name: string, email: string): string {
  const src = (name || "").trim();
  if (src) {
    const parts = src.split(/\s+/);
    const two = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    return (two || src[0]).toUpperCase();
  }
  return (email?.[0] || "?").toUpperCase();
}

const items = [
  {
    label: "My Profile",
    href: "/account",
    icon: UserRound,
    hint: "Name, phone & login details",
  },
  {
    label: "My Trips",
    href: "/trips",
    icon: Briefcase,
    hint: "Bookings, slot status & payments",
  },
];

export function AccountMenu({ scrolled }: { scrolled: boolean }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click / Escape.
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

  // Close on route change.
  useEffect(() => setOpen(false), [pathname]);

  if (!user) return null;

  const name = user.fullName || user.email.split("@")[0];
  const ini = initials(user.fullName, user.email);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors",
          scrolled ? "hover:bg-ink/5" : "hover:bg-white/10"
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-[12px] font-semibold uppercase text-white shadow-soft ring-2 ring-white/70">
          {ini}
        </span>
        <span
          className={cn(
            "hidden max-w-[120px] truncate text-sm font-medium xl:inline",
            scrolled ? "text-ink" : "text-white"
          )}
        >
          {name.split(" ")[0]}
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
            className="absolute right-0 top-full mt-2 w-[288px] overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-lift dark:border-white/10 dark:bg-[#1A1A18]"
          >
            {/* Identity band */}
            <div className="relative overflow-hidden bg-gradient-to-br from-sand to-white px-4 pb-4 pt-4 dark:from-white/5 dark:to-transparent">
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold/15 blur-2xl" />
              <p className="relative text-[10px] font-medium uppercase tracking-[0.16em] text-crimson/80">
                You are viewing your personal profile
              </p>
              <div className="relative mt-3 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-sm font-semibold uppercase text-white shadow-soft">
                  {ini}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink dark:text-white">{name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-sand dark:hover:bg-white/5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand text-ink/70 transition-colors group-hover:bg-ink group-hover:text-white dark:bg-white/10 dark:text-white/70">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-ink dark:text-white">{item.label}</span>
                      <span className="truncate text-[11px] text-muted">{item.hint}</span>
                    </span>
                  </Link>
                );
              })}

              <a
                href="https://wa.me/917678538192"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-sand dark:hover:bg-white/5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand text-ink/70 transition-colors group-hover:bg-ink group-hover:text-white dark:bg-white/10 dark:text-white/70">
                  <LifeBuoy className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-ink dark:text-white">Need help?</span>
                  <span className="truncate text-[11px] text-muted">Chat with us on WhatsApp</span>
                </span>
              </a>
            </div>

            <div className="border-t border-ink/8 p-1.5 dark:border-white/10">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors hover:bg-crimson/5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-crimson/10 text-crimson">
                  <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <span className="text-sm font-medium text-crimson">Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
