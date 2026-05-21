import { cn } from "@/lib/utils";

type Tone = "neutral" | "crimson" | "mountain" | "gold" | "green" | "white";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/8 text-ink",
  crimson: "bg-crimson/10 text-crimson-700",
  mountain: "bg-mountain/10 text-mountain",
  gold: "bg-gold/15 text-gold-600",
  green: "bg-jade/12 text-jade",
  white: "bg-white/90 text-ink backdrop-blur",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
