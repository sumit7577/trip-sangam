"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, MapPin } from "lucide-react";
import type { JourneyStop } from "@/types";

// Stylized Nepal silhouette (approx) in a 1000x500 viewBox
const NEPAL_PATH =
  "M 60 360 L 110 320 L 170 305 L 220 280 L 280 260 L 340 240 L 400 220 L 460 200 L 520 180 L 580 170 L 640 165 L 700 175 L 760 190 L 820 210 L 880 240 L 920 270 L 940 310 L 920 350 L 870 380 L 810 395 L 740 405 L 670 405 L 600 410 L 530 415 L 460 415 L 390 410 L 320 405 L 250 395 L 180 380 L 120 380 L 80 380 Z";

const W = 1000;
const H = 500;

export function JourneyMap({ stops }: { stops: JourneyStop[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const ref = useRef<SVGSVGElement>(null);

  // Build a smooth path through the stops using cubic Bezier
  const routeD = useMemo(() => {
    const pts = stops.map((s) => ({ x: s.x * W, y: s.y * H }));
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` Q ${mx} ${p0.y - 20}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [stops]);

  // For positioning the vehicle along the route, we use motion's offsetPath
  // but since browser support varies we'll animate cx/cy via path length sampling.
  const [pathSamples, setPathSamples] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const pathEl = svg.querySelector<SVGPathElement>("#journey-route");
    if (!pathEl) return;
    const len = pathEl.getTotalLength();
    const N = 60;
    const samples: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const p = pathEl.getPointAtLength((i / N) * len);
      samples.push({ x: p.x, y: p.y });
    }
    setPathSamples(samples);
  }, [routeD, replayKey]);

  function replay() {
    setReplayKey((k) => k + 1);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 md:px-8 md:py-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> Your Journey
          </p>
          <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
            Kathmandu → Pokhara,<br />
            <span className="italic text-crimson">over the Thorong La.</span>
          </h2>
        </div>
        <button
          onClick={replay}
          className="hidden items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/40 md:inline-flex"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay journey
        </button>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-3xl border border-ink/8 bg-sand p-2 shadow-soft">
        <div className="relative aspect-[2/1] w-full">
          <svg
            key={replayKey}
            ref={ref}
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="terrain" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#EDE5D2" />
                <stop offset="100%" stopColor="#F5EDDD" />
              </linearGradient>
              <linearGradient id="route" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#1E2D5C" />
                <stop offset="50%" stopColor="#2C3D2E" />
                <stop offset="100%" stopColor="#C9A876" />
              </linearGradient>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#1E2D5C" opacity="0.10" />
              </pattern>
            </defs>

            <path d={NEPAL_PATH} fill="url(#terrain)" stroke="#1C2E3D" strokeOpacity="0.18" strokeWidth="3" />
            <path d={NEPAL_PATH} fill="url(#dots)" />

            <text x="80" y="455" fontSize="22" fill="#7A7268" fontFamily="serif" fontStyle="italic" letterSpacing="3">
              NEPAL · हिमालय
            </text>

            <path
              id="journey-route"
              d={routeD}
              fill="none"
              stroke="url(#route)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="3 8"
              opacity="0.45"
            />

            <motion.path
              key={`anim-${replayKey}`}
              d={routeD}
              fill="none"
              stroke="url(#route)"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4.5, ease: "easeInOut" }}
            />

            {stops.map((s, i) => (
              <g
                key={s.id}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.circle
                  cx={s.x * W}
                  cy={s.y * H}
                  r={22}
                  fill="#2C3D2E"
                  fillOpacity="0.15"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1] }}
                  transition={{ delay: 0.4 + i * 0.7, duration: 0.6, ease: "backOut" }}
                />
                <motion.circle
                  cx={s.x * W}
                  cy={s.y * H}
                  r={10}
                  fill="#2C3D2E"
                  stroke="#fff"
                  strokeWidth="4"
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.7, type: "spring", stiffness: 300, damping: 14 }}
                />
                <motion.text
                  x={s.x * W}
                  y={s.y * H - 22}
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="600"
                  fill="#1C1C1A"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.7 }}
                >
                  {s.name}
                </motion.text>
              </g>
            ))}

            {pathSamples.length > 0 && (
              <motion.g
                key={`jeep-${replayKey}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: pathSamples.map((p) => p.x),
                  y: pathSamples.map((p) => p.y),
                }}
                transition={{
                  duration: 4.5,
                  ease: "easeInOut",
                  times: pathSamples.map((_, i) => i / pathSamples.length),
                }}
                style={{ originX: 0, originY: 0 }}
              >
                <circle r="20" fill="#fff" stroke="#2C3D2E" strokeWidth="3" />
                <g transform="translate(-10, -10) scale(1.4)">
                  <path
                    d="M 2 9 L 2 6 L 4 3 L 10 3 L 12 6 L 12 9 M 2 9 L 14 9 M 4 9 a 1 1 0 1 0 0.01 0 M 10 9 a 1 1 0 1 0 0.01 0"
                    fill="none"
                    stroke="#2C3D2E"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </g>
              </motion.g>
            )}
          </svg>

          {hovered && (() => {
            const stop = stops.find((s) => s.id === hovered);
            if (!stop) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-2xl bg-ink px-4 py-3 text-xs text-white shadow-lift"
                style={{
                  left: `${stop.x * 100}%`,
                  top: `${stop.y * 100}%`,
                  marginTop: -16,
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-gold">Day {stop.day}</p>
                <p className="mt-0.5 font-medium">{stop.name}</p>
                <p className="text-white/70">{stop.activity}</p>
              </motion.div>
            );
          })()}
        </div>

        <button
          onClick={replay}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink/5 py-3 text-sm font-medium transition-colors hover:bg-ink/10 md:hidden"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay journey
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stops.map((s) => (
          <div
            key={s.id}
            className="flex items-start gap-2.5 rounded-2xl border border-line/70 bg-white p-3.5"
          >
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Day {s.day}</p>
              <p className="truncate text-sm font-semibold leading-tight text-ink">{s.name}</p>
              <p className="line-clamp-2 text-xs leading-snug text-muted">{s.activity}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
