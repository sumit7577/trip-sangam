"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search, X, ArrowRight } from "lucide-react";
import type { Package } from "@/types";
import { PackageCard } from "@/components/home/PackageCard";
import { useCurrency, formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Initial = { q?: string; category?: string; sort?: string; duration?: string };

const DURATIONS = [
  { key: "any", label: "Any length", test: () => true },
  { key: "short", label: "≤ 3 days", test: (d: number) => d <= 3 },
  { key: "mid", label: "4 – 7 days", test: (d: number) => d >= 4 && d <= 7 },
  { key: "long", label: "8 – 14 days", test: (d: number) => d >= 8 && d <= 14 },
  { key: "epic", label: "15 days +", test: (d: number) => d >= 15 },
] as const;

const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
  { key: "duration_asc", label: "Duration: short to long" },
  { key: "rating", label: "Top rated" },
] as const;

export function PackagesBrowser({ packages, initial }: { packages: Package[]; initial: Initial }) {
  const { currency } = useCurrency();

  const categories = useMemo(() => {
    const present = Array.from(new Set(packages.map((p) => p.category)));
    return ["All", ...present];
  }, [packages]);

  const priceBounds = useMemo(() => {
    const prices = packages.map((p) => p.priceINR);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [packages]);

  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState(
    initial.category && categories.includes(initial.category) ? initial.category : "All"
  );
  const [duration, setDuration] = useState(
    DURATIONS.some((d) => d.key === initial.duration) ? (initial.duration as string) : "any"
  );
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sort, setSort] = useState(
    SORTS.some((s) => s.key === initial.sort) ? (initial.sort as string) : "recommended"
  );
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const durTest = DURATIONS.find((d) => d.key === duration)?.test ?? (() => true);
    let list = packages.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!durTest(p.durationDays)) return false;
      if (p.priceINR > maxPrice) return false;
      if (query) {
        const hay = `${p.name} ${p.location} ${p.category} ${p.shortDescription}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price_asc": return a.priceINR - b.priceINR;
        case "price_desc": return b.priceINR - a.priceINR;
        case "duration_asc": return a.durationDays - b.durationDays;
        case "rating": return b.rating - a.rating;
        default: return b.rating * b.reviewCount - a.rating * a.reviewCount;
      }
    });
    return list;
  }, [packages, q, category, duration, maxPrice, sort]);

  const hasActiveFilters = category !== "All" || duration !== "any" || maxPrice < priceBounds.max || q.trim() !== "";

  function clearAll() {
    setQ(""); setCategory("All"); setDuration("any"); setMaxPrice(priceBounds.max); setSort("recommended");
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-[260px_1fr]">
      {/* ---- Filters (sidebar on lg, collapsible sheet on mobile) ---- */}
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        {/* mobile toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="mb-4 inline-flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft dark:bg-white/5 dark:text-white lg:hidden"
        >
          <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
          {hasActiveFilters && <span className="rounded-full bg-sunset px-2 py-0.5 text-[10px] text-white">Active</span>}
        </button>

        <div className={cn("space-y-7 rounded-3xl border border-line bg-white p-5 shadow-soft dark:bg-white/5 lg:block", showFilters ? "block" : "hidden")}>
          {/* search */}
          <div>
            <Label>Search</Label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-sand/50 px-3 dark:bg-white/5">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Everest, Pokhara…"
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
              {q && <button onClick={() => setQ("")} aria-label="Clear"><X className="h-3.5 w-3.5 text-muted" /></button>}
            </div>
          </div>

          {/* category */}
          <div>
            <Label>Category</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Chip>
              ))}
            </div>
          </div>

          {/* duration */}
          <div>
            <Label>Duration</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Chip key={d.key} active={duration === d.key} onClick={() => setDuration(d.key)}>{d.label}</Chip>
              ))}
            </div>
          </div>

          {/* price */}
          <div>
            <Label>Max price</Label>
            <p className="mt-2 font-mono text-sm font-semibold text-ink dark:text-white">{formatPrice(maxPrice, currency)}</p>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 w-full accent-sunset"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
              <span>{formatPrice(priceBounds.min, currency)}</span>
              <span>{formatPrice(priceBounds.max, currency)}</span>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson hover:underline">
              <X className="h-3.5 w-3.5" /> Clear all filters
            </button>
          )}
        </div>
      </aside>

      {/* ---- Results ---- */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink dark:text-white">{results.length}</span> trip{results.length === 1 ? "" : "s"} found
            {category !== "All" && <> in <span className="text-ink dark:text-white">{category}</span></>}
          </p>
          <label className="inline-flex items-center gap-2 text-sm">
            <span className="text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink outline-none focus:border-ink dark:bg-white/5 dark:text-white dark:[&>option]:text-ink"
            >
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-line bg-white p-12 text-center dark:bg-white/5">
            <p className="font-serif text-2xl tracking-tight">No trips match your filters</p>
            <p className="mt-2 text-sm text-muted">Try widening the price range or clearing a filter.</p>
            <button onClick={clearAll} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">
              Clear filters <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <motion.div layout className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {results.map((pkg, i) => (
                <PackageCard key={pkg.slug} pkg={pkg} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{children}</p>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-transparent bg-sunset text-white shadow-glow"
          : "border-ink/15 bg-white text-ink hover:border-crimson/40 hover:text-crimson dark:border-white/15 dark:bg-transparent dark:text-white/80"
      )}
    >
      {children}
    </button>
  );
}
