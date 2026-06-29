"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Minus,
  Plus,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
  LogIn,
  Users,
} from "lucide-react";
import { useModal } from "@/lib/modal";
import { useAuth } from "@/lib/auth";
import { useCurrency, formatPrice } from "@/lib/currency";
import { toast } from "@/lib/toast";
import { createBooking, type Booking } from "@/lib/bookingApi";
import { ModalShell } from "./ModalShell";

export function BookingModal() {
  const { booking, closeBooking, openSignin } = useModal();
  const { currency } = useCurrency();
  const { user, hydrated } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState(booking?.initialDate ?? "");
  const [travelers, setTravelers] = useState(booking?.initialTravelers ?? 2);
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Booking | null>(null);

  useEffect(() => {
    if (booking) {
      setDate(booking.initialDate ?? "");
      setTravelers(booking.initialTravelers ?? 2);
      setStep("form");
      setCreated(null);
    }
  }, [booking]);

  if (!booking) return null;
  const pkg = booking.pkg;

  const subtotal = pkg.priceINR * travelers;
  const deposit = Math.round(subtotal * 0.5);
  // A party of 6+ already meets the minimum, so its group forms instantly.
  const groupFormsInstantly = travelers >= 6;

  // Success-state facts derived from the created booking's departure.
  const dep = created?.departure ?? null;
  const seatsTaken = dep ? Math.max(dep.seatsConfirmed, dep.maxCapacity - dep.seatsLeft) : 0;
  const formed = dep ? seatsTaken >= dep.minCapacity : false;
  const remainingToForm = dep ? Math.max(0, dep.minCapacity - seatsTaken) : 0;

  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      openSignin();
      return;
    }
    if (!date) {
      toast("Please pick your preferred trip date first.", "error");
      return;
    }
    setLoading(true);
    try {
      const newBooking = await createBooking({
        packageSlug: pkg.slug,
        partySize: travelers,
        preferredStartDate: date,
      });
      setCreated(newBooking);
      setStep("success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not book — please try again", "error");
    } finally {
      setLoading(false);
    }
  }

  const needsLogin = hydrated && !user;

  return (
    <AnimatePresence>
      {booking && (
        <ModalShell ariaLabel={`Book ${pkg.name}`} onClose={closeBooking}>
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Package preview header */}
                <div className="relative h-36 w-full overflow-hidden md:h-44">
                  <Image src={pkg.heroImage} alt={pkg.name} fill className="object-cover" sizes="512px" />
                  <div className="absolute inset-0 bg-ink/40" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                      Reserve your spot in a group
                    </p>
                    <h2 className="mt-1 font-serif text-2xl tracking-tight md:text-3xl">{pkg.name}</h2>
                    <div className="mt-1.5 flex items-center gap-4 text-xs text-white/80">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {pkg.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {pkg.durationDays} days
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5 px-6 pb-8 pt-6 md:px-8 md:pb-8">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                        Preferred date <span className="text-crimson">*</span>
                      </span>
                      <div className={`mt-1.5 flex h-12 items-center gap-2 rounded-2xl border bg-white px-4 focus-within:border-ink ${date ? "border-line" : "border-gold/50"}`}>
                        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
                        <input
                          type="date"
                          value={date}
                          min={today}
                          required
                          onChange={(e) => setDate(e.target.value)}
                          className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </label>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                        Travellers
                      </span>
                      <div className="mt-1.5 flex h-12 items-center justify-between rounded-2xl border border-line bg-white px-2">
                        <button type="button" onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                          className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                          aria-label="Decrease travellers">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-mono text-lg font-semibold tabular-nums">{travelers}</span>
                        <button type="button" onClick={() => setTravelers((t) => Math.min(50, t + 1))}
                          className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                          aria-label="Increase travellers">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* How grouping works */}
                  <div className="flex items-start gap-2.5 rounded-2xl bg-sand p-4 text-xs text-muted">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                    {groupFormsInstantly ? (
                      <p>
                        Your group of <span className="font-medium text-ink">{travelers}</span> already meets the
                        minimum, so it <span className="font-medium text-ink">forms instantly</span> — you can confirm
                        your trip with a <span className="font-medium text-ink">50% deposit</span> right after booking.
                      </p>
                    ) : (
                      <p>
                        We run departures in groups of up to <span className="font-medium text-ink">50</span> travellers.
                        You'll be placed in a forming group — once it's ready you can see your co-travellers, then
                        accept and pay a <span className="font-medium text-ink">50% deposit</span> to confirm your seat.
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2 rounded-2xl border border-line p-4 text-sm">
                    <Row label={`${formatPrice(pkg.priceINR, currency)} × ${travelers}`} value={formatPrice(subtotal, currency)} />
                    <div className="flex items-center justify-between border-t border-line pt-2">
                      <span className="font-semibold">Deposit to confirm (50%)</span>
                      <span className="font-mono text-lg font-bold text-ink">{formatPrice(deposit, currency)}</span>
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-jade" />
                    No charge now — you only pay once you accept your group.
                  </p>

                  {needsLogin ? (
                    <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={openSignin}
                      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold text-white transition-colors hover:bg-ink/90">
                      <LogIn className="h-4 w-4" /> Sign in to book
                    </motion.button>
                  ) : (
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60">
                      {loading ? "Reserving…" : "Reserve my spot"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </motion.button>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative flex flex-col items-center overflow-hidden px-6 py-12 text-center md:px-8 md:py-14">
                {/* Ambient glow + film grain for a futuristic feel */}
                <div className={`pointer-events-none absolute -top-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl ${formed ? "bg-jade/25" : "bg-gold/20"}`} />
                <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

                {/* Animated icon with a pulsing ring */}
                <div className="relative grid place-items-center">
                  <motion.span
                    className={`absolute h-20 w-20 rounded-full ${formed ? "bg-jade/25" : "bg-gold/25"}`}
                    animate={{ scale: [1, 1.7, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    className={`relative grid h-20 w-20 place-items-center rounded-full shadow-soft ${formed ? "bg-jade/15 text-jade" : "bg-gold/15 text-gold-600"}`}>
                    {formed ? <ShieldCheck className="h-10 w-10" /> : <CheckCircle2 className="h-10 w-10" />}
                  </motion.span>
                </div>

                <h2 className={`relative mt-6 font-serif text-3xl tracking-tight ${formed ? "text-jade" : ""}`}>
                  {formed ? "Your trip is confirmed 🎉" : "You're in a group."}
                </h2>
                <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  {formed ? (
                    <>
                      Your group for <span className="font-medium text-ink">{pkg.name}</span> is ready. Lock your seat
                      now with a 50% deposit and meet your co-travellers under{" "}
                      <span className="font-medium text-ink">My Trips</span>.
                    </>
                  ) : (
                    <>
                      We've added you to a forming group for{" "}
                      <span className="font-medium text-ink">{pkg.name}</span>. Track it under{" "}
                      <span className="font-medium text-ink">My Trips</span> — once it fills you can meet your
                      co-travellers and confirm with a deposit.
                    </>
                  )}
                </p>

                {/* Status chips */}
                <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 font-medium text-muted">
                    <Users className="h-3 w-3" /> {created?.partySize ?? travelers} traveller{(created?.partySize ?? travelers) > 1 ? "s" : ""}
                  </span>
                  {dep && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${formed ? "bg-jade/15 text-jade" : "bg-gold/15 text-gold-600"}`}>
                      {formed ? (
                        <><ShieldCheck className="h-3 w-3" /> Group formed</>
                      ) : (
                        <><Clock className="h-3 w-3" /> {remainingToForm} more to form</>
                      )}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { closeBooking(); router.push(created ? `/trips/${created.id}` : "/trips"); }}
                  className={`relative mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-soft transition ${formed ? "bg-jade hover:brightness-110" : "bg-ink hover:bg-ink/90"}`}
                >
                  {formed ? "Confirm with deposit" : "View my trip"} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${muted ? "text-muted" : ""}`}>
      <span className="truncate">{label}</span>
      <span className="shrink-0 font-mono tabular-nums">{value}</span>
    </div>
  );
}
