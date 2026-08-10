import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/kathmandu-tour-package-from-raxaul/";

export const metadata: Metadata = pageMeta({
  title: "Kathmandu Tour Package from Raxaul",
  description:
    "Plan a Kathmandu tour from Raxaul with TripSangam Travels — Pashupatinath, Boudhanath, Swayambhunath and the Durbar Squares, with Raxaul–Birgunj border assistance and private or small-group travel.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I reach Kathmandu from Raxaul?",
    a: "From Raxaul you cross into Nepal at the Raxaul–Birgunj border and continue to Kathmandu by road through the hills. We meet you at Raxaul, help with the crossing and arrange the journey onward by private vehicle or small-group tour. Road time varies with the route, traffic, road and weather conditions and your stops.",
  },
  {
    q: "Which places does a Kathmandu tour cover?",
    a: "A typical Kathmandu visit covers Pashupatinath Temple, Boudhanath Stupa, Swayambhunath (the Monkey Temple) and Kathmandu Durbar Square, plus time around Thamel. Many travellers add a day trip to nearby Bhaktapur or Patan for their old squares and crafts.",
  },
  {
    q: "Can I add Pokhara or Muktinath to a Kathmandu trip?",
    a: "Yes. Kathmandu pairs naturally with Pokhara for a classic Nepal route, and Pokhara is the usual base for travelling onward to Muktinath. Share your dates and the number of days you have and we will plan a combined itinerary.",
  },
  {
    q: "Should I choose a private vehicle or a small-group tour?",
    a: "A private vehicle gives you flexibility over your pace and the order you see the sites; a small-group tour is friendlier and better value for couples and solo travellers. Tell us your group size and dates and we will suggest the better fit.",
  },
  {
    q: "Is there a 3-day Kathmandu tour package from Raxaul?",
    a: "Yes — 3 days is a comfortable length for a focused Kathmandu visit: Pashupatinath, Boudhanath, Swayambhunath and Durbar Square, with time for Thamel. See our Kathmandu Heritage Tour for a ready-made 3-day itinerary.",
  },
  {
    q: "What does a Kathmandu tour package cost from Bihar?",
    a: "Our Kathmandu Heritage Tour starts from ₹7,599 per person for 3 days, on a twin-sharing basis. The exact price depends on your dates, season and group size — see our Nepal tour package cost guide, or ask us for a quote.",
  },
  {
    q: "Can I book a Kathmandu · Pokhara · Muktinath combined tour package?",
    a: "Yes — this is one of our most popular routes. See our Muktinath · Pokhara · Kathmandu Divine Journey for a ready-made 7-day itinerary covering all three.",
  },
];

export default async function KathmanduFromRaxaulPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /kathmandu|heritage|pashupati/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/kathmandu|heritage|pashupati/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Kathmandu Tour Package from Raxaul", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Kathmandu Tour Package from Raxaul
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Kathmandu is Nepal's capital and the heart of its temples, stupas and old royal squares.
          TripSangam Travels plans Kathmandu trips that start from Raxaul, with help at the
          Raxaul–Birgunj border and a choice of private vehicle or small-group travel.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Kathmandu tour package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="How to reach Kathmandu from Raxaul">
          From Raxaul you cross into Nepal at the Raxaul–Birgunj border and continue to Kathmandu by
          road, climbing through the hills into the valley. We meet you at Raxaul, assist with the
          crossing and arrange the onward journey. Travel time depends on the route, traffic, road and
          weather conditions and the stops you want, so we plan with comfortable breaks along the way.
        </Section>

        <Section title="What to see in Kathmandu">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Pashupatinath Temple on the banks of the Bagmati River</li>
            <li>Boudhanath Stupa, one of the largest stupas around</li>
            <li>Swayambhunath, the hilltop Monkey Temple with valley views</li>
            <li>Kathmandu Durbar Square and its old palace courtyards</li>
            <li>Thamel for shopping, cafés and an easy evening stroll</li>
            <li>A day trip to Bhaktapur or Patan for their heritage squares</li>
          </ul>
        </Section>

        <Section title="Combine Kathmandu with Pokhara or Muktinath">
          Kathmandu works well alongside lakeside Pokhara for a classic Nepal trip, and Pokhara is the
          usual base for travelling onward to Muktinath. Tell us your days and we will suggest a route
          that fits — see our{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" "}
          and{" "}
          <Link href="/muktinath-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Muktinath tour package from Raxaul</Link>.
        </Section>

        <Section title="Private vehicle or small-group tour?">
          Pick a private vehicle when you want full flexibility over your pace, your stops and the order
          you see Kathmandu's sites, which suits families and senior travellers. Choose a small-group
          tour for a friendlier, value-for-money trip. Share your group size and dates and we will
          recommend the better option.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal but should carry a valid photo ID such as a
          passport or Voter ID, along with a few spare copies and passport photos. Kathmandu's temples
          and stupas are living places of worship, so dress modestly, and carry light layers as the
          valley can be cool in the mornings and evenings.
        </Section>

        <Section title="How to book">
          Tell us your travel dates, the number of travellers and whether you want to add Pokhara or
          Muktinath. We will share a suggested plan and a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Kathmandu trip quotation from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Kathmandu & Nepal tour packages"
        intro="Itineraries that feature Kathmandu, or that we can customise from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" · "}
          <Link href="/muktinath-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Muktinath tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Kathmandu from Raxaul — common questions" />
    </main>
  );
}
