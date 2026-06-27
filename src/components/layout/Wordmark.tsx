import { cn } from "@/lib/utils";

/**
 * Pure-text brand wordmark (no image). "Trip" in the contextual ink/white,
 * "Sangam" in an animated gold→crimson gradient sheen. `light` = over a dark
 * hero (white "Trip"). Server-safe (no hooks) so it works in header + footer.
 */
export function Wordmark({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span
      className={cn("inline-block font-serif font-bold leading-none tracking-tight notranslate", className)}
      translate="no"
    >
      <span className={cn("transition-colors", light ? "text-white" : "text-ink dark:text-white")}>Trip</span>
      <span className="ml-[0.28em] bg-gradient-to-r from-gold via-crimson to-gold bg-[length:200%_auto] bg-clip-text text-transparent [animation:wordmark-sheen_6s_linear_infinite]">
        Sangam
      </span>
    </span>
  );
}
