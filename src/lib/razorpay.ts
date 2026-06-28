"use client";

import { verifyPayment, type PaymentInit, type Booking } from "@/lib/bookingApi";

let scriptPromise: Promise<boolean> | null = null;

/** Inject Razorpay's checkout.js once. Resolves false if it can't load. */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as Window & { Razorpay?: unknown }).Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => { scriptPromise = null; resolve(false); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

type Callbacks = {
  onSuccess: (booking: Booking) => void;
  onError: (message: string) => void;
  onDismiss: () => void;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Open Razorpay Standard Checkout for a created order, then verify on success. */
export async function openRazorpayCheckout(bookingId: number | string, p: PaymentInit, cb: Callbacks) {
  const ok = await loadRazorpay();
  const RZP = (window as any).Razorpay;
  if (!ok || !RZP) {
    cb.onError("Couldn't load the payment window. Please try again.");
    return;
  }
  const rzp = new RZP({
    key: p.keyId,
    order_id: p.razorpayOrderId,
    amount: p.amount,
    currency: p.currency || "INR",
    name: "Trip Sangam",
    description: p.kind === "balance" ? "Balance payment" : "Deposit payment",
    prefill: { name: p.prefillName || "", email: p.prefillEmail || "", contact: p.prefillContact || "" },
    theme: { color: "#1C1C1A" },
    handler: async (resp: any) => {
      try {
        const updated = await verifyPayment(bookingId, {
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_signature: resp.razorpay_signature,
        });
        cb.onSuccess(updated);
      } catch (e) {
        cb.onError(e instanceof Error ? e.message : "Payment captured, but verification failed. We'll sort it out.");
      }
    },
    modal: { ondismiss: () => cb.onDismiss() },
  });
  rzp.on("payment.failed", (resp: any) => {
    cb.onError(resp?.error?.description || "Payment failed. Please try again.");
  });
  rzp.open();
}
