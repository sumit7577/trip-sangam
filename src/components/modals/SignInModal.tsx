"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import { ModalShell } from "./ModalShell";

export function SignInModal() {
  const { signin, closeSignin } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        closeSignin();
        toast(`Signed in as ${email}`, "success");
        setSubmitted(false);
        setEmail("");
        setPassword("");
      }, 1200);
    }, 700);
  }

  return (
    <AnimatePresence>
      {signin && (
        <ModalShell ariaLabel="Sign in" onClose={closeSignin}>
          <div className="px-6 pb-8 pt-10 md:px-8 md:pb-10 md:pt-12">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Welcome back</h2>
                  <p className="mt-2 text-sm text-muted">
                    Sign in to manage your bookings, wishlist, and trip preferences.
                  </p>

                  <form onSubmit={onSubmit} className="mt-7 space-y-3">
                    <Field
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@example.com"
                      autoFocus
                    />
                    <Field
                      icon={<Lock className="h-4 w-4" />}
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-line accent-ink" />
                        Remember me
                      </label>
                      <button
                        type="button"
                        onClick={() => toast("Reset link sent — check your inbox", "success")}
                        className="text-xs font-medium text-ink underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
                    >
                      {loading ? "Signing in…" : "Sign in"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </motion.button>
                  </form>

                  <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted">
                    <span className="h-px flex-1 bg-line" />
                    or
                    <span className="h-px flex-1 bg-line" />
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(["Google", "Apple", "Facebook"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => toast(`${p} sign-in is a demo only`, "default")}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-line text-sm font-medium text-ink transition-colors hover:border-ink/40"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <p className="mt-6 text-center text-xs text-muted">
                    New here?{" "}
                    <button
                      onClick={() => toast("Sign-up flow is a prototype demo", "default")}
                      className="font-medium text-ink underline-offset-4 hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-jade/15 text-jade"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.span>
                  <h2 className="mt-5 font-serif text-2xl">Welcome back.</h2>
                  <p className="mt-1 text-sm text-muted">Loading your dashboard…</p>
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
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <div className="mt-1.5 flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink">
        <span className="shrink-0 text-muted">{icon}</span>
        <input
          required
          autoFocus={autoFocus}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none"
        />
      </div>
    </label>
  );
}
