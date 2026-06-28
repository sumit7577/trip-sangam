"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Users, ShieldCheck, Phone, Clock, X,
  IndianRupee, CalendarClock, UserCheck, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import { CheckoutCard } from "@/components/trips/CheckoutCard";
import {
  getBooking, acceptBooking, declineBooking, cancelBooking, payBalance, type Booking, type PaymentInit,
} from "@/lib/bookingApi";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { statusLabel, statusClasses } from "@/lib/bookingStatus";
import { TravellersForm } from "@/components/trips/TravellersForm";
import { SlotMeter } from "@/components/trips/SlotMeter";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { openSignin } = useModal();
  const [b, setB] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(() => {
    getBooking(id).then(setB).catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  useEffect(() => {
    if (hydrated && user) load();
  }, [hydrated, user, load]);

  async function startCheckout(p: PaymentInit) {
    await openRazorpayCheckout(id, p, {
      onSuccess: (updated) => { setB(updated); toast("Payment successful — your seat is confirmed! 🎉", "success"); },
      onError: (msg) => toast(msg, "error"),
      onDismiss: () => toast("Payment cancelled — you can pay anytime.", "default"),
    });
  }

  async function onAccept() {
    setBusy(true);
    try {
      const { booking, payment } = await acceptBooking(id);
      setB(booking);
      if (payment?.razorpayOrderId) await startCheckout(payment);
      else toast("Slot accepted — deposit payment will be available shortly.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not accept", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onDecline() {
    setBusy(true);
    try {
      setB(await declineBooking(id));
      toast("You've left this group.", "default");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not decline", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onPayBalance() {
    setBusy(true);
    try {
      const p = await payBalance(id);
      if (p.razorpayOrderId) await startCheckout(p);
      else toast("Balance payment unavailable right now.", "error");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not start payment", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    setBusy(true);
    try {
      await cancelBooking(id);
      toast("Booking cancelled.", "success");
      router.push("/trips");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not cancel", "error");
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  if (hydrated && !user) {
    return (
      <Shell>
        <div className="rounded-2xl border border-line bg-white p-8 text-center dark:bg-white/5">
          <p className="text-muted">Please sign in to view this trip.</p>
          <button onClick={openSignin} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">Sign in</button>
        </div>
      </Shell>
    );
  }
  if (error) return <Shell><p className="text-crimson">{error}</p></Shell>;
  if (!b) return <Shell><p className="text-muted">Loading…</p></Shell>;

  const dep = b.departure;
  const mates = b.coTravellers ?? [];
  const totalInSlot = mates.reduce((n, m) => n + (m.partySize || 0), 0);
  // People already in the group = held + confirmed seats. The group is "formed"
  // the moment that reaches the minimum — it no longer waits on deposits.
  const seatsTaken = dep ? Math.max(dep.seatsConfirmed, dep.maxCapacity - dep.seatsLeft) : 0;
  const formed = dep ? seatsTaken >= dep.minCapacity : false;
  const remainingToForm = dep ? Math.max(0, dep.minCapacity - seatsTaken) : 0;
  const canAct = b.status === "pending";
  const isAccepted = b.status === "accepted";
  const isConfirmed = b.status === "confirmed";
  const canCancel = !["confirmed", "cancelled", "declined", "expired"].includes(b.status);
  // Group filled (≥ min) but this traveller hasn't paid the deposit yet — show
  // it as "Confirmed" rather than "Forming group".
  const groupConfirmed = formed && b.status === "pending";
  const chipLabel = groupConfirmed ? "Confirmed" : statusLabel(b.status);
  const chipClass = groupConfirmed ? "bg-jade/15 text-jade" : statusClasses(b.status);

  return (
    <Shell>
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> My Trips
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{b.packageName}</h1>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${chipClass}`}>
          {chipLabel}
        </span>
      </div>

      {/* Matched slot — futuristic seat-meter panel */}
      {dep ? (
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white to-sand/50 p-4 shadow-soft dark:border-white/10 dark:from-white/[0.07] dark:to-transparent sm:p-6">
          {/* Ambient glow + film grain for depth */}
          <div className={`pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl ${formed ? "bg-jade/20" : "bg-gold/20"}`} />
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-2 w-2 rounded-full ${formed ? "bg-jade" : "bg-gold"} animate-pulse`} />
              <h2 className="font-serif text-base sm:text-lg">Your matched slot</h2>
            </div>
            <span className="rounded-full border border-line bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-ink dark:border-white/15 dark:bg-white/10 dark:text-white">
              Group {dep.groupLabel}
            </span>
          </div>

          <div className="relative mt-5 flex items-center gap-4 sm:gap-7">
            <SlotMeter filled={seatsTaken} target={dep.minCapacity} complete={formed} />

            <div className="min-w-0 flex-1 text-left">
              <p className={`font-serif text-lg sm:text-xl ${formed ? "text-jade" : ""}`}>
                {formed
                  ? "Your trip is confirmed 🎉"
                  : `${remainingToForm} more traveller${remainingToForm === 1 ? "" : "s"} to confirm`}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formed
                  ? (dep.isGuaranteed
                      ? "Deposits are in — this departure is going ahead."
                      : "Your group is complete. Confirm your trip now with the deposit to lock your seat.")
                  : `Confirms at ${dep.minCapacity} travellers · ${dep.seatsLeft} seat${dep.seatsLeft === 1 ? "" : "s"} left in this group.`}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <Stat icon={CalendarDays} label="Trip dates" value={fmtRange(dep.startDate, dep.endDate)} />
                <Stat icon={Users} label="Your party" value={`${b.partySize} traveller${b.partySize > 1 ? "s" : ""}`} />
                {dep.priceINR > 0 && (
                  <Stat icon={IndianRupee} label="Price / person" value={`₹${dep.priceINR.toLocaleString("en-IN")}`} />
                )}
                {dep.cutoffDate && (
                  <Stat icon={CalendarClock} label="Book by" value={fmtDate(dep.cutoffDate)} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-3xl border border-line bg-white p-5 text-sm text-muted dark:border-white/10 dark:bg-white/5">
          You're on the waitlist — we'll match you into a group and show your fellow travellers here as soon as space opens.
        </p>
      )}

      {/* Who's going — fellow travellers in the same slot */}
      {dep && mates.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-serif text-xl">Who&apos;s going</h2>
            <span className="text-xs text-muted">
              {totalInSlot} traveller{totalInSlot === 1 ? "" : "s"} · {mates.length} part{mates.length === 1 ? "y" : "ies"}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {mates.map((m, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl border p-4 ${
                  m.isYou
                    ? "border-gold/50 bg-gradient-to-br from-gold/10 to-transparent"
                    : "border-line bg-white dark:border-white/10 dark:bg-white/5"
                }`}
              >
                {m.isYou && <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gold/20 blur-2xl" />}
                <div className="relative flex items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold uppercase ${m.isYou ? "bg-gradient-to-br from-gold to-jade text-white shadow-soft" : "bg-ink/5 text-ink dark:bg-white/10 dark:text-white"}`}>
                    {m.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.name}{m.isYou && <span className="ml-1.5 text-xs text-gold-600">(you)</span>}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone || "—"}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {m.partySize} {m.partySize === 1 ? "person" : "people"}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses(m.status)}`}>
                    {statusLabel(m.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {mates.length === 1 ? (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
              <UserCheck className="h-3.5 w-3.5" /> You&apos;re the first in this group — fellow travellers will appear here as they&apos;re matched in.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-muted">Phone numbers are partly masked for privacy.</p>
          )}
        </div>
      )}

      {/* Secure checkout summary */}
      <CheckoutCard total={b.totalAmount} deposit={b.depositAmount} balance={b.balanceAmount} paymentStatus={b.paymentStatus} />

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {canAct && formed && (
          <>
            <button onClick={onAccept} disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-lift disabled:opacity-60">
              <Lock className="h-4 w-4" /> Pay ₹{b.depositAmount.toLocaleString("en-IN")} securely
            </button>
            <button onClick={onDecline} disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-6 py-4 text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60">
              <X className="h-4 w-4" /> Decline
            </button>
          </>
        )}
        {canAct && !formed && (
          <>
            <div className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-white px-6 py-4 text-center text-sm font-medium text-muted dark:bg-white/5">
              <Clock className="h-4 w-4 shrink-0" /> Group still forming — {remainingToForm} more to confirm
            </div>
            <button onClick={onDecline} disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-6 py-4 text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60">
              <X className="h-4 w-4" /> Leave group
            </button>
          </>
        )}
        {isAccepted && (
          <button onClick={onAccept} disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-lift disabled:opacity-60">
            <Lock className="h-4 w-4" /> Pay ₹{b.depositAmount.toLocaleString("en-IN")} securely
          </button>
        )}
        {isConfirmed && b.paymentStatus === "deposit_paid" && b.balanceAmount > 0 && (
          <button onClick={onPayBalance} disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-lift disabled:opacity-60">
            <Lock className="h-4 w-4" /> Pay balance ₹{b.balanceAmount.toLocaleString("en-IN")} securely
          </button>
        )}
        {isConfirmed && (
          <p className="inline-flex items-center gap-2 rounded-2xl bg-jade/10 px-5 py-4 text-sm font-medium text-jade">
            <ShieldCheck className="h-4 w-4" /> Deposit paid — your seat is confirmed
          </p>
        )}
      </div>

      {isAccepted && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" /> Accepted — complete your deposit to lock your seat.
        </p>
      )}

      {(isAccepted || isConfirmed) && (
        <TravellersForm bookingId={b.id} partySize={b.partySize} />
      )}

      {canCancel && (
        <div className="mt-8 border-t border-line pt-5">
          <button onClick={() => setConfirmOpen(true)} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink/80 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:border-white/15 dark:text-white/80 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-300">
            <X className="h-4 w-4" /> Cancel this booking
          </button>
          <p className="mt-2 text-xs text-muted">Frees your spot in the group. This can&apos;t be undone.</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message="This frees your spot in the group and can't be undone."
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        busy={busy}
        onConfirm={onCancel}
        onClose={() => setConfirmOpen(false)}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-sand px-4 pb-24 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function fmtDate(s?: string): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** "30 Jun – 5 Jul 2026" (or a single full date when there's no end date). */
function fmtRange(start: string, end?: string): string {
  const s = new Date(start);
  if (!end) {
    return s.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  }
  const e = new Date(end);
  const startFmt = s.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const endFmt = e.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${startFmt} – ${endFmt}`;
}
