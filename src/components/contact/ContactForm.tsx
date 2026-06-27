"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/seo";

/**
 * Enquiry form that composes a pre-filled WhatsApp message and opens chat with
 * TripSangam. No backend needed — WhatsApp is the business's primary channel.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [travellers, setTravellers] = useState("");
  const [dates, setDates] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const lines = [
      "Hi TripSangam Travels, I'd like a Nepal tour quotation.",
      name && `Name: ${name}`,
      destination && `Destinations: ${destination}`,
      dates && `Travel dates: ${dates}`,
      travellers && `Travellers: ${travellers}`,
      message && `Message: ${message}`,
    ].filter(Boolean);
    const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const field = "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink dark:bg-white/5 dark:text-white";

  return (
    <form onSubmit={send} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <input className={field} value={travellers} onChange={(e) => setTravellers(e.target.value)} placeholder="Number of travellers" inputMode="numeric" />
        <input className={field} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destinations (e.g. Kathmandu, Pokhara)" />
        <input className={field} value={dates} onChange={(e) => setDates(e.target.value)} placeholder="Travel dates" />
      </div>
      <textarea
        className="min-h-[96px] w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink dark:bg-white/5 dark:text-white"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Anything else we should know?"
      />
      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white transition-colors hover:brightness-105 sm:w-auto sm:px-7"
      >
        <MessageCircle className="h-4 w-4" /> Send enquiry on WhatsApp
      </button>
      <p className="text-xs text-muted">
        This opens WhatsApp with your details pre-filled — review and tap send. You can also call us directly.
      </p>
    </form>
  );
}
