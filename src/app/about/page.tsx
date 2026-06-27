import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { Newsletter } from "@/components/home/Newsletter";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMeta, travelAgencyJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About TripSangam Travels",
  description:
    "TripSangam Travels is a Nepal tour operator based in Raxaul, Bihar, arranging Kathmandu, Pokhara, Muktinath and Chitwan trips with Raxaul–Birgunj border assistance.",
  path: "/about/",
});

const destinations = ["Kathmandu", "Pokhara", "Muktinath", "Chitwan", "Lumbini", "Nagarkot"];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={travelAgencyJsonLd()} />
      <AboutHero />

      {/* Who we are */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
          <span className="h-px w-8 bg-crimson" /> Who we are
        </p>
        <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
          A travel agency built around the <span className="italic text-crimson">Raxaul–Nepal route.</span>
        </h2>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted md:text-base">
          <p>
            TripSangam Travels is based in Raxaul, East Champaran, Bihar — right beside the Raxaul–Birgunj
            border, the main road gateway into Nepal from Bihar. We plan and arrange Nepal tours that begin
            here, so travellers from Bihar and across India can start close to home.
          </p>
          <p>
            We focus on pilgrimage, family and holiday trips — to Kathmandu, Pokhara, Muktinath, Chitwan and
            Lumbini — with pickup at Raxaul, help across the Birgunj border, and a choice of private or group
            travel. We keep plans flexible and paced to suit families and senior travellers.
          </p>
          <p>
            Tell us your dates and the places you would like to see, and we will put together an itinerary
            and a quotation that fits. You can reach us any time on call or WhatsApp.
          </p>
        </div>
        <ContactCTA className="mt-7" message="Hi TripSangam, I'd like to know more about your Nepal tours from Raxaul." />
      </section>

      <ValuesGrid />

      {/* Where we take you */}
      <section className="mx-auto max-w-5xl px-5 pb-8 md:px-8 md:pb-16">
        <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Where we take you</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Destinations we cover on tours starting from Raxaul.</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {destinations.map((d) => (
            <span key={d} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink dark:bg-white/5 dark:text-white">
              {d}
            </span>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
