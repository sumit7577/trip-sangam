import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/muktinath-tour-package-from-raxaul/";

export const metadata: Metadata = pageMeta({
  title: "Muktinath Tour Package from Raxaul",
  description:
    "Muktinath pilgrimage tour from Raxaul with TripSangam Travels. Plan your darshan via Pokhara with Raxaul–Birgunj border assistance — suitable for families and senior pilgrims.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I reach Muktinath from Raxaul?",
    a: "From Raxaul you cross at the Raxaul–Birgunj border and travel towards Pokhara, then continue into the mountains to Muktinath. It is a longer, hilly journey usually done over several days, so we plan it with rest stops. Travel time varies with road, weather and altitude conditions.",
  },
  {
    q: "Why is Muktinath important for pilgrims?",
    a: "Muktinath is a revered pilgrimage site sacred to both Hindus and Buddhists, set high in the mountains. Pilgrims visit the temple and the rows of water spouts around it for darshan.",
  },
  {
    q: "Is the Muktinath trip suitable for senior citizens?",
    a: "Many senior pilgrims make the journey. Because Muktinath is at high altitude and the roads are mountainous, we plan a gentle pace with rest days and suitable vehicles. Travellers with health concerns should consult their doctor before going.",
  },
  {
    q: "Can I combine Muktinath with Pokhara and Kathmandu?",
    a: "Yes. A common plan is Kathmandu and Pokhara with Muktinath as the pilgrimage highlight — see our Muktinath · Pokhara · Kathmandu Divine Journey for a ready-made 7-day itinerary. Tell us your days and we will build a combined route.",
  },
  {
    q: "Does the Muktinath tour package include Jomsom?",
    a: "Yes — Jomsom is the overnight base for Muktinath darshan on our itineraries, and the route through the Kali Gandaki valley (Rupse Waterfall, Lete viewpoint) is part of the journey there and back.",
  },
  {
    q: "Is there a Muktinath darshan package for families?",
    a: "Yes. We plan Muktinath trips at a comfortable pace with rest stops, suitable vehicles and flexible timing, which works well for families and mixed-age groups travelling together.",
  },
];

export default async function MuktinathFromRaxaulPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /muktinath|pokhara/i.test(`${p.name} ${p.location}`) || p.category === "Spiritual")
    .concat(packages)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Muktinath Tour Package from Raxaul", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Muktinath Tour Package from Raxaul
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Muktinath is one of the most revered Himalayan pilgrimage sites, sacred to Hindus and
          Buddhists alike. TripSangam Travels arranges Muktinath yatra from Raxaul — with help at the
          Raxaul–Birgunj border and a carefully paced journey via Pokhara, suitable for families and
          senior pilgrims.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Muktinath pilgrimage tour from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="About Muktinath">
          Muktinath sits high in the mountains of the Mustang region and is held sacred by both Hindu and
          Buddhist pilgrims. Visitors come for darshan at the temple and the rows of water spouts around
          it. Because of its altitude and setting, the journey is as much a part of the pilgrimage as the
          destination.
        </Section>

        <Section title="How to reach Muktinath from Raxaul">
          From Raxaul, you cross into Nepal at the Raxaul–Birgunj border and travel towards Pokhara,
          then continue into the mountains to Muktinath. This is a longer, hilly route usually spread
          over several days. Roads in the higher reaches can be affected by weather, so we keep the plan
          flexible and paced with rest stops rather than fixing it to a single travel time.
        </Section>

        <Section title="A pilgrimage paced for comfort">
          We plan the yatra with comfortable stops, suitable vehicles and rest where needed — which
          matters at altitude, especially for senior travellers. Pilgrims with health concerns should
          check with their doctor before the trip and carry any required medicines.
        </Section>

        <Section title="Combine with Pokhara and Kathmandu">
          Most Muktinath trips pass through Pokhara, and many travellers add Kathmandu to complete the
          journey. See our{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" "}
          and{" "}
          <Link href="/raxaul-to-kathmandu-travel/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul to Kathmandu travel</Link>.
        </Section>

        <Section title="Documents Indian pilgrims should carry">
          Indian citizens do not need a visa for Nepal, but should carry a valid photo ID such as a
          passport or Voter ID, plus spare copies and photos. Pack warm clothing — it is cold at
          Muktinath even when the lowlands are warm.
        </Section>

        <Section title="How to book your Muktinath yatra">
          Share your travel dates, number of pilgrims and whether you would like to add Pokhara or
          Kathmandu, and we will plan a comfortable itinerary with a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please plan a Muktinath yatra from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Muktinath & pilgrimage packages"
        intro="Pilgrimage and Himalayan itineraries we can tailor from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Muktinath from Raxaul — common questions" />
    </main>
  );
}
