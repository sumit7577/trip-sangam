"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Utensils, BedDouble, Mountain } from "lucide-react";
import type { ItineraryDay } from "@/types";
import { cn } from "@/lib/utils";

export function Itinerary({ days }: { days: ItineraryDay[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const maxAlt = Math.max(...days.map((d) => d.altitude));

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl">Day by day</h2>
        <p className="pretty mt-2 text-muted">
          Click each day to see meals, accommodation and altitude. The curve below shows the
          climb profile.
        </p>
      </div>

      <div className="mb-10 rounded-3xl border border-ink/8 bg-white p-6">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted">Altitude profile</p>
        <div className="relative mt-3 h-24">
          <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="alt-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2C3D2E" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2C3D2E" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
              d={`M 0 100 ${days
                .map(
                  (d, i) =>
                    `L ${(i / (days.length - 1)) * 600} ${100 - (d.altitude / maxAlt) * 90}`
                )
                .join(" ")} L 600 100 Z`}
              fill="url(#alt-gradient)"
              stroke="#2C3D2E"
              strokeWidth="2"
            />
            {days.map((d, i) => (
              <circle
                key={d.day}
                cx={(i / (days.length - 1)) * 600}
                cy={100 - (d.altitude / maxAlt) * 90}
                r="3"
                fill="#fff"
                stroke="#2C3D2E"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-wider text-muted">
          <span>Day 1 · {days[0].altitude}m</span>
          <span className="text-crimson">Peak {maxAlt.toLocaleString()}m</span>
          <span>Day {days.length} · {days[days.length - 1].altitude}m</span>
        </div>
      </div>

      <ol className="relative">
        {/* Connecting line — centered exactly on the 56px circle's mid-point */}
        <div className="absolute bottom-4 left-[27px] top-4 w-0.5 bg-line" />
        {days.map((day, i) => {
          const isOpen = open === i;
          return (
            <motion.li
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="relative pl-16 pb-4"
            >
              <span className="absolute left-0 top-3 z-10 grid h-14 w-14 place-items-center rounded-full border border-crimson bg-sand font-mono text-[13px] font-semibold tracking-wider text-crimson">
                {String(day.day).padStart(2, "0")}
              </span>

              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "w-full rounded-2xl border bg-white p-5 text-left transition-all",
                  isOpen ? "border-crimson/40 shadow-soft" : "border-ink/8 hover:border-ink/20"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-xl tracking-tight">{day.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      <span className="font-mono text-xs uppercase tracking-wider text-crimson">{day.altitude}m</span>
                      <span className="mx-2 text-ink/20">·</span>
                      {day.meals}
                    </p>
                  </div>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-muted">
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4 border-t border-ink/8 pt-4">
                        <p className="pretty text-sm leading-relaxed text-ink">{day.description}</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Info icon={<Utensils className="h-4 w-4" />} label="Meals" value={day.meals} />
                          <Info icon={<BedDouble className="h-4 w-4" />} label="Stay" value={day.accommodation} />
                          <Info icon={<Mountain className="h-4 w-4" />} label="Altitude" value={`${day.altitude}m`} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.activities.map((a) => (
                            <span
                              key={a}
                              className="rounded-full border border-ink/10 bg-sand px-3 py-1 text-xs text-ink"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-sand p-3">
      <span className="text-crimson">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
