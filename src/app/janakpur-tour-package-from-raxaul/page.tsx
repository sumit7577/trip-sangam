import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/janakpur-tour-package-from-raxaul/";

export const metadata: Metadata = pageMeta({
  title: "Janakpur Tour Package from Raxaul",
  description:
    "Book a Janakpur darshan package from Raxaul with TripSangam Travels — the Ram Janki Temple and Sita Vivah Mandap, with Raxaul–Birgunj border assistance, private or group travel.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I reach Janakpur from Raxaul?",
    a: "Janakpur is reachable by road from Raxaul, either via the Raxaul–Birgunj border and onward through Nepal, or via the India-side route depending on your starting point. We arrange the pickup and the full journey — tell us your dates and we'll plan the route.",
  },
  {
    q: "What is there to see in Janakpur?",
    a: "Janakpur is the birthplace of Sita and a major pilgrimage site. The Ram Janki Temple (Janaki Mandir) is the centrepiece, along with the Vivah Mandap commemorating the wedding of Ram and Sita, and the Ganga Sagar and other sacred ponds around the city.",
  },
  {
    q: "Can I combine Janakpur with Kathmandu and Pokhara?",
    a: "Yes — Janakpur fits well as the final leg of a longer pilgrimage circuit through Pokhara, Muktinath and Kathmandu. See our Grand Yatra itinerary for an example route.",
  },
  {
    q: "Is Janakpur suitable for a pilgrimage or family group?",
    a: "Yes. Janakpur is a calm, deeply spiritual town, well suited to pilgrimage groups, families and senior travellers. We arrange a comfortable vehicle and an easy pace.",
  },
];

export default async function JanakpurFromRaxaulPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /janakpur/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/janakpur/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Janakpur Tour Package from Raxaul", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Janakpur Tour Package from Raxaul
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Janakpur — birthplace of Sita and home to the Ram Janki Temple — is one of the most sacred
          stops on a Nepal pilgrimage. TripSangam Travels plans Janakpur trips from Raxaul, on their
          own or as the closing leg of a longer Kathmandu–Pokhara–Muktinath circuit.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Janakpur tour package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="How to reach Janakpur from Raxaul">
          Janakpur can be reached by road from Raxaul, and we arrange the full journey — pickup,
          border assistance where needed, and travel onward. Route and travel time depend on your
          starting point, road conditions and the stops you take, so we plan with comfortable breaks
          rather than a fixed schedule.
        </Section>

        <Section title="What to see in Janakpur">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Ram Janki Temple (Janaki Mandir), the city's spiritual centrepiece</li>
            <li>Vivah Mandap, marking the wedding site of Ram and Sita</li>
            <li>Ganga Sagar and the city's sacred ponds</li>
            <li>The old town's temples and pilgrim lanes</li>
          </ul>
        </Section>

        <Section title="Combine Janakpur with Kathmandu and Pokhara">
          Janakpur works well as the final stop on a longer pilgrimage — see our{" "}
          <Link href="/packages/pokhara-muktinath-kathmandu-janakpur-grand-yatra/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara · Muktinath · Kathmandu · Janakpur Grand Yatra</Link>{" "}
          for a ready-made 8-day route, or tell us your days and we'll build one to fit.
        </Section>

        <Section title="Private vehicle or group tour?">
          Choose a private vehicle for flexibility over your pace and stops, or a group tour for a
          friendlier, value-for-money trip. Tell us your group size and dates and we will recommend the
          better option.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal but should carry a valid photo ID such as a
          passport or Voter ID, plus a few spare copies and photos.
        </Section>

        <Section title="How to book">
          Tell us your travel dates, the number of travellers and whether you'd like to combine
          Janakpur with other cities. We will share a plan and a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Janakpur trip quotation from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Janakpur & Nepal tour packages"
        intro="Itineraries that feature Janakpur, or that we can customise from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul Nepal trip</Link>{" · "}
          <Link href="/nepal-pilgrimage-tour-from-india/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal pilgrimage tour from India</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Janakpur from Raxaul — common questions" />
    </main>
  );
}
