"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound, Mail, Phone, Check, LogIn, Briefcase, LogOut, Camera,
  MapPin, IdCard, Cake, Users2, ShieldAlert, Loader2, Sparkles, Calendar, type LucideIcon,
} from "lucide-react";
import { useAuth, type ProfileInput } from "@/lib/auth";
import { useModal } from "@/lib/modal";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
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

const COMPLETION_KEYS: (keyof Form)[] = [
  "fullName", "email", "gender", "dateOfBirth", "city", "documentType", "documentNumber", "emergencyName",
];

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "personal", label: "Personal details", icon: UserRound },
  { id: "document", label: "Travel document", icon: IdCard },
  { id: "emergency", label: "Emergency contact", icon: ShieldAlert },
];

export default function AccountPage() {
  const { user, hydrated, updateProfile, uploadAvatar, logout } = useAuth();
  const { openSignin } = useModal();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState("personal");

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

  // Scroll-spy for the side nav.
  useEffect(() => {
    if (!user) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-25% 0px -65% 0px" }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [user]);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const completion = Math.round(
    (COMPLETION_KEYS.filter((k) => form[k]?.trim()).length / COMPLETION_KEYS.length) * 100
  );

  const dirty = !!user && (Object.keys(form) as (keyof Form)[]).some(
    (k) => (form[k] || "").trim() !== (((user[k] as string) || "").trim())
  );

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true); setError(null);
    try {
      await updateProfile({
        fullName: form.fullName.trim(), email: form.email.trim(), gender: form.gender,
        city: form.city.trim(), state: form.state.trim(), documentType: form.documentType,
        documentNumber: form.documentNumber.trim(), emergencyName: form.emergencyName.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
      } satisfies ProfileInput);
      toast("Profile saved", "success");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Couldn't save changes.";
      setError(m); toast(m, "error");
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

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="relative min-h-screen bg-sand pb-28 dark:bg-[#0E0E0D]">
      {/* ── Cover hero ── */}
      <div className="relative h-72 w-full overflow-hidden md:h-80">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-crimson/85 to-gold" />
        <motion.div animate={{ x: [0, 50, 0], y: [0, 24, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-gold/40 blur-[110px]" />
        <motion.div animate={{ x: [0, -60, 0], y: [0, -20, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-10 h-96 w-96 rounded-full bg-crimson/30 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        {/* Himalayan silhouette */}
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-28 w-full text-sand dark:text-[#0E0E0D]" aria-hidden>
          <path fill="currentColor" opacity="0.25" d="M0 200 L240 90 L420 150 L640 60 L820 140 L1040 70 L1240 150 L1440 80 L1440 200Z" />
          <path fill="currentColor" d="M0 200 L300 130 L520 170 L760 110 L980 165 L1200 120 L1440 165 L1440 200Z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto -mt-28 max-w-5xl px-4">
        {hydrated && !user && (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-muted">Please sign in to view your profile.</p>
            <button onClick={openSignin}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-ink/90">
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          </div>
        )}

        {hydrated && user && (
          <>
            {/* ── Profile header card ── */}
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.07] md:p-6">
              <div className="flex flex-col items-center gap-5 md:flex-row md:items-end">
                {/* Avatar */}
                <div className="relative h-28 w-28 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-crimson blur-md opacity-60" aria-hidden />
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.fullName || "You"}
                      className="relative h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-lift dark:ring-[#0E0E0D]" />
                  ) : (
                    <span className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-gold to-crimson text-4xl font-semibold uppercase text-white ring-4 ring-white shadow-lift dark:ring-[#0E0E0D]">
                      {initials(user.fullName, user.email)}
                    </span>
                  )}
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Change photo"
                    className="absolute bottom-0 right-0 z-10 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-ink text-white shadow-glow transition-transform hover:scale-110 disabled:opacity-60 dark:border-[#0E0E0D]">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
                </div>

                {/* Identity */}
                <div className="min-w-0 flex-1 text-center md:text-left">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-crimson">
                    <Sparkles className="h-3 w-3" /> Traveller account
                  </p>
                  <h1 className="mt-1 truncate font-serif text-3xl tracking-tight">{user.fullName || "Welcome"}</h1>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    {user.phone && <Chip icon={<Phone className="h-3 w-3" />}>{user.phone}</Chip>}
                    {user.email && <Chip icon={<Mail className="h-3 w-3" />}>{user.email}</Chip>}
                  </div>
                  {/* Completion */}
                  <div className="mt-4 max-w-sm">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-muted">Profile {completion}% complete</span>
                      {completion === 100 && <span className="text-jade">All set ✓</span>}
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand dark:bg-white/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(completion, 5)}%` }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-gold to-crimson shadow-[0_0_12px_rgba(201,57,49,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="flex flex-col items-center gap-2 md:items-end">
                  <SaveButton dirty={dirty} saving={saving} onClick={() => onSave()} />
                </div>
              </div>
            </motion.div>

            {/* ── Body: sidebar + sections ── */}
            <div className="mt-6 grid gap-6 md:grid-cols-[212px_1fr]">
              {/* Side nav */}
              <aside className="hidden md:block">
                <nav className="sticky top-28 space-y-1">
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const on = active === s.id;
                    return (
                      <button key={s.id} onClick={() => go(s.id)}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          on ? "bg-white text-ink shadow-soft dark:bg-white/10 dark:text-white" : "text-muted hover:bg-white/60 hover:text-ink dark:hover:bg-white/5"
                        )}>
                        {on && <motion.span layoutId="profile-nav" className="absolute left-0 top-1/2 h-6 -translate-y-1/2 w-1 rounded-full bg-gradient-to-b from-gold to-crimson" />}
                        <Icon className="h-4 w-4 shrink-0" /> {s.label}
                      </button>
                    );
                  })}
                  <div className="my-2 h-px bg-line" />
                  <Link href="/trips" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/60 hover:text-ink dark:hover:bg-white/5">
                    <Briefcase className="h-4 w-4" /> My Trips
                  </Link>
                  <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-crimson transition-colors hover:bg-crimson/5">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </nav>
              </aside>

              {/* Form */}
              <form onSubmit={onSave} className="space-y-5">
                <Section id="personal" title="Personal details" hint="Used on your bookings and traveller list.">
                  <Input icon={<UserRound className="h-4 w-4" />} label="Full name" value={form.fullName}
                    onChange={(v) => set("fullName", v)} placeholder="Your name" />
                  <Input icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={form.email}
                    onChange={(v) => set("email", v)} placeholder="you@example.com" />
                  <Select icon={<Users2 className="h-4 w-4" />} label="Gender" value={form.gender}
                    onChange={(v) => set("gender", v)} options={["", "Male", "Female", "Other", "Prefer not to say"]} />
                  <DateField icon={<Cake className="h-4 w-4" />} label="Date of birth" value={form.dateOfBirth}
                    onChange={(v) => set("dateOfBirth", v)} />
                  <Input icon={<MapPin className="h-4 w-4" />} label="City" value={form.city}
                    onChange={(v) => set("city", v)} placeholder="e.g. Raxaul" />
                  <Input icon={<MapPin className="h-4 w-4" />} label="State" value={form.state}
                    onChange={(v) => set("state", v)} placeholder="e.g. Bihar" />
                  <div className="sm:col-span-2">
                    <Label>Mobile (login)</Label>
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-ink/5 bg-ink/[0.03] px-3 dark:border-white/5 dark:bg-white/[0.02]">
                      <Phone className="h-4 w-4 shrink-0 text-muted" />
                      <input value={user.phone || "—"} disabled
                        className="h-11 w-full cursor-not-allowed bg-transparent text-sm text-muted outline-none" />
                      <Check className="h-4 w-4 shrink-0 text-jade" />
                    </div>
                  </div>
                </Section>

                <Section id="document" title="Travel document" hint="Speeds up the Raxaul–Birgunj border crossing.">
                  <Select icon={<IdCard className="h-4 w-4" />} label="Document type" value={form.documentType}
                    onChange={(v) => set("documentType", v)}
                    options={["", "Aadhaar", "Voter ID", "Passport", "Driving Licence"]} />
                  <Input icon={<IdCard className="h-4 w-4" />} label="Document number" value={form.documentNumber}
                    onChange={(v) => set("documentNumber", v)} placeholder="ID number" />
                </Section>

                <Section id="emergency" title="Emergency contact" hint="Who we call if something happens on the trail.">
                  <Input icon={<ShieldAlert className="h-4 w-4" />} label="Contact name" value={form.emergencyName}
                    onChange={(v) => set("emergencyName", v)} placeholder="Name" />
                  <Input icon={<Phone className="h-4 w-4" />} label="Contact phone" type="tel" value={form.emergencyPhone}
                    onChange={(v) => set("emergencyPhone", v)} placeholder="Phone number" />
                </Section>

                {error && <p className="text-sm text-crimson">{error}</p>}
              </form>
            </div>
          </>
        )}
      </div>

      {/* ── Sticky unsaved-changes bar ── */}
      <AnimatePresence>
        {dirty && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0E0E0D]/90">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold" /> You have unsaved changes
              </span>
              <SaveButton dirty={dirty} saving={saving} onClick={() => onSave()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ---- small pieces ---- */

function SaveButton({ dirty, saving, onClick }: { dirty: boolean; saving: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }} type="button" onClick={onClick} disabled={saving || !dirty}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-2xl px-7 text-sm font-semibold transition-all",
        dirty ? "bg-ink text-white shadow-glow hover:shadow-lift" : "cursor-default bg-ink/10 text-muted dark:bg-white/10"
      )}>
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
    </motion.button>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-ink/10 bg-white/60 px-2.5 py-1 text-xs text-ink/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}

function Section({ id, title, hint, children }: { id: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <motion.div id={id}
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-28 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl transition-shadow hover:shadow-lift dark:border-white/10 dark:bg-white/[0.05]">
      <h2 className="flex items-center gap-2.5 font-serif text-xl tracking-tight">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-gold to-crimson" />
        {title}
      </h2>
      <p className="mt-1 pl-3.5 text-xs text-muted">{hint}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </motion.div>
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
      <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white/55 px-3 transition-all focus-within:border-ink/40 focus-within:bg-white focus-within:shadow-soft focus-within:ring-2 focus-within:ring-ink/[0.06] dark:border-white/10 dark:bg-white/5 dark:focus-within:bg-white/10">
        <span className="shrink-0 text-muted">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="h-11 w-full bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}

function DateField({
  icon, label, value, onChange,
}: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let display = "";
  if (value) {
    const [y, m, d] = value.split("-");
    if (y && m && d) display = `${d} ${MONTHS[+m - 1]} ${y}`;
  }
  function open() {
    const el = ref.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch { /* fall through */ }
    }
    el.focus();
  }
  return (
    <div>
      <Label>{label}</Label>
      <div onClick={open}
        className="relative flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white/55 px-3 transition-all hover:border-ink/30 focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-ink/[0.06] dark:border-white/10 dark:bg-white/5">
        <span className="shrink-0 text-muted">{icon}</span>
        <span className={cn("flex-1 text-sm", display ? "text-ink dark:text-white" : "text-muted")}>
          {display || "Select date"}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-muted" />
        <input ref={ref} type="date" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}
          className="pointer-events-none absolute inset-0 opacity-0 [color-scheme:light] dark:[color-scheme:dark]" />
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
      <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white/55 px-3 transition-all focus-within:border-ink/40 focus-within:bg-white focus-within:shadow-soft focus-within:ring-2 focus-within:ring-ink/[0.06] dark:border-white/10 dark:bg-white/5 dark:focus-within:bg-white/10">
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
