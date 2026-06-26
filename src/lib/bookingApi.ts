"use client";

import { authFetch } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Departure {
  id: number;
  packageSlug: string;
  packageName: string;
  startDate: string;
  endDate: string;
  groupLabel: string;
  status: string;
  isGuaranteed: boolean;
  minCapacity: number;
  maxCapacity: number;
  seatsConfirmed: number;
  seatsLeft: number;
  priceINR: number;
  cutoffDate: string;
}

export interface CoTraveller {
  name: string;
  phone: string;
  partySize: number;
  status: string;
  isYou: boolean;
}

export interface Booking {
  id: number;
  status: string;
  paymentStatus: string;
  packageSlug: string;
  packageName: string;
  partySize: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  holdExpiresAt: string | null;
  departure: Departure | null;
  createdAt: string;
  coTravellers?: CoTraveller[];
}

export interface PaymentInit {
  id: number;
  bookingId: number;
  kind: string;
  merchantOrderId: string;
  amountPaise: number;
  status: string;
  redirectUrl: string;
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** Public — upcoming slots for a package (no auth). */
export async function getDepartures(packageSlug: string): Promise<Departure[]> {
  const res = await fetch(`${BASE}/api/departures/?package=${encodeURIComponent(packageSlug)}`);
  return unwrap<Departure[]>(res);
}

export async function createBooking(input: {
  packageSlug: string;
  partySize: number;
  preferredStartDate?: string;
  departureId?: number;
  flexible?: boolean;
}): Promise<Booking> {
  const res = await authFetch("/api/bookings/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return unwrap<Booking>(res);
}

export async function getMyBookings(): Promise<Booking[]> {
  return unwrap<Booking[]>(await authFetch("/api/bookings/"));
}

export async function getBooking(id: number | string): Promise<Booking> {
  return unwrap<Booking>(await authFetch(`/api/bookings/${id}/`));
}

export async function acceptBooking(id: number | string): Promise<{ booking: Booking; payment: PaymentInit | null }> {
  const res = await authFetch(`/api/bookings/${id}/accept/`, { method: "POST" });
  return unwrap<{ booking: Booking; payment: PaymentInit | null }>(res);
}

export async function declineBooking(id: number | string): Promise<Booking> {
  return unwrap<Booking>(await authFetch(`/api/bookings/${id}/decline/`, { method: "POST" }));
}

export async function cancelBooking(id: number | string): Promise<Booking> {
  return unwrap<Booking>(await authFetch(`/api/bookings/${id}/cancel/`, { method: "POST" }));
}

export async function payBalance(id: number | string): Promise<PaymentInit> {
  return unwrap<PaymentInit>(await authFetch(`/api/bookings/${id}/pay-balance/`, { method: "POST" }));
}

export interface Traveller {
  id?: number;
  fullName: string;
  age?: number | null;
  gender?: string;
  idType?: string;
  idNumber?: string;
}

export async function getTravellers(id: number | string): Promise<Traveller[]> {
  return unwrap<Traveller[]>(await authFetch(`/api/bookings/${id}/travellers/`));
}

export async function saveTravellers(id: number | string, list: Traveller[]): Promise<Traveller[]> {
  return unwrap<Traveller[]>(
    await authFetch(`/api/bookings/${id}/travellers/`, {
      method: "POST",
      body: JSON.stringify(list),
    })
  );
}
