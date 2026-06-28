"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Futuristic "Secure Checkout" summary. Presentational only — the actual
 * payment runs through PhonePe via the page's pay button. We never collect
 * card/UPI details on our domain (PhonePe's secure page does that).
 */
export function CheckoutCard({
  total, deposit, balance, paymentStatus,
}: {
  total: number; deposit: number; balance: number; paymentStatus: string;
}) {
  const depositPaid = paymentStatus === "deposit_paid" || paymentStatus === "fully_paid";
  const fullyPaid = paymentStatus === "fully_paid";
  const payNow = fullyPaid ? 0 : depositPaid ? balance : deposit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 overflow-hidden rounded-3xl border border-line/70 bg-white/70 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line/60 px-5 py-4 dark:border-white/10">
        <h3 className="flex items-center gap-2 font-serif text-lg tracking-tight">
          <Lock className="h-4 w-4 text-jade" /> Secure checkout
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-jade/12 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-jade">
          256-bit SSL
        </span>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 px-5 py-4 text-sm">
        <Row label="Trip total" value={inr(total)} />
        <Row label="Deposit (50%)" value={inr(deposit)} muted strike={depositPaid} />
        <Row label="Balance (pay later)" value={inr(balance)} muted strike={fullyPaid} />
      </div>

      {/* Pay-now highlight */}
      {!fullyPaid && (
        <div className="relative mx-5 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-crimson/20 px-4 py-3.5 ring-1 ring-inset ring-ink/5 dark:ring-white/10">
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gold/20 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-sm font-medium text-ink dark:text-white">
              {depositPaid ? "Balance due now" : "Pay now to lock your seat"}
            </span>
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 18 }}
              className="font-mono text-2xl font-bold text-ink dark:text-white"
            >
              {inr(payNow)}
            </motion.span>
          </div>
        </div>
      )}

      {/* Accepted methods */}
      <div className="border-t border-line/60 px-5 py-4 dark:border-white/10">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Pay with</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Upi /> <Visa /> <Mastercard /> <Rupay />
          <Chip>Net Banking</Chip>
          <Chip>Wallets</Chip>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line/60 px-5 py-3 text-[11px] text-muted dark:border-white/10">
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

/* ---- lightweight payment marks (no trademarked image files) ---- */

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex h-6 items-center rounded-md border border-ink/10 bg-white px-2 text-[11px] font-bold leading-none shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white",
      className
    )}>
      {children}
    </span>
  );
}

function Upi() {
  return <Chip className="tracking-tight"><span className="text-[#0B7D3E]">U</span><span className="text-[#E97A28]">P</span><span className="text-[#0B7D3E]">I</span></Chip>;
}
function Visa() {
  return <Chip className="italic tracking-tight text-[#1A1F71] dark:text-[#7c84d6]">VISA</Chip>;
}
function Rupay() {
  return <Chip className="tracking-tight"><span className="text-[#097DC6]">Ru</span><span className="text-[#F58220]">Pay</span></Chip>;
}
function Mastercard() {
  return (
    <Chip>
      <span className="relative inline-flex h-3.5 w-6 items-center" aria-label="Mastercard">
        <span className="absolute left-0 h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
        <span className="absolute left-2.5 h-3.5 w-3.5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
      </span>
    </Chip>
  );
}
