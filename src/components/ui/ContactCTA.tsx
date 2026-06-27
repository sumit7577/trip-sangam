import { Phone, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/seo";

/** Inline click-to-call + click-to-WhatsApp buttons. */
export function ContactCTA({
  message = "Hi TripSangam, I'd like a quotation for a Nepal tour from Raxaul.",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  const wa = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <a
        href={`tel:${BUSINESS.phone}`}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
      >
        <Phone className="h-4 w-4" /> Call {BUSINESS.phoneDisplay}
      </a>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white transition-colors hover:brightness-105"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp enquiry
      </a>
    </div>
  );
}
