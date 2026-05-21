"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "INR" | "USD" | "NPR";

const rates: Record<Currency, number> = {
  INR: 1,
  USD: 1 / 84,
  NPR: 1.6,
};

const symbols: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  NPR: "Rs",
};

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "INR",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "ht-currency" }
  )
);

export function convert(amountINR: number, to: Currency) {
  return Math.round(amountINR * rates[to]);
}

export function formatPrice(amountINR: number, currency: Currency) {
  const value = convert(amountINR, currency);
  const formatted = new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
  return `${symbols[currency]}${formatted}`;
}
