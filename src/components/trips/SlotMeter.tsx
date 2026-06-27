"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface SlotMeterProps {
  /** Seats confirmed so far in this departure. */
  seatsConfirmed: number;
  /** Minimum confirmed seats needed to guarantee the departure. */
  minCapacity: number;
  /** Whether the departure has already crossed the guarantee threshold. */
  isGuaranteed: boolean;
  /** Diameter in pixels. */
  size?: number;
}

/**
 * Orbital seat meter. A ring of "seat beads" lights up as travellers confirm,
 * an arc fills toward the guarantee threshold, and the centre counts down the
 * seats remaining — flipping to a glowing confirmed state once the slot is full.
 */
export function SlotMeter({ seatsConfirmed, minCapacity, isGuaranteed, size = 160 }: SlotMeterProps) {
  const cap = Math.max(1, minCapacity);
  const filled = Math.min(Math.max(0, seatsConfirmed), cap);
  const pct = Math.min(1, filled / cap);
  const remaining = Math.max(0, cap - filled);

  const stroke = 10;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - stroke / 2 - 9;
  const circumference = 2 * Math.PI * r;

  // Seat beads sit on the ring, starting at 12 o'clock and going clockwise.
  const beads = Array.from({ length: cap }, (_, i) => {
    const angle = (-90 + (360 / cap) * i) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      on: i < filled,
    };
  });

  const accent = isGuaranteed ? "#3B5C4B" : "#C9A876";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Ambient glow — stronger once the departure is confirmed. */}
      <div
        className={`pointer-events-none absolute inset-3 rounded-full blur-2xl transition-colors ${
          isGuaranteed ? "bg-jade/30" : "bg-gold/15"
        }`}
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
        <defs>
          <linearGradient id="slot-meter-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C9A876" />
            <stop offset="100%" stopColor={isGuaranteed ? "#3B5C4B" : "#A78858"} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-ink/10 dark:text-white/10"
        />

        {/* Progress arc (starts at the top) */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#slot-meter-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform={`rotate(-90 ${cx} ${cy})`}
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
        {isGuaranteed ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <ShieldCheck className="h-8 w-8 text-jade" />
            <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-jade">Confirmed</span>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif text-4xl font-light text-ink dark:text-white">{remaining}</span>
            <span className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-muted">to confirm</span>
          </div>
        )}
      </div>
    </div>
  );
}
