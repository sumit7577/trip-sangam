import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-trip-plan/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Trip Plan from Raxaul",
  description:
    "Planning a Nepal trip from India? A step-by-step guide to routes, how many days you need, the best time to go, documents to carry, and how to build an itinerary from Raxaul.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I start planning a Nepal trip from India?",
    a: "Start with three things: how many days you have, which places you want to see (Kathmandu, Pokhara, Muktinath, Chitwan, Lumbini), and your travel dates. From Raxaul, we build the route and stops around those answers.",
  },
  {
    q: "How many days should I plan for a Nepal trip?",
    a: "A Kathmandu-and-Pokhara trip is comfortable in 5 days. Add Muktinath and it's closer to 7. A short heritage-only trip to one city can work in 3 days. Longer multi-city pilgrimages run 6-8 days.",
  },
  {
    q: "What's the best time to plan a Nepal trip?",
    a: "September to May is the reliable window — clearer mountain views and steadier road conditions. June to August is the monsoon, when roads and visibility are less predictable.",
  },
  {
    q: "What documents do I need to plan for?",
    a: "Indian citizens don't need a visa or passport for Nepal — a valid photo ID (Aadhaar, Voter ID, or Passport) is enough. Carry a couple of spare copies and passport-size photos.",
  },
  {
    q: "Should I book a fixed package or plan a custom itinerary?",
    a: "A fixed package is simpler if your dates and group size are settled. A custom itinerary works better if you want specific stops, extra days somewhere, or are travelling with a large or mixed-age group.",
  },
];

export default async function NepalTripPlanPage() {
  const packages = await getPackages();
  const related = packages.slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Trip Plan", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          How to Plan a Nepal Trip from Raxaul
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Not sure where to start? Here's a straightforward guide to planning a Nepal trip from India —
          how many days to set aside, when to go, what to carry, and how the route from Raxaul comes
          together, whether you book a ready-made package or want something custom.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like help planning a Nepal trip from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="Step 1 — Decide how many days you have">
          This is the single biggest factor in your plan. A focused Kathmandu-or-Pokhara trip fits in
          3 days. Cover both cities comfortably in 5. Add Muktinath's high-altitude darshan and you're
          looking at 7 days. A grand multi-city pilgrimage — Pokhara, Muktinath, Kathmandu, and further
          on to Janakpur — runs 8 days or more.
        </Section>

        <Section title="Step 2 — Pick your route and stops">
          Most Nepal trips from Raxaul follow one of a few patterns: a single-city heritage trip to
          Kathmandu, a Kathmandu-and-Pokhara combination, a pilgrimage route through Muktinath and the
          valley's Shaktipiths, or a longer journey adding Lumbini, Chitwan or Janakpur. Tell us which
          places matter most to you and we'll shape the stops around that.
        </Section>

        <Section title="Step 3 — Choose the right time to go">
          September to May is the dependable window for mountain views and road conditions — this is
          when most trips are booked. The June-August monsoon brings less predictable roads and hazier
          views, so we generally steer travellers away from it unless dates are fixed.
        </Section>

        <Section title="Step 4 — Sort your documents early">
          Indian citizens don't need a visa or even a passport for Nepal — a valid Aadhaar or Voter ID
          card is enough at the Raxaul–Birgunj border. Still, carry a couple of spare ID photocopies and
          passport-size photos, and pack warm layers if you're travelling between November and February.
        </Section>

        <Section title="Step 5 — Decide: package or custom itinerary?">
          A ready-made package is the simplest route if your dates and group size are already settled —
          browse our{" "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour packages</Link>{" "}
          to compare a few. If you want specific stops, extra days somewhere, or you're travelling as a
          larger or mixed-age group, tell us and we'll build a custom itinerary instead.
        </Section>

        <Section title="Step 6 — Get a quotation">
          Share your travel dates, the number of travellers and the places you'd like to cover, and
          we'll put together a day-by-day plan with a clear, itemised price. See our{" "}
          <Link href="/nepal-tour-package-cost/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour cost guide</Link>{" "}
          for a sense of pricing first.
          <ContactCTA className="mt-5" message="Hi TripSangam, I'd like help planning a Nepal trip from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Popular Nepal tour packages"
        intro="A few starting points — every itinerary can be adjusted to your dates and interests."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul Nepal trip</Link>{" · "}
          <Link href="/nepal-tour-package-cost/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package cost</Link>{" · "}
          <Link href="/raxaul-to-kathmandu-travel/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul to Kathmandu trip</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Planning a Nepal trip — common questions" />
    </main>
  );
}
