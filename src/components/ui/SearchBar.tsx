"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Search, Minus, Plus, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Package } from "@/types";
import { cn } from "@/lib/utils";

type Popover = "dest" | "trav" | "date" | null;

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function SearchBar({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [popover, setPopover] = useState<Popover>(null);
  const [cal, setCal] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const formRef = useRef<HTMLFormElement>(null);

  function openDate() {
    if (date) { const [y, m] = date.split("-").map(Number); setCal({ y, m: m - 1 }); }
    else { const d = new Date(); setCal({ y: d.getFullYear(), m: d.getMonth() }); }
    setPopover(popover === "date" ? null : "date");
  }
  function shiftMonth(by: number) {
    setCal(({ y, m }) => { const d = new Date(y, m + by, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  }
  function pickDate(d: number) {
    setDate(`${cal.y}-${String(cal.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setPopover(null);
  }

  // Click outside closes any open popover
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    if (!destination) return packages.slice(0, 4);
    const q = destination.toLowerCase();
    return packages
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [destination, packages]);

  const dateDisplay = date
    ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const totalTravelers = adults + children;
  const travelersDisplay =
    children > 0
      ? `${adults} adult${adults === 1 ? "" : "s"} · ${children} child${children === 1 ? "" : "ren"}`
      : `${adults} adult${adults === 1 ? "" : "s"}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPopover(null);
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (totalTravelers) params.set("travellers", String(totalTravelers));
    if (date) params.set("date", date);
    const qs = params.toString();
    router.push(qs ? `/packages?${qs}` : "/packages");
  }

  return (
    <>
      <AnimatePresence>
        {popover !== null && (
          <motion.div
            key="popover-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] md:hidden"
            onClick={() => setPopover(null)}
          />
        )}
      </AnimatePresence>
    <motion.form
      ref={formRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={onSubmit}
      className={cn(
        "glass relative mx-auto mt-8 w-full max-w-4xl rounded-[28px] p-2 text-left shadow-lift md:mt-10 md:rounded-full md:p-1.5",
        popover ? "z-50" : "z-30"
      )}
    >
      <div className="flex flex-col items-stretch gap-1 md:flex-row md:items-stretch md:gap-0">
        {/* DESTINATION */}
        <Field
          icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />}
          label="Where to"
          active={popover === "dest"}
          onActivate={() => setPopover("dest")}
          first
        >
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setPopover("dest")}
            placeholder="Annapurna, Everest, Pokhara…"
            className="w-full min-w-0 border-none bg-transparent text-sm font-medium text-ink placeholder:font-normal placeholder:text-ink/35 focus:outline-none"
          />
        </Field>

        <Divider />

        {/* DATE — custom calendar popover (works identically on mobile/tablet/desktop) */}
        <Field
          icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />}
          label="When"
          active={popover === "date"}
          onActivate={openDate}
        >
          <span className={cn("block truncate text-sm", date ? "font-medium text-ink" : "text-ink/35")}>
            {dateDisplay || "Add dates"}
          </span>
        </Field>

        <Divider />

        {/* TRAVELERS */}
        <Field
          icon={<Users className="h-3.5 w-3.5" strokeWidth={1.5} />}
          label="Travelers"
          active={popover === "trav"}
          onActivate={() => setPopover(popover === "trav" ? null : "trav")}
        >
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <span className="truncate">{travelersDisplay}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 shrink-0 text-muted transition-transform",
                popover === "trav" && "rotate-180"
              )}
            />
          </span>
        </Field>

        {/* SEARCH BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="mt-2 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-semibold tracking-wide text-white shadow-glow transition-colors hover:bg-ink/90 md:ml-1 md:mt-0 md:h-auto md:min-h-[52px] md:rounded-full md:px-6 md:text-sm"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <span>Search</span>
        </motion.button>
      </div>

      {/* DESTINATION DROPDOWN */}
      <AnimatePresence>
        {popover === "dest" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-50 mt-3 max-h-[60dvh] overflow-y-auto rounded-2xl border border-line/60 bg-white p-1.5 shadow-[0_24px_64px_-20px_rgba(28,28,26,0.35)] ring-1 ring-ink/5 md:max-h-none md:overflow-hidden"
          >
            <p className="px-2.5 pb-1.5 pt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
              {destination ? `Matches for "${destination}"` : "Popular right now"}
            </p>
            {suggestions.length > 0 ? (
              <ul className="space-y-0.5">
                {suggestions.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setDestination(p.name);
                        setPopover(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sand"
                    >
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                        <Image src={p.heroImage} alt="" fill sizes="36px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-tight text-ink">{p.name}</p>
                        <p className="truncate text-[11px] leading-tight text-muted">
                          {p.location} · {p.durationDays}d
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted">
                        ₹{Math.round(p.priceINR / 1000)}k
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-6 text-center text-sm text-muted">
                Nothing matches "<span className="text-ink">{destination}</span>".
                <br />
                Try "Everest", "Pokhara" or "Chitwan".
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRAVELERS POPOVER */}
      <AnimatePresence>
        {popover === "trav" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-line/60 bg-white p-4 shadow-[0_24px_64px_-20px_rgba(28,28,26,0.35)] ring-1 ring-ink/5 md:left-auto md:w-80"
          >
            <Counter
              label="Adults"
              hint="Ages 18+"
              value={adults}
              min={1}
              max={10}
              onChange={setAdults}
            />
            <div className="my-3 h-px bg-line" />
            <Counter
              label="Children"
              hint="Ages 2–17"
              value={children}
              min={0}
              max={6}
              onChange={setChildren}
            />
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DATE POPOVER — custom calendar (consistent on mobile / tablet / desktop) */}
      <AnimatePresence>
        {popover === "date" && (() => {
          const firstDow = new Date(cal.y, cal.m, 1).getDay();
          const daysIn = new Date(cal.y, cal.m + 1, 0).getDate();
          const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
          const t = new Date();
          const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-full z-50 mt-3 w-[20rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-line/60 bg-white p-4 shadow-[0_24px_64px_-20px_rgba(28,28,26,0.35)] ring-1 ring-ink/5"
            >
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-ink">{MONTHS_LONG[cal.m]} {cal.y}</p>
                <button type="button" onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
                {DOW.map((d) => <span key={d}>{d}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (d === null) return <span key={i} />;
                  const iso = `${cal.y}-${String(cal.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const past = iso < todayIso;
                  const on = date === iso;
                  return (
                    <button key={i} type="button" disabled={past} onClick={() => pickDate(d)}
                      className={cn(
                        "grid h-9 place-items-center rounded-lg text-sm transition-colors",
                        on ? "bg-ink font-semibold text-white" : past ? "cursor-not-allowed text-ink/25" : "text-ink hover:bg-sand"
                      )}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.form>
    </>
  );
}

/* ----- subcomponents ----- */

function Field({
  icon,
  label,
  active,
  onActivate,
  children,
  first,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onActivate?: () => void;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      onClick={onActivate}
      className={cn(
        "group relative flex flex-1 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all md:rounded-full md:px-5 md:py-3",
        active ? "bg-white shadow-soft" : "hover:bg-white/40"
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors md:h-auto md:w-auto md:bg-transparent",
          active ? "bg-ink/5 text-ink" : "bg-white/45 text-ink/65 md:bg-transparent"
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-ink/55">
          {label}
        </span>
        <span className="min-h-[18px] leading-tight">{children}</span>
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="hidden self-center md:flex">
      <div className="h-7 w-px bg-ink/10" />
    </div>
  );
}

function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center font-mono text-base font-semibold tabular-nums text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
