import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, Globe } from "lucide-react";
import { pageMeta, BUSINESS, travelAgencyJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/contact/ContactForm";

const PATH = "/contact/";

export const metadata: Metadata = pageMeta({
  title: "Contact TripSangam Travels — Raxaul, Bihar",
  description:
    "Contact TripSangam Travels in Raxaul, Bihar for Nepal tour packages. Call or WhatsApp +91 76785 38192 for Kathmandu, Pokhara and Muktinath trip quotations.",
  path: PATH,
});

export default function ContactPage() {
  const wa = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent("Hi TripSangam, I'd like a Nepal tour quotation from Raxaul.")}`;

  return (
    <main className="min-h-screen bg-sand pb-20 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <JsonLd data={travelAgencyJsonLd()} />
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">Contact TripSangam Travels</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted md:text-base">
          Planning a Nepal trip from Raxaul? Send us your dates and destinations and we will share an
          itinerary and quotation. Call or WhatsApp us directly, or use the enquiry form below.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* NAP + quick actions */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-line bg-white p-6 dark:bg-white/5">
              <p className="font-serif text-xl text-ink dark:text-white">{BUSINESS.name}</p>

              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-start gap-2.5 text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Raxaul, East Champaran, Bihar – 845305, India</span>
                </p>
                <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-2.5 text-ink hover:underline dark:text-white">
                  <Phone className="h-4 w-4 shrink-0" /> {BUSINESS.phoneDisplay}
                </a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-ink hover:underline dark:text-white">
                  <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp us
                </a>
                <p className="flex items-center gap-2.5 text-muted">
                  <Globe className="h-4 w-4 shrink-0" /> tripsangam.com
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={`tel:${BUSINESS.phone}`} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink/90">
                <Phone className="h-4 w-4" /> Call now
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white hover:brightness-105">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <p className="text-xs text-muted">
              We mainly serve travellers starting from Raxaul and the Raxaul–Birgunj border, with tours
              across Kathmandu, Pokhara, Muktinath, Chitwan and Lumbini.
            </p>
          </aside>

          {/* Enquiry form */}
          <div className="rounded-3xl border border-line bg-white p-6 dark:bg-white/5">
            <h2 className="font-serif text-2xl tracking-tight">Send an enquiry</h2>
            <p className="mt-1 text-sm text-muted">Tell us a little about your trip and we will reply with a plan.</p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Service area + map. Shows Raxaul (verified locality), not a precise
            office pin — exact hours/address can be added once confirmed. */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl tracking-tight">Where we are &amp; how to reach us</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            We are based in Raxaul, on the India–Nepal border in Bihar, and arrange tours from the
            Raxaul–Birgunj crossing across Nepal. The quickest way to reach us is on call or WhatsApp —
            message any time with your travel dates and we will reply with a plan and quotation.
          </p>
          <div className="mt-6 overflow-hidden rounded-3xl border border-line">
            <iframe
              title="Raxaul, Bihar — TripSangam Travels service area"
              src="https://www.google.com/maps?q=Raxaul%2C%20Bihar%2C%20India&output=embed"
              className="h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Map shows Raxaul, Bihar. Tell us your arrival train or time and we will arrange to meet you at
            Raxaul railway station or the Raxaul–Birgunj border.
          </p>
        </section>
      </div>
    </main>
  );
}
