"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Minus, Plus, ShieldCheck, Zap, BadgePercent, Share2, Heart, ArrowRight, Sparkles } from "lucide-react";
import type { PackageDetail } from "@/types";
import { useCurrency, formatPrice, convert } from "@/lib/currency";
import { useWishlist } from "@/lib/wishlist";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import { cn, formatINR } from "@/lib/utils";

export function BookingCard({ pkg }: { pkg: PackageDetail }) {
  const { currency } = useCurrency();
  const { has, toggle } = useWishlist();
  const { openBooking } = useModal();
  const [travelers, setTravelers] = useState(2);
  const [date, setDate] = useState("");
  const saved = has(pkg.slug);

  function onSave() {
    const wasSaved = saved;
    toggle(pkg.slug);
    toast(wasSaved ? "Removed from wishlist" : "Saved to wishlist", "success");
  }

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: pkg.name,
      text: `${pkg.name} — ${pkg.shortDescription}`,
      url,
    };
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
        return;
      } catch {
        /* user dismissed */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard", "success");
        return;
      } catch {
        /* fall through */
      }
    }
    toast("Share unavailable on this browser", "error");
  }

  const subtotal = pkg.priceINR * travelers;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-line/70 bg-white p-6 shadow-lift"
    >
      {/* Price header — creative iOS-style hero pricing */}
      <PricingHero pkg={pkg} />

      {/* Inputs */}
      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Departure date</span>
          <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none"
            />
          </div>
        </label>

        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Travelers</span>
          <div className="mt-1.5 flex h-12 items-center justify-between rounded-2xl border border-line bg-white px-2">
            <button
              onClick={() => setTravelers((t) => Math.max(1, t - 1))}
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink active:scale-90"
              aria-label="Decrease travelers"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-mono text-lg font-semibold tabular-nums text-ink">{travelers}</span>
            <button
              onClick={() => setTravelers((t) => Math.min(10, t + 1))}
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink active:scale-90"
              aria-label="Increase travelers"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
        <Row
          label={`${formatPrice(pkg.priceINR, currency)} × ${travelers}`}
          value={formatPrice(subtotal, currency)}
        />
        <Row label="Taxes & permits" value={formatPrice(taxes, currency)} muted />
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="font-mono text-xl font-bold text-ink">{formatPrice(total, currency)}</span>
        </div>
      </div>

      {/* CTAs */}
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => openBooking({ pkg, initialDate: date, initialTravelers: travelers })}
        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold tracking-tight text-white shadow-glow transition-colors hover:bg-ink/90"
      >
        Book This Journey
        <ArrowRight className="h-4 w-4" />
      </motion.button>
      <p className="mt-2 text-center text-xs text-muted">
        No charge now — you join a forming group and only pay the deposit once it fills.
      </p>

      {/* Trust */}
      <ul className="mt-5 space-y-2.5 text-xs text-muted">
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-jade" />
          Free cancellation up to 30 days
        </li>
        <li className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 shrink-0 text-gold" />
          Instant confirmation
        </li>
        <li className="flex items-center gap-2">
          <BadgePercent className="h-3.5 w-3.5 shrink-0 text-crimson" />
          Best price guarantee
        </li>
      </ul>

      {/* Save / Share */}
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <Heart className={cn("h-4 w-4 transition-colors", saved && "fill-crimson text-crimson")} />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={onShare}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </motion.aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", muted && "text-muted")}>
      <span className="truncate">{label}</span>
      <span className="shrink-0 font-mono tabular-nums">{value}</span>
    </div>
  );
}

function PricingHero({ pkg }: { pkg: PackageDetail }) {
  const { currency } = useCurrency();
  const savings = pkg.originalPriceINR - pkg.priceINR;
  const savingsInCurrency = convert(savings, currency);
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "Rs";
  const savingsShort =
    savingsInCurrency >= 1000
      ? `${symbol}${Math.round(savingsInCurrency / 1000)}K`
      : `${symbol}${formatINR(savingsInCurrency)}`;

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">From</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-[36px] font-bold leading-none tracking-tight text-ink"
            >
              {formatPrice(pkg.priceINR, currency)}
            </motion.span>
            <span className="font-mono text-sm text-muted/80 line-through">
              {formatPrice(pkg.originalPriceINR, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">per person · twin share</p>
        </div>

        {/* Discount tag (top-right corner) */}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-white ring-1 ring-white/20">
          <BadgePercent className="h-3 w-3" />
          −{pkg.discountPct}%
        </span>
      </div>

      {/* Animated savings pill */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-jade/12 px-2.5 py-1"
      >
        <motion.span
          animate={{ rotate: [0, 14, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-jade"
        >
          <Sparkles className="h-3 w-3" />
        </motion.span>
        <span className="font-mono text-[11px] font-bold tracking-wider text-jade">
          You save {savingsShort}
        </span>
      </motion.div>
    </div>
  );
}
