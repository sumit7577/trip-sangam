import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-pilgrimage-tour-from-india/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Pilgrimage Tour from India",
  description:
    "Nepal pilgrimage tours from India via Raxaul — Pashupatinath, Muktinath and Janakpur darshan, with border assistance, comfortable travel and a respectful, well-planned pace for all ages.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "Which darshan sites can a Nepal pilgrimage tour cover?",
    a: "We commonly plan visits to Pashupatinath Temple in Kathmandu, Muktinath, and Janakpur's Janaki Mandir. Lumbini, the birthplace of Buddha, can be added for those who wish. Tell us your days and which sites matter most, and we will build a route that fits.",
  },
  {
    q: "Do Indian citizens need a visa for a pilgrimage in Nepal?",
    a: "Indian citizens do not need a visa for Nepal, but every traveller should carry a valid photo ID such as a passport or Voter ID, along with a few spare copies and photos. We help with the crossing at the Raxaul–Birgunj border.",
  },
  {
    q: "Is the trip suitable for elderly pilgrims?",
    a: "Yes. We plan a respectful, unhurried pace with comfortable travel and rest stops, which suits families travelling with elders. Muktinath sits at high altitude and is reached by road, so we keep the schedule gentle. Please share any health needs in advance so we can plan sensibly.",
  },
  {
    q: "How do we reach Nepal for the yatra?",
    a: "Most pilgrims travel to Raxaul, cross into Nepal at the Raxaul–Birgunj border, and continue by road to the temples. Travel times vary with route, traffic, road and weather, so we plan with comfortable breaks along the way.",
  },
];

export default async function NepalPilgrimageFromIndiaPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /muktinath|pashupati|divine|pilgrim/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/muktinath|pashupati|divine|pilgrim/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Pilgrimage Tour from India", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Pilgrimage Tour from India
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          For many families in India, a darshan across Nepal is a long-held wish. TripSangam Travels
          is a Nepali-owned team that plans pilgrimage tours from India via Raxaul, with help at the
          Raxaul–Birgunj border, comfortable travel and a respectful, well-planned pace that works
          for all ages.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Nepal pilgrimage (darshan) tour from India." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="A pilgrimage across Nepal">
          Nepal holds some of the most revered sites in the Hindu and Buddhist worlds, and a single
          journey can bring several of them together. We plan your yatra around the days you have and
          the temples closest to your heart, weaving in the travel between them so the trip feels
          calm rather than rushed. Being a local team, we know the routes, the temple timings and the
          small courtesies that make a darshan smooth.
        </Section>

        <Section title="Sacred sites you can include">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Pashupatinath Temple in Kathmandu, one of the holiest shrines of Lord Shiva</li>
            <li>Muktinath, the high-altitude shrine sacred to both Hindus and Buddhists</li>
            <li>Janakpur's Janaki Mandir, the temple devoted to Mata Sita</li>
            <li>Lumbini — the birthplace of Buddha — for those who wish to add it</li>
          </ul>
        </Section>

        <Section title="Muktinath darshan">
          Muktinath is a deeply revered shrine and a highlight of many pilgrimages. It sits at high
          altitude and is reached by road, so we plan a respectful, unhurried pace with rest stops and
          time to acclimatise along the way. See our{" "}
          <Link href="/muktinath-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Muktinath tour package from Raxaul</Link>{" "}
          for how we usually arrange this leg.
        </Section>

        <Section title="How to reach from Raxaul">
          Most pilgrims from India travel to Raxaul and cross into Nepal at the Raxaul–Birgunj border.
          We meet you at Raxaul, assist with the crossing and arrange the road journey onward to your
          chosen temples, often via Kathmandu. Travel times vary with route, traffic, road and weather
          conditions and your stops, so we build the days with comfortable breaks and realistic
          driving hours.
        </Section>

        <Section title="A respectful, comfortable pace for elders">
          Pilgrimage groups often include senior travellers, and we plan with that in mind. That means
          a comfortable vehicle, unhurried days, breaks for meals and prayer, and accommodation kept
          simple and clean. If anyone in your group has particular health or mobility needs, tell us in
          advance so we can shape the route and the pace sensibly.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal, but every traveller should carry a valid photo
          ID such as a passport or Voter ID, plus a few spare copies and passport photos. Pack warm
          layers for higher places, comfortable footwear for the temples, and any regular medicines.
          We are happy to advise on what to expect at each site.
        </Section>

        <Section title="Plan your yatra">
          Share your travel dates, the number of pilgrims and the temples you wish to include, and tell
          us if you would like to add Lumbini. We will suggest a respectful route and a quotation that
          suits your group.
          <ContactCTA className="mt-5" message="Hi TripSangam, please plan a Nepal pilgrimage (darshan) yatra from India." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Pilgrimage & divine journeys"
        intro="Darshan-focused itineraries, and trips we can adapt for your yatra from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/muktinath-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Muktinath tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Nepal pilgrimage tour — common questions" />
    </main>
  );
}
