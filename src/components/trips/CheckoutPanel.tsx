"use client";

import { motion } from "framer-motion";
import {
  Lock, ShieldCheck, BadgeCheck, Gift, Clock, X,
  Smartphone, CreditCard, Landmark, Wallet, Building2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WELCOME_OFFER } from "@/components/layout/PromoBanner";
import type { Booking } from "@/lib/bookingApi";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ============================================================ *
 *  RIGHT COLUMN — sticky "Price summary / Total due" card
 *  (mirrors goibibo's Total Due panel; the actual UPI/card entry
 *   happens in Razorpay's secure modal via the Pay button)
 * ============================================================ */
export function PriceSummary({
  booking, formed, remainingToForm, busy, dateRange, onAccept, onDecline, onPayDeposit, onPayBalance,
}: {
  booking: Booking;
  formed: boolean;
  remainingToForm: number;
  busy: boolean;
  dateRange?: string;
  onAccept: () => void;
  onDecline: () => void;
  onPayDeposit: () => void;
  onPayBalance: () => void;
}) {
  const b = booking;
  const canAct = b.status === "pending";
  const isAccepted = b.status === "accepted";
  const isConfirmed = b.status === "confirmed";
  const depositPaid = b.paymentStatus === "deposit_paid" || b.paymentStatus === "fully_paid";
  const fullyPaid = b.paymentStatus === "fully_paid";
  const payNow = fullyPaid ? 0 : depositPaid ? b.balanceAmount : b.depositAmount;
  const canPayNow = (canAct && formed) || isAccepted || (isConfirmed && depositPaid && !fullyPaid && b.balanceAmount > 0);
  const primaryPay = isAccepted ? onPayDeposit : canAct && formed ? onAccept : onPayBalance;
  const payLabel = depositPaid ? `Pay balance ${inr(b.balanceAmount)}` : `Pay ${inr(b.depositAmount)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-3xl border border-line/70 bg-white/80 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
    >
      {/* Package image header */}
      <div className="relative h-36 overflow-hidden">
        {b.packageImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.packageImage} alt={b.packageName} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-crimson/80" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="relative flex h-full flex-col justify-between p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"><Lock className="h-3 w-3" /> Secure checkout</span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur">256-bit SSL</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg leading-tight tracking-tight drop-shadow-sm">{b.packageName}</p>
            {dateRange && <p className="mt-0.5 text-xs text-white/85">{dateRange}</p>}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <p className="px-5 pt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Price summary</p>
      <div className="space-y-2 px-5 pb-4 pt-2 text-sm">
        <Row label="Trip total" value={inr(b.totalAmount)} />
        <Row label="Deposit (50%)" value={inr(b.depositAmount)} muted strike={depositPaid} />
        <Row label="Balance (pay later)" value={inr(b.balanceAmount)} muted strike={fullyPaid} />
      </div>

      {/* Total due now */}
      {!fullyPaid && (
        <div className="relative mx-5 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-crimson/20 px-4 py-3.5 ring-1 ring-inset ring-ink/5 dark:ring-white/10">
          <div aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gold/25 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-sm font-medium text-ink dark:text-white">
              {depositPaid ? "Balance due now" : canPayNow ? "Total due now" : "Deposit to confirm"}
            </span>
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.12, type: "spring", stiffness: 240, damping: 18 }}
              className="font-mono text-2xl font-bold text-ink dark:text-white"
            >
              {inr(payNow)}
            </motion.span>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="space-y-2.5 px-5 pb-4">
        {fullyPaid ? (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-jade/10 px-5 py-4 text-sm font-semibold text-jade"><ShieldCheck className="h-4 w-4" /> Fully paid — you&apos;re all set</div>
        ) : isConfirmed && depositPaid && b.balanceAmount === 0 ? (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-jade/10 px-5 py-4 text-sm font-semibold text-jade"><ShieldCheck className="h-4 w-4" /> Deposit paid — seat confirmed</div>
        ) : canPayNow ? (
          <button onClick={primaryPay} disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-lift disabled:opacity-60">
            <Lock className="h-4 w-4" /> {payLabel} securely
          </button>
        ) : canAct && !formed ? (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-5 py-4 text-center text-sm font-medium text-muted dark:bg-white/5 dark:border-white/10"><Clock className="h-4 w-4 shrink-0" /> Group forming — {remainingToForm} more to confirm</div>
        ) : null}

        {canAct && (
          <button onClick={onDecline} disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-6 py-3.5 text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60 dark:text-white dark:hover:border-white/30">
            <X className="h-4 w-4" /> {formed ? "Decline" : "Leave group"}
          </button>
        )}

        {isAccepted && (
          <p className="flex items-center gap-1.5 pt-0.5 text-xs text-muted"><Clock className="h-3.5 w-3.5" /> Complete your deposit to lock your seat.</p>
        )}
      </div>

      {/* Trust */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/60 px-5 py-3 text-[11px] text-muted dark:border-white/10">
        <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-jade" /> Powered by Razorpay</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-jade" /> 100% secure · RBI-compliant</span>
      </div>
    </motion.div>
  );
}

function Row({ label, value, muted, strike }: { label: string; value: string; muted?: boolean; strike?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", muted && "text-muted")}>
      <span>{label}</span>
      <span className={cn("font-mono", strike && "text-muted line-through")}>{value}</span>
    </div>
  );
}

/* ============================================================ *
 *  LEFT COLUMN — offers strip (the real SANGAM101 welcome offer)
 * ============================================================ */
export function OffersStrip() {
  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
      <h3 className="flex items-center gap-2 font-serif text-lg"><Gift className="h-4 w-4 text-jade" /> Offers for you</h3>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-jade/40 bg-jade/[0.06] p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-jade/15 text-jade"><Gift className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-tight text-ink dark:text-white">{WELCOME_OFFER.code}</span>
            <span className="rounded-full bg-jade/15 px-2 py-0.5 text-[11px] font-bold text-jade">{WELCOME_OFFER.percent}% OFF</span>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-muted">Save {WELCOME_OFFER.percent}% on your first Trip Sangam booking — mention this code when you book.</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ *
 *  LEFT COLUMN — payment options preview (mirrors goibibo's list;
 *  you actually pick your method inside Razorpay's secure window)
 * ============================================================ */
const METHODS = [
  { icon: Smartphone, label: "UPI", sub: "GPay, PhonePe, Paytm & all UPI apps" },
  { icon: CreditCard, label: "Credit / Debit / ATM Card", sub: "Visa, Mastercard, RuPay, Amex" },
  { icon: Landmark, label: "Net Banking", sub: "All major banks supported" },
  { icon: Wallet, label: "Wallets", sub: "Amazon Pay, Mobikwik & more" },
  { icon: Building2, label: "EMI / Pay Later", sub: "Card EMI & Pay Later options" },
];

export function PaymentMethods({ onPay, payable, busy }: { onPay: () => void; payable: boolean; busy: boolean }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-line/70 px-5 py-4 dark:border-white/10">
        <h3 className="font-serif text-lg">Payment options</h3>
        <p className="mt-0.5 text-xs text-muted">
          {payable ? "Tap any method to pay securely." : "Available once your seat is ready to pay."}
        </p>
      </div>
      <div className="divide-y divide-line/60 dark:divide-white/5">
        {METHODS.map((m) => {
          const inner = (
            <>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink/[0.04] text-ink dark:bg-white/10 dark:text-white"><m.icon className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="truncate text-xs text-muted">{m.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted/60" />
            </>
          );
          return payable ? (
            <button
              key={m.label} onClick={onPay} disabled={busy}
              className="flex w-full items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-gold/[0.06] disabled:opacity-60 dark:hover:bg-white/[0.04]"
            >
              {inner}
            </button>
          ) : (
            <div key={m.label} className="flex items-center gap-3.5 px-5 py-3.5 opacity-70">{inner}</div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-line/70 px-5 py-3 text-[11px] text-muted dark:border-white/10">
        <ShieldCheck className="h-3.5 w-3.5 text-jade" /> You&apos;ll choose your exact method on Razorpay&apos;s secure window.
      </div>
    </div>
  );
}
