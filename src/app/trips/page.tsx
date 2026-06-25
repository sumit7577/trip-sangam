"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, Users, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { getMyBookings, type Booking } from "@/lib/bookingApi";
import { statusLabel, statusClasses } from "@/lib/bookingStatus";

export default function TripsPage() {
  const { user, hydrated } = useAuth();
  const { openSignin } = useModal();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !user) return;
    getMyBookings()
      .then(setBookings)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [hydrated, user]);

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

        {bookings && bookings.length === 0 && (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-center dark:bg-white/5">
            <p className="text-muted">No trips yet.</p>
            <Link href="/#packages" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">
              Browse trips <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {bookings?.map((b) => (
            <Link key={b.id} href={`/trips/${b.id}`}
              className="block rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/40 dark:bg-white/5">
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
                <p className="mt-3 text-xs text-muted">
                  {b.departure.isGuaranteed
                    ? "✅ Departure guaranteed"
                    : `${b.departure.seatsConfirmed}/${b.departure.minCapacity} confirmed — forming`}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
