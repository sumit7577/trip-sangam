import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

/** Single source of truth for the welcome offer — edit here, both menus update. */
export const WELCOME_OFFER = { percent: 40, code: "SANGAM101" } as const;

/** First-trip discount banner, shown in the login popup (desktop) + mobile menu. */
export function PromoBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border border-jade/20 bg-jade/8 px-3 py-2.5",
        className
      )}
    >
      <Gift className="h-5 w-5 shrink-0 text-jade" strokeWidth={1.6} />
      <p className="text-[12px] leading-snug text-ink/80 dark:text-white/80">
        <span className="font-semibold text-jade">FLAT {WELCOME_OFFER.percent}% OFF</span> your first trip — use code{" "}
        <span className="font-mono font-semibold text-ink dark:text-white">{WELCOME_OFFER.code}</span>
      </p>
    </div>
  );
}
