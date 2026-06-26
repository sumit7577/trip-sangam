"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Sparkles, Briefcase, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { initials } from "@/components/layout/AccountMenu";
import { cn } from "@/lib/utils";

/** Fixed bottom navigation for mobile (hidden on lg+, where the header nav
 * takes over). Mirrors the app-style bar travellers expect on phones. */
export function BottomNav() {
  const pathname = usePathname();
  const { user, hydrated } = useAuth();
  const { openSignin } = useModal();
  const loggedIn = hydrated && !!user;

  function scrollToPackages() {
    const el = document.getElementById("packages");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = "/#packages";
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative mx-auto flex h-16 max-w-md items-stretch justify-around border-t border-ink/8 bg-sand/92 px-1 shadow-[0_-8px_24px_-12px_rgba(28,28,26,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0E0E0D]/92">
        <Tab href="/" icon={Home} label="Home" active={pathname === "/"} />
        <Tab onClick={scrollToPackages} icon={Compass} label="Explore" />

        {/* Raised center CTA */}
        <button
          onClick={scrollToPackages}
          aria-label="Book a trip"
          className="flex w-16 shrink-0 flex-col items-center justify-end"
        >
          <span className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-white shadow-lift ring-4 ring-sand transition-transform active:scale-95 dark:ring-[#0E0E0D]">
            <Sparkles className="h-6 w-6" strokeWidth={2} />
          </span>
          <span className="mt-0.5 text-[10px] font-semibold text-crimson">Book</span>
        </button>

        <Tab href="/trips" icon={Briefcase} label="Trips" active={pathname.startsWith("/trips")} />

        {/* Account: avatar when logged in, otherwise a Sign In tap */}
        {loggedIn ? (
          <Link
            href="/account"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              pathname.startsWith("/account") ? "text-crimson" : "text-ink/60 dark:text-white/55"
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-[10px] font-semibold uppercase text-white",
                pathname.startsWith("/account") && "ring-2 ring-crimson ring-offset-1 ring-offset-sand dark:ring-offset-[#0E0E0D]"
              )}
            >
              {initials(user!.fullName, user!.email)}
            </span>
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        ) : (
          <Tab onClick={openSignin} icon={UserRound} label="Sign In" />
        )}
      </div>
    </nav>
  );
}

function Tab({
  icon: Icon,
  label,
  href,
  onClick,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const cls = cn(
    "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
    active ? "text-crimson" : "text-ink/60 dark:text-white/55"
  );
  const inner = (
    <>
      <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
      <span className="text-[10px] font-medium">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
