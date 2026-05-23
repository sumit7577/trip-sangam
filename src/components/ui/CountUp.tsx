"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";

export function CountUp({
  to,
  duration = 1.8,
  suffix = "",
  prefix = "",
  decimals = 0,
  separator = true,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  /** Insert thousands separators. Disable for year values like 2018. */
  separator?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => {
    const fixed = v.toFixed(decimals);
    const body = separator ? fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : fixed;
    return `${prefix}${body}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [inView, to, duration, mv]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      <motion.span>{rounded}</motion.span>
    </span>
  );
}
