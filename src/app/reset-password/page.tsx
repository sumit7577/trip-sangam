"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Check, ArrowRight, ShieldAlert } from "lucide-react";
import { confirmPasswordReset } from "@/lib/auth";
import { useModal } from "@/lib/modal";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { openSignin } = useModal();

  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const linkValid = !!uid && !!token;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand px-4 pb-24 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-line bg-white p-8 dark:bg-white/5">
          {!linkValid ? (
            <div className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-crimson/10 text-crimson">
                <ShieldAlert className="h-8 w-8" />
              </span>
              <h1 className="mt-5 font-serif text-2xl tracking-tight">Invalid reset link</h1>
              <p className="mt-2 text-sm text-muted">
                This link is missing information or has already been used. Please request a new one.
              </p>
              <button
                onClick={openSignin}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Back to sign in
              </button>
            </div>
          ) : done ? (
            <div className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-jade/15 text-jade">
                <Check className="h-8 w-8" />
              </span>
              <h1 className="mt-5 font-serif text-2xl tracking-tight">Password reset</h1>
              <p className="mt-2 text-sm text-muted">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => {
                  router.push("/");
                  openSignin();
                }}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-3xl tracking-tight">Choose a new password</h1>
              <p className="mt-2 text-sm text-muted">Pick something secure you'll remember.</p>

              <form onSubmit={onSubmit} className="mt-7 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                    New password
                  </label>
                  <div className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink dark:bg-white/5">
                    <Lock className="h-4 w-4 shrink-0 text-muted" />
                    <input
                      required
                      autoFocus
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                    Confirm password
                  </label>
                  <div className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-ink dark:bg-white/5">
                    <Lock className="h-4 w-4 shrink-0 text-muted" />
                    <input
                      required
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 border-none bg-transparent text-sm text-ink focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-crimson">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
                >
                  {loading ? "Resetting…" : "Reset password"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-muted">
                <Link href="/" className="font-medium text-ink underline-offset-4 hover:underline">
                  Back to home
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-sand dark:bg-[#0E0E0D]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
