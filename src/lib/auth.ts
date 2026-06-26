"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
}

interface AuthState {
  user: AuthUser | null;
  access: string | null;
  refresh: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; fullName: string; phone: string }) => Promise<void>;
  updateProfile: (input: { fullName?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  setHydrated: () => void;
}

function firstError(body: unknown): string {
  if (!body || typeof body !== "object") return "Something went wrong.";
  const obj = body as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "string") return v[0];
    if (typeof v === "string") return v;
  }
  return "Something went wrong.";
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access: null,
      refresh: null,
      hydrated: false,

      async login(email, password) {
        const res = await fetch(`${BASE}/api/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error(firstError(await res.json().catch(() => ({}))));
        const d = await res.json();
        set({ user: d.user, access: d.access, refresh: d.refresh });
      },

      async register(input) {
        const res = await fetch(`${BASE}/api/auth/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(firstError(await res.json().catch(() => ({}))));
        const d = await res.json();
        set({ user: d.user, access: d.access, refresh: d.refresh });
      },

      async updateProfile(input) {
        const res = await authFetch("/api/auth/me/", {
          method: "PATCH",
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(firstError(await res.json().catch(() => ({}))));
        const user = await res.json();
        set({ user });
      },

      logout() {
        set({ user: null, access: null, refresh: null });
      },

      setHydrated() {
        set({ hydrated: true });
      },
    }),
    {
      name: "sangam-auth",
      partialize: (s) => ({ user: s.user, access: s.access, refresh: s.refresh }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

/**
 * fetch() wrapper that attaches the JWT and transparently refreshes once on a
 * 401. Use for all authenticated API calls.
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const { access, refresh } = useAuth.getState();
  let res = await doFetch(access);

  if (res.status === 401 && refresh) {
    const r = await fetch(`${BASE}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (r.ok) {
      const d = await r.json();
      useAuth.setState({ access: d.access });
      res = await doFetch(d.access);
    } else {
      useAuth.getState().logout();
    }
  }
  return res;
}
