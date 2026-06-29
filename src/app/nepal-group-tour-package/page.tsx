import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-group-tour-package/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Group Tour Package",
  description:
    "Join a Nepal group tour from Raxaul with TripSangam Travels — small-group departures to Kathmandu, Pokhara and Muktinath at a friendly per-person price, with border assistance.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "When do your group tours leave?",
    a: "We run small-group departures for our regular packages on set dates. A group forms as travellers sign up for the same package and dates. Tell us where you want to go and roughly when, and we will let you know which departures are filling up so you can pick one that suits you.",
  },
  {
    q: "How much does a group tour cost per person?",
    a: "Group departures are priced per person, and sharing the trip with others usually makes them better value than travelling privately. The exact price depends on the package, the route and the season, so share your dates and we will give you a clear per-person quotation before you commit.",
  },
  {
    q: "Do I need a visa to join from India?",
    a: "Indian citizens do not need a visa for Nepal. Carry a valid photo ID such as a passport or Voter ID, along with a few spare copies and passport photos. We help with the Raxaul–Birgunj border crossing on the day you travel.",
  },
  {
    q: "What if a group does not fill up?",
    a: "You only confirm your seat with a deposit once the group is ready, so you are not locked in while a departure is still forming. If a particular date does not come together, we will suggest the next one or talk through a private trip instead.",
  },
];

export default async function NepalGroupTourPage() {
  const packages = await getPackages();
  const related = packages.slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Group Tour Package", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Group Tour Package
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          A group tour is the easy, friendly way to see Nepal — you travel with a small group of
          fellow travellers, share the cost and let us handle the planning. TripSangam Travels runs
          small-group departures from Raxaul to Kathmandu, Pokhara and Muktinath, with help at the
          Raxaul–Birgunj border along the way.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like to join a Nepal group tour departure from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="How our group departures work">
          You join a group that is forming for your chosen package and dates. Once enough travellers
          have signed up and the group is ready, you confirm your seat with a 50% deposit and pay the
          balance later, closer to the trip. We keep groups small, so the trip stays personal while the
          shared cost keeps it at a friendly per-person price.
        </Section>

        <Section title="Where our group tours go">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Kathmandu — temples, old squares and the Boudhanath stupa</li>
            <li>Pokhara — the lakeside town with Phewa Lake and sunrise viewpoints</li>
            <li>Muktinath — the high pilgrimage temple, usually via Pokhara</li>
            <li>Chitwan — the national park and jungle stay in the lowlands</li>
          </ul>
        </Section>

        <Section title="Group tour vs a private trip">
          A group tour gives you better value and the chance to meet fellow travellers along the way,
          which many people enjoy. A private trip gives you full flexibility over your pace, stops and
          dates. If you are not sure which fits you, tell us your plans and we will recommend one — see
          our <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>.
        </Section>

        <Section title="Who joins a group tour">
          Our departures suit all kinds of travellers — solo travellers who would rather not go alone,
          friends travelling together, families, and pilgrims heading for Muktinath. Because the groups
          are small, it stays relaxed and easy to get along, whatever the reason you are travelling.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal but should carry a valid photo ID such as a
          passport or Voter ID, plus a few spare copies and passport photos. Pack light layers — the
          weather varies between the cities, the lakes and the higher temples — and tell us if anyone
          in your party has special needs so we can plan a comfortable pace.
        </Section>

        <Section title="Join a group departure">
          Tell us the package you like, roughly when you want to travel and how many of you there are.
          We will let you know which departures are forming and, once your group is ready, take a 50%
          deposit to confirm your seat — with the balance due later.
          <ContactCTA className="mt-5" message="Hi TripSangam, please tell me about upcoming Nepal group departures from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Nepal group departures"
        intro="Packages we run as small-group departures from Raxaul — ask which dates are forming."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>{" · "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Nepal group tours — common questions" />
    </main>
  );
}
