"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  UserRound, Mail, Phone, Check, LogIn, Briefcase, LogOut, Camera,
  MapPin, IdCard, Cake, Users2, ShieldAlert, Loader2,
} from "lucide-react";
import { useAuth, type ProfileInput } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import { initials } from "@/components/layout/AccountMenu";

type Form = {
  fullName: string; email: string; gender: string; dateOfBirth: string;
  city: string; state: string; documentType: string; documentNumber: string;
  emergencyName: string; emergencyPhone: string;
};

const EMPTY: Form = {
  fullName: "", email: "", gender: "", dateOfBirth: "", city: "", state: "",
  documentType: "", documentNumber: "", emergencyName: "", emergencyPhone: "",
};

// Fields that count toward "profile complete" (phone is always set via login).
const COMPLETION_KEYS: (keyof Form)[] = [
  "fullName", "email", "gender", "dateOfBirth", "city", "documentType", "documentNumber", "emergencyName",
];

export default function AccountPage() {
  const { user, hydrated, updateProfile, uploadAvatar, logout } = useAuth();
  const { openSignin } = useModal();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "", email: user.email || "", gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "", city: user.city || "", state: user.state || "",
        documentType: user.documentType || "", documentNumber: user.documentNumber || "",
        emergencyName: user.emergencyName || "", emergencyPhone: user.emergencyPhone || "",
      });
    }
  }, [user]);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const completion = Math.round(
    (COMPLETION_KEYS.filter((k) => form[k]?.trim()).length / COMPLETION_KEYS.length) * 100
  );

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      const payload: ProfileInput = {
        fullName: form.fullName.trim(), email: form.email.trim(), gender: form.gender,
        city: form.city.trim(), state: form.state.trim(), documentType: form.documentType,
        documentNumber: form.documentNumber.trim(), emergencyName: form.emergencyName.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
      };
      await updateProfile(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast("Profile photo updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-sand px-4 pb-24 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="flex items-center gap-2 font-serif text-4xl tracking-tight">
          <UserRound className="h-7 w-7" /> My Profile
        </h1>
        <p className="mt-2 text-sm text-muted">Manage your traveller details — they prefill your bookings &amp; permits.</p>

        {hydrated && !user && (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 text-center dark:bg-white/5">
            <p className="text-muted">Please sign in to view your profile.</p>
            <button onClick={openSignin}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          </div>
        )}

        {hydrated && user && (
          <div className="mt-8 grid gap-5 md:grid-cols-[280px_1fr]">
            {/* Identity card */}
            <aside className="h-fit rounded-3xl border border-line bg-white p-6 text-center dark:bg-white/5">
              <div className="relative mx-auto h-24 w-24">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.fullName || "You"}
                    className="h-24 w-24 rounded-full object-cover shadow-soft" />
                ) : (
                  <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-3xl font-semibold uppercase text-white shadow-soft">
                    {initials(user.fullName, user.email)}
                  </span>
                )}
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-ink text-white shadow-glow transition-transform hover:scale-105 disabled:opacity-60 dark:border-[#0E0E0D]">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
              </div>

              <p className="mt-4 truncate font-serif text-xl tracking-tight">
                {user.fullName || user.phone || user.email.split("@")[0]}
              </p>
              {user.email && <p className="mt-1 truncate text-xs text-muted">{user.email}</p>}

              {/* Completion meter */}
              <div className="mt-5 text-left">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-muted">Profile {completion}% complete</span>
                  {completion === 100 && <span className="text-jade">All set ✓</span>}
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-crimson transition-all duration-500"
                    style={{ width: `${Math.max(completion, 6)}%` }} />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Link href="/trips"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-ink/10 text-sm font-medium text-ink transition-colors hover:bg-sand dark:border-white/10 dark:text-white dark:hover:bg-white/5">
                  <Briefcase className="h-4 w-4" /> My Trips
                </Link>
                <button onClick={logout}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-crimson transition-colors hover:bg-crimson/5">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </aside>

            {/* Editable details */}
            <form onSubmit={onSave} className="space-y-5">
              <Section title="Personal details" hint="Used on your bookings and traveller list.">
                <Input icon={<UserRound className="h-4 w-4" />} label="Full name" value={form.fullName}
                  onChange={(v) => set("fullName", v)} placeholder="Your name" />
                <Input icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={form.email}
                  onChange={(v) => set("email", v)} placeholder="you@example.com" />
                <Select icon={<Users2 className="h-4 w-4" />} label="Gender" value={form.gender}
                  onChange={(v) => set("gender", v)} options={["", "Male", "Female", "Other", "Prefer not to say"]} />
                <Input icon={<Cake className="h-4 w-4" />} label="Date of birth" type="date" value={form.dateOfBirth}
                  onChange={(v) => set("dateOfBirth", v)} placeholder="" />
                <Input icon={<MapPin className="h-4 w-4" />} label="City" value={form.city}
                  onChange={(v) => set("city", v)} placeholder="e.g. Raxaul" />
                <Input icon={<MapPin className="h-4 w-4" />} label="State" value={form.state}
                  onChange={(v) => set("state", v)} placeholder="e.g. Bihar" />
                {/* Phone is the login — shown read-only */}
                <div>
                  <Label>Mobile (login)</Label>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-ink/5 bg-ink/[0.03] px-3 dark:border-white/5 dark:bg-white/[0.02]">
                    <Phone className="h-4 w-4 shrink-0 text-muted" />
                    <input value={user.phone || "—"} disabled
                      className="h-11 w-full cursor-not-allowed bg-transparent text-sm text-muted outline-none" />
                  </div>
                </div>
              </Section>

              <Section title="Travel document" hint="Speeds up the Raxaul–Birgunj border crossing.">
                <Select icon={<IdCard className="h-4 w-4" />} label="Document type" value={form.documentType}
                  onChange={(v) => set("documentType", v)}
                  options={["", "Aadhaar", "Voter ID", "Passport", "Driving Licence"]} />
                <Input icon={<IdCard className="h-4 w-4" />} label="Document number" value={form.documentNumber}
                  onChange={(v) => set("documentNumber", v)} placeholder="ID number" />
              </Section>

              <Section title="Emergency contact" hint="Who we call if something happens on the trail.">
                <Input icon={<ShieldAlert className="h-4 w-4" />} label="Contact name" value={form.emergencyName}
                  onChange={(v) => set("emergencyName", v)} placeholder="Name" />
                <Input icon={<Phone className="h-4 w-4" />} label="Contact phone" type="tel" value={form.emergencyPhone}
                  onChange={(v) => set("emergencyPhone", v)} placeholder="Phone number" />
              </Section>

              {error && <p className="text-sm text-crimson">{error}</p>}

              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-7 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50">
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
      </div>
    </main>
  );
}

/* ---- small pieces ---- */

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 dark:bg-white/5">
      <h2 className="font-serif text-xl tracking-tight">{title}</h2>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">{children}</label>;
}

function Input({
  icon, label, value, onChange, placeholder, type = "text",
}: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-sand/40 px-3 focus-within:border-ink/30 dark:border-white/10 dark:bg-white/5">
        <span className="shrink-0 text-muted">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="h-11 w-full bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}

function Select({
  icon, label, value, onChange, options,
}: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-sand/40 px-3 focus-within:border-ink/30 dark:border-white/10 dark:bg-white/5">
        <span className="shrink-0 text-muted">{icon}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full bg-transparent text-sm outline-none dark:bg-[#1A1A18]">
          {options.map((o) => (
            <option key={o} value={o}>{o || "Select…"}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
