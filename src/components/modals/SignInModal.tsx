"use client";

import { useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail, Lock, User, Phone, ArrowRight, CheckCircle2, Smartphone,
  Heart, Users, BadgePercent, Sparkles, ChevronLeft,
} from "lucide-react";
import { useModal } from "@/lib/modal";
import { useAuth, requestPasswordReset, loginWithFirebase } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { firebaseReady } from "@/lib/firebase";
import { sendPhoneOtp, confirmPhoneOtp } from "@/lib/phoneAuth";
import { WELCOME_OFFER } from "@/components/layout/PromoBanner";
import { ModalShell } from "./ModalShell";

type View = "phone" | "otp" | "email";
type EmailMode = "signin" | "signup" | "forgot";

const RECAPTCHA_ID = "sangam-recaptcha";
const phoneEnabled = firebaseReady();

export function SignInModal() {
  const { signin, closeSignin } = useModal();
  const { login, register } = useAuth();

  // Phone-OTP is primary when Firebase is configured; otherwise start on email.
  const [view, setView] = useState<View>(phoneEnabled ? "phone" : "email");

  // Phone state
  const [dial, setDial] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // Email state
  const [mode, setMode] = useState<EmailMode>("signin");
  const [fullName, setFullName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  function resetAll() {
    setView(phoneEnabled ? "phone" : "email");
    setDial("+91"); setPhone(""); setOtp(""); setConfirmation(null);
    setMode("signin"); setFullName(""); setEmailPhone(""); setEmail(""); setPassword("");
    setSubmitted(false); setSentEmail(false);
  }

  function finishSignedIn(message: string) {
    setSubmitted(true);
    setTimeout(() => {
      closeSignin();
      toast(message, "success");
      resetAll();
    }, 1000);
  }

  async function onSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) return toast("Enter a valid mobile number.", "error");
    setLoading(true);
    try {
      const conf = await sendPhoneOtp(`${dial}${digits}`, RECAPTCHA_ID);
      setConfirmation(conf);
      setView("otp");
      toast("OTP sent to your phone.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't send OTP. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmation || otp.replace(/\D/g, "").length < 6) return;
    setLoading(true);
    try {
      const idToken = await confirmPhoneOtp(confirmation, otp.replace(/\D/g, ""));
      await loginWithFirebase(idToken);
      finishSignedIn("Signed in");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Invalid or expired code.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") {
      if (!email) return;
      setLoading(true);
      try {
        await requestPasswordReset(email);
        setSentEmail(true);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Something went wrong", "error");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!email || !password || (mode === "signup" && !fullName)) return;
    setLoading(true);
    try {
      if (mode === "signup") await register({ email, password, fullName, phone: emailPhone });
      else await login(email, password);
      finishSignedIn(mode === "signup" ? "Account created — welcome!" : "Signed in");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  const ariaLabel =
    view === "email" ? (mode === "signup" ? "Create account" : "Sign in") : "Login or sign up";

  return (
    <AnimatePresence>
      {signin && (
        <ModalShell ariaLabel={ariaLabel} onClose={closeSignin} wide>
          <div id={RECAPTCHA_ID} />
          <div className="grid md:grid-cols-[0.95fr_1.05fr]">
            {/* LEFT — benefits + offer (desktop) */}
            <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sand to-white p-7 md:block dark:from-white/5 dark:to-transparent">
              <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
              <p className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-crimson/80">
                Unlock these benefits
              </p>
              <ul className="relative mt-6 space-y-5">
                <Benefit icon={<Heart className="h-5 w-5" />} title="Save your trips"
                  desc="Wishlist journeys and pick up right where you left off." />
                <Benefit icon={<Users className="h-5 w-5" />} title="Join departure groups"
                  desc="Get notified the moment your group fills and confirms." />
                <Benefit icon={<BadgePercent className="h-5 w-5" />} title="Member offers"
                  desc="First-trip discount and quiet deals for travellers." />
              </ul>

              <div className="relative mt-7 overflow-hidden rounded-2xl border border-jade/20 bg-jade/8 p-4">
                <div className="flex items-center gap-2 text-jade">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-serif text-xl tracking-tight">Flat {WELCOME_OFFER.percent}% OFF*</span>
                </div>
                <p className="mt-1 text-sm text-ink/75 dark:text-white/75">on your first trip</p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-muted">
                  Use code <span className="font-mono font-bold text-ink dark:text-white">{WELCOME_OFFER.code}</span>
                </p>
              </div>
            </aside>

            {/* RIGHT — auth form */}
            <div className="px-6 pb-8 pt-10 md:px-8 md:pb-10 md:pt-12">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <Success key="ok" />
                ) : sentEmail ? (
                  <SentEmail key="sent" email={email}
                    onBack={() => { setSentEmail(false); setMode("signin"); setPassword(""); }} />
                ) : view === "phone" ? (
                  <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Login / Sign up</h2>
                    <p className="mt-2 text-sm text-muted">Continue with your mobile number — we&apos;ll text you a code.</p>

                    <form onSubmit={onSendOtp} className="mt-7 space-y-3">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Mobile number</span>
                        <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-3 transition-colors focus-within:border-ink dark:bg-white/5">
                          <Phone className="h-4 w-4 shrink-0 text-muted" />
                          <select value={dial} onChange={(e) => setDial(e.target.value)}
                            className="shrink-0 border-none bg-transparent text-sm font-medium text-ink focus:outline-none dark:text-white">
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+977">🇳🇵 +977</option>
                          </select>
                          <span className="h-5 w-px bg-line" />
                          <input autoFocus type="tel" inputMode="numeric" value={phone}
                            onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX"
                            className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none dark:text-white" />
                        </div>
                      </div>

                      <SubmitButton loading={loading} label="Continue" />
                    </form>

                    <Divider />
                    <button onClick={() => setView("email")}
                      className="mx-auto block text-center text-xs font-medium text-ink underline-offset-4 hover:underline dark:text-white">
                      Use email instead
                    </button>
                  </motion.div>
                ) : view === "otp" ? (
                  <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button onClick={() => { setView("phone"); setOtp(""); }}
                      className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink">
                      <ChevronLeft className="h-3.5 w-3.5" /> Change number
                    </button>
                    <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Enter the code</h2>
                    <p className="mt-2 text-sm text-muted">
                      Sent to <span className="font-medium text-ink dark:text-white">{dial} {phone}</span>
                    </p>

                    <form onSubmit={onVerifyOtp} className="mt-7 space-y-3">
                      <div className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink dark:bg-white/5">
                        <Smartphone className="h-4 w-4 shrink-0 text-muted" />
                        <input autoFocus type="tel" inputMode="numeric" maxLength={6} value={otp}
                          onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code"
                          className="flex-1 border-none bg-transparent text-center text-lg font-semibold tracking-[0.4em] text-ink focus:outline-none dark:text-white" />
                      </div>
                      <SubmitButton loading={loading} label="Verify & continue" />
                    </form>

                    <button onClick={() => onSendOtp()}
                      className="mt-4 block w-full text-center text-xs text-muted hover:text-ink dark:hover:text-white">
                      Didn&apos;t get it? <span className="font-medium text-ink dark:text-white">Resend code</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                      {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {mode === "signup" ? "Sign up to book trips and join departure groups."
                        : mode === "forgot" ? "Enter your email and we'll send you a reset link."
                        : "Sign in to manage your bookings and slots."}
                    </p>

                    <form onSubmit={onEmailSubmit} className="mt-7 space-y-3">
                      {mode === "signup" && (
                        <>
                          <Field icon={<User className="h-4 w-4" />} label="Full name" type="text"
                            value={fullName} onChange={setFullName} placeholder="Your name" autoFocus />
                          <Field icon={<Phone className="h-4 w-4" />} label="Phone" type="tel"
                            value={emailPhone} onChange={setEmailPhone} placeholder="98XXXXXXXX" />
                        </>
                      )}
                      <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email"
                        value={email} onChange={setEmail} placeholder="you@example.com" autoFocus={mode !== "signup"} />
                      {mode !== "forgot" && (
                        <Field icon={<Lock className="h-4 w-4" />} label="Password" type="password"
                          value={password} onChange={setPassword} placeholder="••••••••" />
                      )}
                      {mode === "signin" && (
                        <div className="flex justify-end">
                          <button type="button" onClick={() => setMode("forgot")}
                            className="text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
                            Forgot password?
                          </button>
                        </div>
                      )}
                      <SubmitButton loading={loading}
                        label={mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"} />
                    </form>

                    <p className="mt-5 text-center text-xs text-muted">
                      {mode === "forgot" ? (
                        <button onClick={() => setMode("signin")} className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">
                          Back to sign in
                        </button>
                      ) : (
                        <>
                          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
                          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                            className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">
                            {mode === "signup" ? "Sign in" : "Create an account"}
                          </button>
                        </>
                      )}
                    </p>

                    {phoneEnabled && (
                      <>
                        <Divider />
                        <button onClick={() => { setView("phone"); setMode("signin"); }}
                          className="mx-auto flex items-center gap-1.5 text-center text-xs font-medium text-ink underline-offset-4 hover:underline dark:text-white">
                          <Smartphone className="h-3.5 w-3.5" /> Use mobile number instead
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

/* ---------- small pieces ---------- */

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60">
      {loading ? "Please wait…" : label}
      {!loading && <ArrowRight className="h-4 w-4" />}
    </motion.button>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-crimson shadow-soft dark:bg-white/10">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="font-serif text-base text-ink dark:text-white">{title}</span>
        <span className="text-xs leading-snug text-muted">{desc}</span>
      </span>
    </li>
  );
}

function Success() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center py-10 text-center">
      <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-jade/15 text-jade">
        <CheckCircle2 className="h-8 w-8" />
      </motion.span>
      <h2 className="mt-5 font-serif text-2xl">You&apos;re in.</h2>
      <p className="mt-1 text-sm text-muted">Loading your account…</p>
    </motion.div>
  );
}

function SentEmail({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center py-8 text-center">
      <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-jade/15 text-jade">
        <Mail className="h-8 w-8" />
      </motion.span>
      <h2 className="mt-5 font-serif text-2xl">Check your email</h2>
      <p className="mt-2 max-w-xs text-sm text-muted">
        If an account exists for <span className="font-medium text-ink dark:text-white">{email}</span>, we&apos;ve sent a
        link to reset your password. It expires in 3 days.
      </p>
      <button onClick={onBack} className="mt-6 text-xs font-medium text-ink underline-offset-4 hover:underline dark:text-white">
        Back to sign in
      </button>
    </motion.div>
  );
}

function Field({
  icon, label, type, value, onChange, placeholder, autoFocus,
}: {
  icon: React.ReactNode; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink dark:bg-white/5">
        <span className="shrink-0 text-muted">{icon}</span>
        <input required autoFocus={autoFocus} type={type} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none dark:text-white" />
      </div>
    </label>
  );
}
