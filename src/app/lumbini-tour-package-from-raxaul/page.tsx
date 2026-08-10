import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/lumbini-tour-package-from-raxaul/";

export const metadata: Metadata = pageMeta({
  title: "Lumbini Tour Package from Raxaul",
  description:
    "Book a Lumbini tour package from Raxaul with TripSangam Travels — Maya Devi Temple and the birthplace of the Buddha, with Raxaul–Birgunj border assistance, private or group travel.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I reach Lumbini from Raxaul?",
    a: "From Raxaul you cross into Nepal at the Raxaul–Birgunj border and travel on to Lumbini by road. We meet you at Raxaul, assist with the crossing and arrange a private vehicle or group tour onward; road time depends on traffic, road and weather conditions and the stops you take.",
  },
  {
    q: "What is there to see in Lumbini?",
    a: "Lumbini is the birthplace of the Buddha, a UNESCO World Heritage Site. The Maya Devi Temple marks the exact birth spot, and the surrounding Monastic Zone has temples and monasteries built by Buddhist communities from around the world.",
  },
  {
    q: "Can I combine Lumbini with Pokhara and Kathmandu?",
    a: "Yes — Lumbini pairs naturally with a Pokhara and Kathmandu circuit as a multi-city trip from Raxaul. Tell us your days and we'll plan the route.",
  },
  {
    q: "Is Lumbini suitable for a family or pilgrimage group?",
    a: "Yes. Lumbini is calm and unhurried, so it works well for families, pilgrimage groups and senior travellers. We arrange a comfortable vehicle and an easy pace.",
  },
  {
    q: "How many days do I need for a Lumbini trip?",
    a: "A focused Lumbini visit fits in a day, but most travellers combine it with Pokhara and Kathmandu as part of a longer trip — typically 5 to 6 days in total.",
  },
];

export default async function LumbiniFromRaxaulPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /lumbini/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/lumbini/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Lumbini Tour Package from Raxaul", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Lumbini Tour Package from Raxaul
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Lumbini, the birthplace of the Buddha, is one of Nepal's most peaceful pilgrimage stops.
          TripSangam Travels plans Lumbini trips that start from Raxaul, with help at the
          Raxaul–Birgunj border and a choice of private vehicle or group tour — on its own or combined
          with Pokhara and Kathmandu.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Lumbini tour package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="How to reach Lumbini from Raxaul">
          From Raxaul you cross into Nepal at the Raxaul–Birgunj border and continue to Lumbini by road.
          We meet you at Raxaul, assist with the crossing and arrange the journey onward. Travel time
          depends on the route, traffic, road and weather conditions and your stops, so we plan with
          comfortable breaks rather than a fixed clock.
        </Section>

        <Section title="What to see in Lumbini">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>The Maya Devi Temple, marking the Buddha's exact birthplace</li>
            <li>The sacred garden and the Ashoka Pillar</li>
            <li>The Monastic Zone — temples and monasteries built by Buddhist communities worldwide</li>
            <li>The Puskarini (sacred pond) where Queen Maya Devi is said to have bathed before the birth</li>
          </ul>
        </Section>

        <Section title="Combine Lumbini with Pokhara and Kathmandu">
          Lumbini works well as the start of a longer circuit — onward to Pokhara's lakes, then
          Kathmandu's temples and heritage sites. See our{" "}
          <Link href="/packages/lumbini-pokhara-kathmandu-tour/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Lumbini · Pokhara · Kathmandu Tour</Link>{" "}
          for a ready-made itinerary, or tell us your days and we'll build one to fit.
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
          Tell us your travel dates, the number of travellers and whether you'd like to add Pokhara or
          Kathmandu. We will share a plan and a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Lumbini trip quotation from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Lumbini & Nepal tour packages"
        intro="Itineraries that feature Lumbini, or that we can customise from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul Nepal trip</Link>{" · "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Lumbini from Raxaul — common questions" />
    </main>
  );
}
