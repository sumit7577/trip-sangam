import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/pokhara-tour-package-from-raxaul/";

export const metadata: Metadata = pageMeta({
  title: "Pokhara Tour Package from Raxaul",
  description:
    "Plan a Pokhara tour from Raxaul with TripSangam Travels. Phewa Lake, Sarangkot sunrise and Himalayan views, with Raxaul–Birgunj border assistance and private or group travel.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I reach Pokhara from Raxaul?",
    a: "From Raxaul you cross into Nepal at the Raxaul–Birgunj border and travel on to Pokhara by road. Many travellers combine Pokhara with Kathmandu. We arrange pickup at Raxaul and a private vehicle or group tour onward; road time varies with traffic, road and weather conditions and stops.",
  },
  {
    q: "What is there to see in Pokhara?",
    a: "Popular spots include Phewa Lake and boating, the Sarangkot sunrise viewpoint, the World Peace Pagoda, Davis Falls and the lakeside area. On a clear day you also get fine Himalayan views.",
  },
  {
    q: "Can I combine Pokhara with Kathmandu or Muktinath?",
    a: "Yes. Pokhara pairs well with Kathmandu, and it is also the usual base for onward travel to Muktinath. Tell us your days and we will plan a combined route.",
  },
  {
    q: "Is a Pokhara trip suitable for families and senior citizens?",
    a: "Yes. Pokhara is relaxed and easy-going, so it suits families and senior travellers. We can arrange a comfortable vehicle and a gentle pace.",
  },
];

export default async function PokharaFromRaxaulPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /pokhara/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/pokhara/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Pokhara Tour Package from Raxaul", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Pokhara Tour Package from Raxaul
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Pokhara is Nepal's lakeside favourite — calm waters, sunrise viewpoints and Himalayan
          backdrops. TripSangam Travels plans Pokhara trips that start from Raxaul, with help at the
          Raxaul–Birgunj border and a choice of private vehicle or group tour.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Pokhara tour package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="How to reach Pokhara from Raxaul">
          From Raxaul you cross into Nepal at the Raxaul–Birgunj border and continue to Pokhara by road,
          often via Kathmandu or the highway through the hills. We meet you at Raxaul, assist with the
          crossing and arrange the journey onward. Travel time depends on the route, traffic, road and
          weather conditions and your stops, so we plan with comfortable breaks.
        </Section>

        <Section title="What to see in Pokhara">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Phewa Lake and boating on the water</li>
            <li>Sarangkot for sunrise and mountain views</li>
            <li>The World Peace Pagoda above the lake</li>
            <li>Davis Falls and the Gupteshwor Cave nearby</li>
            <li>The lakeside area for an easy evening stroll</li>
          </ul>
        </Section>

        <Section title="Combine Pokhara with Kathmandu or Muktinath">
          Pokhara works well alongside Kathmandu for a classic Nepal trip, and it is the usual base for
          travelling onward to Muktinath. Share your dates and we will suggest a route that fits — see
          our <Link href="/muktinath-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Muktinath tour package from Raxaul</Link>.
        </Section>

        <Section title="Private vehicle or group tour?">
          Choose a private vehicle for flexibility over your pace and stops, or a group tour for a
          friendlier, value-for-money trip. Tell us your group size and dates and we will recommend the
          better option.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal but should carry a valid photo ID such as a
          passport or Voter ID, plus a few spare copies and photos. Pack light layers — Pokhara is mild,
          but mornings at viewpoints can be cool.
        </Section>

        <Section title="How to book">
          Tell us your travel dates, the number of travellers and whether you want to add Kathmandu or
          Muktinath. We will share a plan and a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Pokhara trip quotation from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Pokhara & Nepal tour packages"
        intro="Itineraries that feature Pokhara, or that we can customise from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/raxaul-to-kathmandu-travel/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul to Kathmandu travel</Link>{" · "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Pokhara from Raxaul — common questions" />
    </main>
  );
}
