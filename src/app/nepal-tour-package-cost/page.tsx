import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-tour-package-cost/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Tour Package Cost from India",
  description:
    "How much does a Nepal tour cost from India? A clear guide to Nepal tour package prices from Raxaul — what's included, what changes the price, and how to plan a trip that fits your budget.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How much does a Nepal tour cost from India?",
    a: "It depends on your route, number of days, the season and how many of you travel together. Short trips start lower and longer multi-city trips cost more. All our prices are per person and vary with dates, season and group size — tell us your plan and we'll share an exact quote.",
  },
  {
    q: "Is it cheaper to travel in a group?",
    a: "Usually yes. A shared group departure spreads the cost of transport and a guide across more travellers, so it tends to be better value than a fully private trip. A private vehicle gives more flexibility but costs more.",
  },
  {
    q: "What is included in the package price?",
    a: "Packages generally cover transport, stays, sightseeing and guide or assistance, but inclusions differ from one package to another. Personal expenses, some entry fees and custom add-ons are usually extra — ask us for the exact inclusions of the package you're considering.",
  },
  {
    q: "Do Indian citizens need a visa or extra documents for Nepal?",
    a: "Indian citizens do not need a visa for Nepal, so there's no visa fee in your budget. Do carry a valid photo ID such as a passport or Voter ID and a few spare copies.",
  },
];

export default async function NepalTourCostPage() {
  const packages = await getPackages();
  const related = packages.slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Tour Package Cost from India", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Tour Package Cost from India
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Wondering how much a Nepal trip from India really costs? There's no single number — the
          price moves with your route, your days and your dates. TripSangam Travels runs small-group
          Nepal tours from Raxaul, across the Raxaul–Birgunj border, and this is a plain guide to what
          you'll pay and how to plan a trip that fits your budget.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, please share a Nepal tour quotation and pricing from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="What a Nepal tour costs from Raxaul">
          There isn't a fixed price for a Nepal tour, because a few things move the cost. The number
          of days matters most — a short 2-day trip is far lighter on the budget than a 7-day journey.
          Season plays a part too, since peak travel dates cost more than off-peak. Whether you take a
          private vehicle or join a small-group departure changes the figure, as does your hotel
          category and which destinations you cover — Kathmandu, Pokhara, Chitwan and Muktinath each
          add their own travel and stay costs.
        </Section>

        <Section title="What's usually included and not included">
          Most packages typically include transport, your stays, sightseeing and a guide or on-trip
          assistance. Things like personal expenses, some entry fees and anything custom you add on are
          usually extra. Inclusions genuinely differ from one package to another, so rather than assume,
          ask us for the exact inclusions of each package and we'll lay it out clearly before you decide.
        </Section>

        <Section title="How to keep the cost down">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Join a small-group departure instead of a fully private trip</li>
            <li>Pick off-peak dates rather than busy holiday periods</li>
            <li>Choose a shorter route, or fewer cities, if you're watching the budget</li>
            <li>Book early so we can lock in better stay and transport rates</li>
          </ul>
        </Section>

        <Section title="Sample trips and starting prices">
          To give you a rough sense, here are real starting prices per person. These vary with dates,
          season and group size, so treat them as a guide and ask us for a quote.
          <ul className="ml-5 mt-3 list-disc space-y-1.5">
            <li>Ayodhya Ram Mandir Yatra — from ₹4,600 (2 days)</li>
            <li>Kathmandu Heritage Tour — from ₹7,599 (3 days)</li>
            <li>Pokhara Himalayan Escape — from ₹7,999 (3 days)</li>
            <li>Himalayan Soul Escape – Chitwan, Pokhara & Ghandruk — from ₹15,600 (5 days)</li>
            <li>Muktinath · Pokhara · Kathmandu Divine Journey — from ₹16,800 (7 days)</li>
          </ul>
        </Section>

        <Section title="Get an exact quote">
          Tell us your travel dates, how many of you are coming and the places you'd like to see, and
          we'll put together a plan with a clear, itemised price. You can also browse our{" "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour packages</Link>{" "}
          to compare options first.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Nepal tour quotation and pricing from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Popular Nepal tour packages"
        intro="A few of our most-booked trips — every one can be tailored to your dates and budget."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul Nepal trip</Link>{" · "}
          <Link href="/nepal-trip-plan/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal trip plan</Link>{" · "}
          <Link href="/raxaul-to-kathmandu-travel/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul to Kathmandu trip</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Nepal tour cost — common questions" />
    </main>
  );
}
