"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Minus,
  Plus,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import { useModal } from "@/lib/modal";
import { useCurrency, formatPrice } from "@/lib/currency";
import { toast } from "@/lib/toast";
import { ModalShell } from "./ModalShell";

export function BookingModal() {
  const { booking, closeBooking } = useModal();
  const { currency } = useCurrency();

  const [date, setDate] = useState(booking?.initialDate ?? "");
  const [travelers, setTravelers] = useState(booking?.initialTravelers ?? 2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);

  // Reset form state on (re)open with new package
  useEffect(() => {
    if (booking) {
      setDate(booking.initialDate ?? "");
      setTravelers(booking.initialTravelers ?? 2);
      setStep("form");
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [booking]);

  if (!booking) return null;
  const pkg = booking.pkg;

  const subtotal = pkg.priceINR * travelers;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !name || !email || !phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 900);
  }

  function onDone() {
    closeBooking();
    toast("Booking received — we'll call you within 4 hours", "success");
  }

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
                      Reserve your journey
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
                  {/* Date + Travelers */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                        Departure date
                      </span>
                      <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 focus-within:border-ink">
                        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </label>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                        Travelers
                      </span>
                      <div className="mt-1.5 flex h-12 items-center justify-between rounded-2xl border border-line bg-white px-2">
                        <button
                          type="button"
                          onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                          className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                          aria-label="Decrease travelers"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-mono text-lg font-semibold tabular-nums">{travelers}</span>
                        <button
                          type="button"
                          onClick={() => setTravelers((t) => Math.min(10, t + 1))}
                          className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                          aria-label="Increase travelers"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <Field
                      icon={<User className="h-4 w-4" />}
                      label="Full name"
                      type="text"
                      value={name}
                      onChange={setName}
                      placeholder="Your name"
                    />
                    <Field
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@example.com"
                    />
                    <Field
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone (with country code)"
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      placeholder="+91 98XXX XXXXX"
                    />
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 rounded-2xl bg-sand p-4 text-sm">
                    <Row
                      label={`${formatPrice(pkg.priceINR, currency)} × ${travelers}`}
                      value={formatPrice(subtotal, currency)}
                    />
                    <Row label="Taxes & permits (5%)" value={formatPrice(taxes, currency)} muted />
                    <div className="flex items-center justify-between border-t border-line pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-mono text-lg font-bold text-ink">{formatPrice(total, currency)}</span>
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-jade" />
                    Free cancellation up to 30 days. No charge today — we'll call to confirm.
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
                  >
                    {loading ? "Submitting…" : "Confirm booking request"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center px-6 py-14 text-center md:px-8 md:py-16"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 16 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-jade/15 text-jade"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.span>
                <h2 className="mt-6 font-serif text-3xl tracking-tight">You're on the trail.</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  Your request for <span className="font-medium text-ink">{pkg.name}</span> on{" "}
                  <span className="font-medium text-ink">{date || "your selected date"}</span> for{" "}
                  <span className="font-medium text-ink">
                    {travelers} traveler{travelers > 1 ? "s" : ""}
                  </span>{" "}
                  is in. Our team will call you within 4 hours to confirm details and arrange payment.
                </p>
                <div className="mt-6 w-full rounded-2xl bg-sand p-4 text-left text-xs">
                  <p className="text-muted">Reference</p>
                  <p className="mt-1 font-mono text-base font-semibold text-ink">
                    HT-{Date.now().toString(36).slice(-6).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={onDone}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white hover:bg-ink/90"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink">
        <span className="shrink-0 text-muted">{icon}</span>
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-ink focus:outline-none"
        />
      </div>
    </label>
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
