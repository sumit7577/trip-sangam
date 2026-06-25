"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Users, ShieldCheck, CheckCircle2, Phone, Clock, CreditCard, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import {
  getBooking, acceptBooking, declineBooking, payBalance, type Booking,
} from "@/lib/bookingApi";
import { statusLabel, statusClasses } from "@/lib/bookingStatus";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, hydrated } = useAuth();
  const { openSignin } = useModal();
  const [b, setB] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
  const canAct = b.status === "pending";
  const isAccepted = b.status === "accepted";
  const isConfirmed = b.status === "confirmed";

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

      {/* Slot summary */}
      {dep ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 dark:bg-white/5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-muted" />
              {new Date(dep.startDate).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-muted" /> Group {dep.groupLabel}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-muted" /> {b.partySize} in your party</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {dep.isGuaranteed ? "Departure guaranteed 🎉" : `${dep.seatsConfirmed}/${dep.minCapacity} confirmed to guarantee`}
              </span>
              <span className="text-muted">{dep.seatsLeft} seats left</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
              <div className={`h-full rounded-full ${dep.isGuaranteed ? "bg-jade" : "bg-sunset"}`} style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm text-muted dark:bg-white/5">
          You're on the waitlist — we'll place you in a group as soon as space opens.
        </p>
      )}

      {/* Co-travellers */}
      {b.coTravellers && b.coTravellers.length > 0 && (
        <div className="mt-6">
          <h2 className="font-serif text-xl">Your group ({b.coTravellers.length})</h2>
          <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white dark:bg-white/5">
            {b.coTravellers.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-xs font-semibold text-ink">
                    {m.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {m.name}{m.isYou && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Phone className="h-3 w-3" /> {m.phone || "—"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses(m.status)}`}>
                  {statusLabel(m.status)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">Phone numbers are partly masked for privacy.</p>
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
