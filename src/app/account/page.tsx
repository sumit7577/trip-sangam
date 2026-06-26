"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound, Mail, Phone, Check, LogIn, Briefcase, LogOut, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { initials } from "@/components/layout/AccountMenu";

export default function AccountPage() {
  const { user, hydrated, updateProfile, logout } = useAuth();
  const { openSignin } = useModal();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form from the stored user once it hydrates.
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const dirty = !!user && (fullName.trim() !== (user.fullName || "") || phone.trim() !== (user.phone || ""));

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand px-4 pb-24 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 font-serif text-4xl tracking-tight">
          <UserRound className="h-7 w-7" /> My Profile
        </h1>
        <p className="mt-2 text-sm text-muted">Manage your traveller details and login info.</p>

        {hydrated && !user && (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-center dark:bg-white/5">
            <p className="text-muted">Please sign in to view your profile.</p>
            <button
              onClick={openSignin}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          </div>
        )}

        {hydrated && user && (
          <div className="mt-8 grid gap-5 md:grid-cols-[260px_1fr]">
            {/* Identity card */}
            <aside className="h-fit rounded-3xl border border-line bg-white p-6 text-center dark:bg-white/5">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-2xl font-semibold uppercase text-white shadow-soft">
                {initials(user.fullName, user.email)}
              </span>
              <p className="mt-4 truncate font-serif text-xl tracking-tight">
                {user.fullName || user.email.split("@")[0]}
              </p>
              <p className="mt-1 truncate text-xs text-muted">{user.email}</p>

              <div className="mt-5 space-y-2">
                <Link
                  href="/trips"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-ink/10 text-sm font-medium text-ink transition-colors hover:bg-sand dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  <Briefcase className="h-4 w-4" /> My Trips
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-crimson transition-colors hover:bg-crimson/5"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </aside>

            {/* Editable details */}
            <form onSubmit={onSave} className="rounded-3xl border border-line bg-white p-6 dark:bg-white/5">
              <h2 className="font-serif text-xl tracking-tight">Personal details</h2>
              <p className="mt-1 text-xs text-muted">These appear on your bookings and permits.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                    Full name
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-sand/40 px-3 focus-within:border-ink/30 dark:border-white/10 dark:bg-white/5">
                    <UserRound className="h-4 w-4 shrink-0 text-muted" />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                    Phone
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-sand/40 px-3 focus-within:border-ink/30 dark:border-white/10 dark:bg-white/5">
                    <Phone className="h-4 w-4 shrink-0 text-muted" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 7678538192"
                      inputMode="tel"
                      className="h-11 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-ink/5 bg-ink/[0.03] px-3 dark:border-white/5 dark:bg-white/[0.02]">
                    <Mail className="h-4 w-4 shrink-0 text-muted" />
                    <input
                      value={user.email}
                      disabled
                      className="h-11 w-full cursor-not-allowed bg-transparent text-sm text-muted outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted">Email is your login and can't be changed here.</p>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-crimson">{error}</p>}

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!dirty || saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                    <Check className="h-4 w-4" /> Saved
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {hydrated && user && (
          <Link
            href="/#packages"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-crimson hover:underline"
          >
            Browse trips <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </main>
  );
}
