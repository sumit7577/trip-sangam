"use client";

import { motion } from "framer-motion";
import { Defender, Cruiser, Pickup, AdventureVan, Thar } from "./vehicles";

/**
 * Decorative section: 5-vehicle convoy driving RIGHT → LEFT across a quiet
 * mountain road. Each vehicle is a hand-built SVG illustration (see vehicles.tsx).
 *
 * Same crossing duration for all (so they stay evenly spaced once the first
 * cycle has staggered them in).
 */

const CROSSING = 24; // seconds per full crossing

type Vehicle = {
  Component: () => JSX.Element;
  name: string;
  /** drawn width in px at desktop sizing */
  width: number;
  /** seconds after page load this vehicle first appears on the right edge */
  delay: number;
};

const fleet: Vehicle[] = [
  { Component: Defender,     name: "Defender 4x4",   width: 190, delay: 0 },
  { Component: AdventureVan, name: "Adventure van",  width: 220, delay: 4.8 },
  { Component: Cruiser,      name: "Land Cruiser",   width: 200, delay: 9.6 },
  { Component: Pickup,       name: "Pickup",         width: 200, delay: 14.4 },
  { Component: Thar,         name: "Thar",           width: 170, delay: 19.2 },
];

export function CarStrip({ tone = "sand" }: { tone?: "sand" | "white" }) {
  const bg = tone === "white" ? "bg-white" : "bg-sand";

  return (
    <section
      aria-hidden="true"
      className={`relative isolate w-full overflow-hidden ${bg}`}
    >
      {/* Distant mountain silhouette — two layered ridges */}
      <svg
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-20 w-full md:h-28"
      >
        <path
          d="M 0 100 L 60 55 L 120 75 L 200 30 L 280 60 L 360 25 L 440 55 L 520 18 L 600 50 L 680 22 L 760 48 L 840 35 L 920 60 L 1000 28 L 1080 55 L 1140 38 L 1200 60 L 1200 100 Z"
          fill="#1C2E3D"
          opacity="0.07"
        />
        <path
          d="M 0 100 L 80 75 L 180 88 L 280 70 L 380 82 L 480 65 L 580 80 L 680 70 L 780 85 L 880 72 L 980 82 L 1080 70 L 1200 80 L 1200 100 Z"
          fill="#1C2E3D"
          opacity="0.05"
        />
      </svg>

      <div className="relative h-36 w-full md:h-48">
        {/* Road */}
        <div className="absolute inset-x-0 bottom-8 md:bottom-12">
          <div className="h-px w-full bg-ink/15" />
          <div className="mt-3 flex w-full items-center gap-2 px-2">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} className="h-px flex-1 bg-ink/12" />
            ))}
          </div>
        </div>

        {/* Convoy — driving right → left */}
        {fleet.map((v) => (
          <DrivingVehicle key={v.name} vehicle={v} />
        ))}
      </div>
    </section>
  );
}

function DrivingVehicle({ vehicle }: { vehicle: Vehicle }) {
  const { Component, width, delay, name } = vehicle;
  const widthMobile = Math.round(width * 0.55);

  return (
    <motion.div
      initial={{ x: "125vw" }}
      animate={{ x: "-25vw" }}
      transition={{
        duration: CROSSING,
        delay,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="absolute left-0 bottom-3 md:bottom-5"
      style={{
        width: widthMobile,
        ["--w" as string]: `${width}px`,
      }}
      aria-label={name}
    >
      {/* Suspension bounce */}
      <motion.div
        animate={{ y: [0, -0.8, 0, -1.6, 0, -0.6, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full md:w-[var(--w)]"
      >
        {/* Dust puffs on the right (behind, since we're driving left) */}
        <div className="absolute -right-5 bottom-2 flex gap-1.5 md:-right-7">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0.4, 1.1, 0.6],
                y: [0, -3, -7],
              }}
              transition={{
                duration: 1.1,
                delay: i * 0.16,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="h-1.5 w-1.5 rounded-full bg-muted md:h-2 md:w-2"
            />
          ))}
        </div>

        <Component />
      </motion.div>
    </motion.div>
  );
}
