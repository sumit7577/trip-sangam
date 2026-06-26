"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Users, ShieldCheck, CheckCircle2, Phone, Clock, CreditCard, X,
  IndianRupee, CalendarClock, UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import {
  getBooking, acceptBooking, declineBooking, cancelBooking, payBalance, type Booking,
} from "@/lib/bookingApi";
import { statusLabel, statusClasses } from "@/lib/bookingStatus";
import { TravellersForm } from "@/components/trips/TravellersForm";
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

  async function onAccept() {
    setBusy(true);
    try {
      const { booking, payment } = await acceptBooking(id);
      if (payment?.redirectUrl) { window.location.href = payment.redirectUrl; return; }
      setB(booking);
      toast("Slot accepted — deposit payment will be available shortly.", "success");
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
      if (p.redirectUrl) { window.location.href = p.redirectUrl; return; }
      toast("Balance payment unavailable right now.", "error");
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
  const fillPct = dep ? Math.min(100, Math.round((dep.seatsConfirmed / dep.minCapacity) * 100)) : 0;
  const mates = b.coTravellers ?? [];
  const totalInSlot = mates.reduce((n, m) => n + (m.partySize || 0), 0);
  const remainingToGuarantee = dep ? Math.max(0, dep.minCapacity - dep.seatsConfirmed) : 0;
  const canAct = b.status === "pending";
  const isAccepted = b.status === "accepted";
  const isConfirmed = b.status === "confirmed";
  const canCancel = !["confirmed", "cancelled", "declined", "expired"].includes(b.status);

  return (
    <Shell>
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> My Trips
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{b.packageName}</h1>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(b.status)}`}>
          {statusLabel(b.status)}
        </span>
      </div>

      {/* Matched slot summary */}
      {dep ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg">Your matched slot</h2>
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink dark:bg-white/10 dark:text-white">
              Group {dep.groupLabel}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
            <Stat icon={CalendarDays} label="Trip dates" value={fmtRange(dep.startDate, dep.endDate)} />
            <Stat icon={Users} label="Your party" value={`${b.partySize} traveller${b.partySize > 1 ? "s" : ""}`} />
            {dep.priceINR > 0 && (
              <Stat icon={IndianRupee} label="Price / person" value={`₹${dep.priceINR.toLocaleString("en-IN")}`} />
            )}
            {dep.cutoffDate && (
              <Stat icon={CalendarClock} label="Book by" value={fmtDate(dep.cutoffDate)} />
            )}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {dep.isGuaranteed
                  ? "Departure guaranteed 🎉"
                  : `${remainingToGuarantee} more traveller${remainingToGuarantee === 1 ? "" : "s"} to guarantee`}
              </span>
              <span className="text-muted">{dep.seatsConfirmed}/{dep.minCapacity} confirmed · {dep.seatsLeft} seats left</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
              <div className={`h-full rounded-full ${dep.isGuaranteed ? "bg-jade" : "bg-sunset"}`} style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm text-muted dark:bg-white/5">
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

          <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white dark:bg-white/5">
            {mates.map((m, i) => (
              <div key={i} className={`flex items-center justify-between gap-3 p-4 ${m.isYou ? "bg-gold/5" : ""}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold uppercase ${m.isYou ? "bg-gradient-to-br from-gold to-crimson text-white" : "bg-ink/5 text-ink dark:bg-white/10 dark:text-white"}`}>
                    {m.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.name}{m.isYou && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone || "—"}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {m.partySize} {m.partySize === 1 ? "person" : "people"}</span>
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses(m.status)}`}>
                  {statusLabel(m.status)}
                </span>
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

      {/* Payment summary */}
      <div className="mt-6 space-y-1.5 rounded-2xl border border-line bg-white p-5 text-sm dark:bg-white/5">
        <div className="flex justify-between"><span className="text-muted">Total</span><span className="font-mono">₹{b.totalAmount.toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between"><span className="text-muted">Deposit (50%)</span><span className="font-mono">₹{b.depositAmount.toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between"><span className="text-muted">Balance</span><span className="font-mono">₹{b.balanceAmount.toLocaleString("en-IN")}</span></div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {canAct && (
          <>
            <button onClick={onAccept} disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" /> Accept & pay deposit
            </button>
            <button onClick={onDecline} disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-6 py-4 text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60">
              <X className="h-4 w-4" /> Decline
            </button>
          </>
        )}
        {isAccepted && (
          <button onClick={onAccept} disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sunset px-6 py-4 text-sm font-semibold text-white shadow-soft hover:shadow-glow disabled:opacity-60">
            <CreditCard className="h-4 w-4" /> Pay 50% deposit
          </button>
        )}
        {isConfirmed && b.paymentStatus === "deposit_paid" && b.balanceAmount > 0 && (
          <button onClick={onPayBalance} disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60">
            <CreditCard className="h-4 w-4" /> Pay balance ₹{b.balanceAmount.toLocaleString("en-IN")}
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
