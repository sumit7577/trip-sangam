"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, Users, LogIn, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import { getMyBookings, cancelBooking, type Booking } from "@/lib/bookingApi";
import { statusLabel, statusClasses } from "@/lib/bookingStatus";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Bookings the user has finished with — hidden from "My Trips".
const TERMINAL = ["cancelled", "declined", "expired"];

export default function TripsPage() {
  const { user, hydrated } = useAuth();
  const { openSignin } = useModal();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated || !user) return;
    getMyBookings()
      .then(setBookings)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [hydrated, user]);

  async function doCancel() {
    if (confirmId == null) return;
    const id = confirmId;
    setCancelling(true);
    try {
      await cancelBooking(id);
      setBookings((prev) => (prev ? prev.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)) : prev));
      toast("Trip cancelled.", "success");
      setConfirmId(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not cancel", "error");
    } finally {
      setCancelling(false);
    }
  }

  const visible = bookings?.filter((b) => !TERMINAL.includes(b.status)) ?? null;

  return (
    <main className="min-h-screen bg-sand px-4 pb-24 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 font-serif text-4xl tracking-tight">
          <Briefcase className="h-7 w-7" /> My Trips
        </h1>
        <p className="mt-2 text-sm text-muted">Your group bookings and slot status.</p>

        {hydrated && !user && (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-center dark:bg-white/5">
            <p className="text-muted">Please sign in to see your trips.</p>
            <button onClick={openSignin}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          </div>
        )}

        {hydrated && user && error && (
          <p className="mt-10 text-sm text-crimson">{error}</p>
        )}

        {hydrated && user && !error && bookings === null && (
          <p className="mt-10 text-sm text-muted">Loading…</p>
        )}

        {visible && visible.length === 0 && (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-center dark:bg-white/5">
            <p className="text-muted">No trips yet.</p>
            <Link href="/#packages" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">
              Browse trips <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {visible?.map((b) => (
            <div key={b.id}
              className="relative rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/40 dark:bg-white/5">
              {/* Whole-card link sits behind the content; the Cancel button stays clickable above it. */}
              <Link href={`/trips/${b.id}`} className="absolute inset-0 z-0" aria-label={`View ${b.packageName}`} />
              <div className="pointer-events-none relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl">{b.packageName}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      {b.departure && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(b.departure.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          {" "}· Group {b.departure.groupLabel}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {b.partySize} traveller{b.partySize > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(b.status)}`}>
                    {statusLabel(b.status)}
                  </span>
                </div>
                {b.departure && (
                  b.departure.isGuaranteed ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-jade">
                      <ShieldCheck className="h-3.5 w-3.5" /> Departure confirmed
                    </p>
                  ) : (
                    <div className="mt-3 max-w-xs">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: b.departure.minCapacity }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i < b.departure!.seatsConfirmed ? "bg-gold" : "bg-ink/10 dark:bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted">
                        {b.departure.seatsConfirmed}/{b.departure.minCapacity} confirmed · {Math.max(0, b.departure.minCapacity - b.departure.seatsConfirmed)} to go
                      </p>
                    </div>
                  )
                )}
              </div>

              {b.status !== "confirmed" && (
                <button
                  onClick={() => setConfirmId(b.id)}
                  className="relative z-10 mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink/80 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-white/15 dark:text-white/80 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <X className="h-3.5 w-3.5" /> Cancel trip
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Cancel this trip?"
        message="This frees your spot in the group and can't be undone."
        confirmLabel="Yes, cancel trip"
        cancelLabel="Keep trip"
        busy={cancelling}
        onConfirm={doCancel}
        onClose={() => setConfirmId(null)}
      />
    </main>
  );
}
