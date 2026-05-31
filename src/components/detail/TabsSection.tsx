"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PackageDetail } from "@/types";
import { Itinerary } from "./Itinerary";
import { Inclusions } from "./Inclusions";
import { Gallery } from "./Gallery";
import { Reviews } from "./Reviews";
import { FAQ } from "./FAQ";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Itinerary", "Inclusions", "Gallery", "Reviews", "FAQ"] as const;
type Tab = (typeof tabs)[number];

export function TabsSection({ pkg }: { pkg: PackageDetail }) {
  const [active, setActive] = useState<Tab>("Overview");
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setStuck(!e.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mt-12">
      <div ref={sentinel} />
      <div
        className={cn(
          "sticky top-[var(--header-h)] z-30 -mx-5 border-b border-ink/8 bg-sand/90 backdrop-blur-xl transition-shadow md:-mx-8",
          stuck && "shadow-soft"
        )}
      >
        <div className="no-scrollbar flex overflow-x-auto px-5 md:px-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setActive(t);
                if (t === "Reviews") {
                  setTimeout(() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }
              }}
              className={cn(
                "relative whitespace-nowrap px-5 py-4 text-sm font-medium transition-colors",
                active === t ? "text-ink" : "text-muted hover:text-ink"
              )}
            >
              {t}
              {active === t && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-3 -bottom-px h-0.5 bg-crimson"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pt-12"
        >
          {active === "Overview" && <Overview pkg={pkg} />}
          {active === "Itinerary" && <Itinerary days={pkg.itinerary} />}
          {active === "Inclusions" && <Inclusions inclusions={pkg.inclusions} exclusions={pkg.exclusions} />}
          {active === "Gallery" && <Gallery images={pkg.galleryImages} />}
          {active === "Reviews" && <Reviews pkg={pkg} />}
          {active === "FAQ" && <FAQ items={pkg.faqs} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Overview({ pkg }: { pkg: PackageDetail }) {
  const glance = [
    { k: "Trip style", v: pkg.tripStyle },
    { k: "Max altitude", v: pkg.maxAltitude },
    { k: "Daily walking", v: pkg.dailyWalking },
    { k: "Start / End", v: pkg.startEnd },
    { k: "Min age", v: pkg.minAge },
    { k: "Languages", v: pkg.languages },
  ].filter((item) => item.v);

  // Pull quote is stored as "quote — attribution". Split the two parts and
  // strip any quote marks the editor already typed so we don't double them up.
  const [rawQuote, attribution] = pkg.pullQuote
    ? pkg.pullQuote.split(" — ")
    : ["", ""];
  const quote = rawQuote.trim().replace(/^["'“”]+|["'“”]+$/g, "");

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
      <div className="min-w-0 md:col-span-8">
        <p className="pretty font-serif text-xl leading-relaxed text-ink md:text-2xl">
          {pkg.longDescription}
        </p>
        {quote && (
          <blockquote className="my-12 border-l-2 border-crimson pl-6">
            <p className="font-serif text-2xl italic leading-snug text-ink md:text-3xl">
              "{quote}"
            </p>
            {attribution?.trim() && (
              <footer className="mt-3 text-sm uppercase tracking-wider text-muted">
                — {attribution.trim()}
              </footer>
            )}
          </blockquote>
        )}
        {pkg.overviewNote && (
          <div className="prose prose-stone max-w-none">
            <p className="whitespace-pre-line text-base leading-relaxed text-muted">
              {pkg.overviewNote}
            </p>
          </div>
        )}
      </div>
      {glance.length > 0 && (
        <div className="min-w-0 md:col-span-4">
          <div className="rounded-3xl border border-ink/8 bg-white p-6">
            <h3 className="font-serif text-xl">At a glance</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {glance.map((item) => (
                <Item key={item.k} k={item.k} v={item.v} />
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink/6 pb-2 last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
