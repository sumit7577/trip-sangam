"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { useModal } from "@/lib/modal";
import { useAuth, requestPasswordReset } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { ModalShell } from "./ModalShell";

type Mode = "signin" | "signup" | "forgot";

export function SignInModal() {
  const { signin, closeSignin } = useModal();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setFullName(""); setPhone(""); setEmail(""); setPassword("");
    setSubmitted(false); setSentEmail(false); setMode("signin");
  }

  async function onSubmit(e: React.FormEvent) {
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
      if (mode === "signup") {
        await register({ email, password, fullName, phone });
      } else {
        await login(email, password);
      }
      setSubmitted(true);
      setTimeout(() => {
        closeSignin();
        toast(mode === "signup" ? "Account created — welcome!" : "Signed in", "success");
        reset();
      }, 1000);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {signin && (
        <ModalShell
          ariaLabel={mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in"}
          onClose={closeSignin}
        >
          <div className="px-6 pb-8 pt-10 md:px-8 md:pb-10 md:pt-12">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} className="flex flex-col items-center py-10 text-center">
                  <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-jade/15 text-jade">
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.span>
                  <h2 className="mt-5 font-serif text-2xl">You're in.</h2>
                  <p className="mt-1 text-sm text-muted">Loading your account…</p>
                </motion.div>
              ) : sentEmail ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} className="flex flex-col items-center py-8 text-center">
                  <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-jade/15 text-jade">
                    <Mail className="h-8 w-8" />
                  </motion.span>
                  <h2 className="mt-5 font-serif text-2xl">Check your email</h2>
                  <p className="mt-2 max-w-xs text-sm text-muted">
                    If an account exists for <span className="font-medium text-ink">{email}</span>, we've sent a
                    link to reset your password. It expires in 3 days.
                  </p>
                  <button
                    onClick={() => { setSentEmail(false); setMode("signin"); setPassword(""); }}
                    className="mt-6 text-xs font-medium text-ink underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                    {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {mode === "signup"
                      ? "Sign up to book trips and join departure groups."
                      : mode === "forgot"
                      ? "Enter your email and we'll send you a link to reset your password."
                      : "Sign in to manage your bookings and slots."}
                  </p>

                  <form onSubmit={onSubmit} className="mt-7 space-y-3">
                    {mode === "signup" && (
                      <>
                        <Field icon={<User className="h-4 w-4" />} label="Full name" type="text"
                          value={fullName} onChange={setFullName} placeholder="Your name" autoFocus />
                        <Field icon={<Phone className="h-4 w-4" />} label="Phone" type="tel"
                          value={phone} onChange={setPhone} placeholder="98XXXXXXXX" />
                      </>
                    )}
                    <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email"
                      value={email} onChange={setEmail} placeholder="you@example.com"
                      autoFocus={mode !== "signup"} />
                    {mode !== "forgot" && (
                      <Field icon={<Lock className="h-4 w-4" />} label="Password" type="password"
                        value={password} onChange={setPassword} placeholder="••••••••" />
                    )}

                    {mode === "signin" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
                    >
                      {loading
                        ? "Please wait…"
                        : mode === "signup"
                        ? "Create account"
                        : mode === "forgot"
                        ? "Send reset link"
                        : "Sign in"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center text-xs text-muted">
                    {mode === "forgot" ? (
                      <button
                        onClick={() => setMode("signin")}
                        className="font-medium text-ink underline-offset-4 hover:underline"
                      >
                        Back to sign in
                      </button>
                    ) : (
                      <>
                        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
                        <button
                          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                          className="font-medium text-ink underline-offset-4 hover:underline"
                        >
                          {mode === "signup" ? "Sign in" : "Create an account"}
                        </button>
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ModalShell>
      )}
    </AnimatePresence>
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
      <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink">
        <span className="shrink-0 text-muted">{icon}</span>
        <input required autoFocus={autoFocus} type={type} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none" />
      </div>
    </label>
  );
}
