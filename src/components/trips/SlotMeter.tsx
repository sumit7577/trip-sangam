"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface SlotMeterProps {
  /** Seats already taken in the group (held + confirmed). */
  filled: number;
  /** Minimum seats needed to form the group. */
  target: number;
  /** Whether the group has reached the minimum (is formed). */
  complete: boolean;
  /** Tailwind size classes for the meter container (responsive). */
  className?: string;
}

// The meter is drawn in a fixed coordinate space and scaled to fit its
// container via the SVG viewBox, so it stays crisp at any size.
const VIEW = 160;

/**
 * Orbital seat meter. A ring of "seat beads" lights up as travellers join, an
 * arc fills toward the minimum, and the centre counts down the seats remaining —
 * flipping to a glowing "Formed" state once the group reaches its minimum.
 */
export function SlotMeter({ filled, target, complete, className = "h-24 w-24 sm:h-40 sm:w-40" }: SlotMeterProps) {
  const cap = Math.max(1, target);
  const lit = Math.min(Math.max(0, filled), cap);
  const pct = Math.min(1, lit / cap);
  const remaining = Math.max(0, cap - lit);

  const stroke = 10;
  const c = VIEW / 2;
  const r = VIEW / 2 - stroke / 2 - 9;
  const circumference = 2 * Math.PI * r;

  // Seat beads sit on the ring, starting at 12 o'clock and going clockwise.
  const beads = Array.from({ length: cap }, (_, i) => {
    const angle = (-90 + (360 / cap) * i) * (Math.PI / 180);
    return {
      x: c + r * Math.cos(angle),
      y: c + r * Math.sin(angle),
      on: i < lit,
    };
  });

  const accent = complete ? "#3B5C4B" : "#C9A876";

  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Ambient glow — stronger once the group is formed. */}
      <div
        className={`pointer-events-none absolute inset-3 rounded-full blur-2xl transition-colors ${
          complete ? "bg-jade/30" : "bg-gold/15"
        }`}
      />

      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="relative h-full w-full">
        <defs>
          <linearGradient id="slot-meter-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C9A876" />
            <stop offset="100%" stopColor={complete ? "#3B5C4B" : "#A78858"} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-ink/10 dark:text-white/10"
        />

        {/* Progress arc (starts at the top) */}
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="url(#slot-meter-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform={`rotate(-90 ${c} ${c})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Seat beads */}
        {beads.map((bead, i) => (
          <circle
            key={i}
            cx={bead.x}
            cy={bead.y}
            r={bead.on ? 5 : 3.5}
            fill={bead.on ? accent : "currentColor"}
            className={bead.on ? "" : "text-ink/15 dark:text-white/25"}
          />
        ))}
      </svg>

      {/* Centre readout */}
      <div className="absolute inset-0 grid place-items-center text-center">
        {complete ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <ShieldCheck className="h-7 w-7 text-jade sm:h-8 sm:w-8" />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-jade sm:text-xs">Formed</span>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif text-3xl font-light text-ink dark:text-white sm:text-4xl">{remaining}</span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.15em] text-muted sm:text-[10px]">to form</span>
          </div>
        )}
      </div>
    </div>
  );
}
