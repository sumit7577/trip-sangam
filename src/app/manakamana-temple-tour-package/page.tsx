import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/manakamana-temple-tour-package/";

export const metadata: Metadata = pageMeta({
  title: "Manakamana Temple Tour Package",
  description:
    "Manakamana Temple darshan by cable car, included on TripSangam's Kathmandu–Pokhara routes from Raxaul. Cable car details, what to expect, and how to add it to your itinerary.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "What is Manakamana Temple known for?",
    a: "Manakamana is a Hindu temple dedicated to the goddess Bhagwati, believed to grant the wishes of devotees who visit with a sincere heart. It's one of Nepal's most-visited Shaktipiths and a regular stop on the Kathmandu–Pokhara road route.",
  },
  {
    q: "How do I reach Manakamana?",
    a: "Manakamana sits on a hilltop and is reached by a cable car from the base station, which most travellers use on the Kathmandu–Pokhara road route. TripSangam includes this stop on relevant itineraries, so you don't need to arrange it separately.",
  },
  {
    q: "Is the Manakamana cable car included in Nepal tour packages?",
    a: "Yes — our Kathmandu–Pokhara routes that pass Manakamana include the two-way cable car ticket as part of the package. Check the inclusions on the specific itinerary you're booking.",
  },
  {
    q: "Can I visit Manakamana as a standalone trip from Raxaul?",
    a: "Most travellers visit Manakamana as a stop between Kathmandu and Pokhara rather than a separate trip, since it sits directly on that route. Tell us your plan and we'll build the darshan in.",
  },
];

export default async function ManakamanaTourPage() {
  const packages = await getPackages();
  const related = packages.slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Manakamana Temple Tour Package", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Manakamana Temple Tour Package
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Manakamana, one of Nepal's most-visited Shaktipiths, sits on a hilltop reached by cable car
          along the Kathmandu–Pokhara road. TripSangam includes Manakamana darshan on our Kathmandu and
          Pokhara itineraries from Raxaul, with the two-way cable car ticket built in.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Nepal itinerary that includes Manakamana darshan." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="About Manakamana Temple">
          Manakamana is dedicated to the goddess Bhagwati, and devotees travel from across Nepal and
          India believing she grants sincere wishes. The temple sits on a ridge overlooking the
          Trishuli and Marshyangdi valleys, with wide Himalayan views on a clear day.
        </Section>

        <Section title="The Manakamana cable car">
          A cable car connects the base station, on the Kathmandu–Pokhara highway, to the temple on the
          hilltop — a short, scenic ride that has largely replaced the older uphill walk. Our packages
          that route through Manakamana include the two-way cable car ticket.
        </Section>

        <Section title="How Manakamana fits into your itinerary">
          Because Manakamana sits directly on the Kathmandu–Pokhara road, it's almost always visited as
          a stop between the two cities rather than a separate trip. See our{" "}
          <Link href="/packages/muktinath-pokhara-kathmandu-divine-journey/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Muktinath · Pokhara · Kathmandu Divine Journey</Link>{" "}
          or{" "}
          <Link href="/packages/kathmandu-pokhara-tour/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Kathmandu · Pokhara Tour</Link>{" "}
          for itineraries that include it.
        </Section>

        <Section title="How to book">
          Tell us your travel dates and the cities you'd like to cover, and we'll build Manakamana
          darshan into the route with a clear quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, I'd like a Nepal itinerary that includes Manakamana darshan." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Nepal tour packages featuring Manakamana"
        intro="Kathmandu–Pokhara itineraries that include Manakamana darshan and the cable car."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/kathmandu-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Kathmandu tour package from Raxaul</Link>{" · "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-pilgrimage-tour-from-india/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal pilgrimage tour from India</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Manakamana Temple — common questions" />
    </main>
  );
}
