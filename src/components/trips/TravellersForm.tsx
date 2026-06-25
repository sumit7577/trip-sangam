"use client";

import { useEffect, useState } from "react";
import { Users, Save } from "lucide-react";
import { toast } from "@/lib/toast";
import { getTravellers, saveTravellers, type Traveller } from "@/lib/bookingApi";

function blank(): Traveller {
  return { fullName: "", age: null, gender: "", idType: "", idNumber: "" };
}

export function TravellersForm({ bookingId, partySize }: { bookingId: number; partySize: number }) {
  const [rows, setRows] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTravellers(bookingId)
      .then((existing) => {
        const filled = existing.length ? existing : [];
        while (filled.length < partySize) filled.push(blank());
        setRows(filled.slice(0, partySize));
      })
      .catch(() => setRows(Array.from({ length: partySize }, blank)))
      .finally(() => setLoading(false));
  }, [bookingId, partySize]);

  function update(i: number, field: keyof Traveller, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  async function onSave() {
    const filled = rows.filter((r) => r.fullName.trim());
    if (!filled.length) {
      toast("Add at least one traveller's name", "error");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveTravellers(
        bookingId,
        filled.map((r) => ({
          fullName: r.fullName.trim(),
          age: r.age ? Number(r.age) : null,
          gender: r.gender || "",
          idType: r.idType || "",
          idNumber: r.idNumber || "",
        }))
      );
      const next = [...saved];
      while (next.length < partySize) next.push(blank());
      setRows(next.slice(0, partySize));
      toast("Traveller details saved", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="mt-6">
      <h2 className="flex items-center gap-2 font-serif text-xl">
        <Users className="h-5 w-5" /> Traveller details
      </h2>
      <p className="mt-1 text-xs text-muted">Required for permits — one row per traveller (party of {partySize}).</p>

      <div className="mt-3 space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-4 dark:bg-white/5">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              Traveller {i + 1}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input value={row.fullName} onChange={(e) => update(i, "fullName", e.target.value)}
                placeholder="Full name (as on ID)"
                className="h-11 rounded-xl border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none dark:bg-transparent" />
              <input value={row.age ?? ""} onChange={(e) => update(i, "age", e.target.value)}
                type="number" min={0} placeholder="Age"
                className="h-11 rounded-xl border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none dark:bg-transparent" />
              <input value={row.idType ?? ""} onChange={(e) => update(i, "idType", e.target.value)}
                placeholder="ID type (Passport / Aadhaar)"
                className="h-11 rounded-xl border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none dark:bg-transparent" />
              <input value={row.idNumber ?? ""} onChange={(e) => update(i, "idNumber", e.target.value)}
                placeholder="ID number"
                className="h-11 rounded-xl border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none dark:bg-transparent" />
            </div>
          </div>
        ))}
      </div>

      <button onClick={onSave} disabled={saving}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60">
        <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save traveller details"}
      </button>
    </div>
  );
}
