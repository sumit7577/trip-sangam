import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-tour-package-from-raxaul/";

export const metadata: Metadata = pageMeta({
  title: "Raxaul Nepal Trip & Tour Package",
  description:
    "Planning a Raxaul Nepal trip or tour? TripSangam Travels arranges private and group tours to Kathmandu, Pokhara, Muktinath and Chitwan, with Raxaul–Birgunj border assistance.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "Where does a Nepal tour from Raxaul start?",
    a: "Tours start at Raxaul and the Raxaul–Birgunj border. We meet you in Raxaul, help with the crossing into Nepal and begin the journey from there.",
  },
  {
    q: "What types of Nepal packages can I book from Raxaul?",
    a: "We arrange pilgrimage and darshan tours, family holidays, group tours and leisure trips. Popular routes cover Kathmandu, Pokhara, Muktinath, Chitwan and Lumbini.",
  },
  {
    q: "Can I customise a Nepal tour from Raxaul?",
    a: "Yes. Tell us your destinations, dates and group size and we will put together an itinerary to match, as a private trip or a group departure.",
  },
  {
    q: "Do you arrange family and pilgrimage tours?",
    a: "Yes. We plan family and pilgrimage tours at a comfortable pace and can arrange suitable vehicles and stays, including for senior travellers.",
  },
  {
    q: "How do I book a Nepal tour package from Raxaul?",
    a: "Share your travel dates and number of travellers, and we will suggest an itinerary with a quotation. Once you are happy, we confirm the trip and arrange your pickup from Raxaul.",
  },
];

export default async function NepalFromRaxaulPage() {
  const packages = await getPackages();
  const related = packages.slice(0, 6);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Raxaul Nepal Trip", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Raxaul Nepal Trip &amp; Tour Packages
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Planning a Raxaul Nepal trip? TripSangam Travels designs Nepal tours that start from Raxaul, on
          the India–Nepal border in Bihar. Choose your destinations and dates, travel by private vehicle
          or join a group, and let us handle the Raxaul–Birgunj crossing and everything onward — for
          pilgrimage, family and holiday trips alike.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Nepal tour package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="Where does your Nepal tour begin?">
          Every tour begins at Raxaul and the Raxaul–Birgunj border. We meet you in Raxaul — at the
          railway station or near the border — help with the crossing into Nepal, and start the journey
          from there. You only need to reach Raxaul; we take care of the rest.
        </Section>

        <Section title="Which Nepal destinations can you cover from Raxaul?">
          From Raxaul you can reach Kathmandu, Pokhara, Muktinath, Chitwan, Lumbini and Nagarkot. These
          can be combined into a single trip — for example Kathmandu with Pokhara, or a Muktinath
          pilgrimage that also takes in Pokhara and Kathmandu. Tell us your interests and we will build
          a route that fits your days.
        </Section>

        <Section title="Types of Nepal tours we arrange">
          <ul className="ml-5 list-disc space-y-1.5">
            <li><strong className="text-ink dark:text-white">Pilgrimage &amp; darshan</strong> — temples and sacred sites such as Pashupatinath and Muktinath.</li>
            <li><strong className="text-ink dark:text-white">Family holidays</strong> — a relaxed pace with sightseeing the whole family enjoys.</li>
            <li><strong className="text-ink dark:text-white">Group tours</strong> — shared departures that bring the per-person cost down.</li>
            <li><strong className="text-ink dark:text-white">Leisure trips</strong> — lakes, hills and viewpoints like Pokhara and Nagarkot.</li>
          </ul>
        </Section>

        <Section title="Private vehicle or group tour?">
          A private vehicle gives you flexibility over your pace and stops. A group tour is a friendly,
          value-for-money way to travel with a set itinerary. We offer both — just share your group size
          and dates and we will suggest the better option.
        </Section>

        <Section title="How long is a Nepal tour from Raxaul?">
          It depends on the destinations. A Kathmandu-focused trip can be shorter, while adding Pokhara,
          Muktinath or Chitwan needs more days. Share your available dates and we will recommend a
          comfortable length rather than rushing the route.
        </Section>

        <Section title="Raxaul–Birgunj border assistance">
          The Raxaul–Birgunj crossing is the main gateway into Nepal from Bihar. Indian citizens do not
          need a visa, but should carry a valid photo ID such as a passport or Voter ID. We guide you
          through the formalities so the start of your trip is hassle-free.
        </Section>

        <Section title="How booking works">
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>Tell us your travel dates, number of travellers and preferred destinations.</li>
            <li>We suggest a suitable itinerary and share a quotation.</li>
            <li>You confirm the trip to reserve your place.</li>
            <li>We arrange your pickup from Raxaul and the tour onward.</li>
          </ol>
          <ContactCTA className="mt-5" message="Hi TripSangam, please help me plan a Nepal tour from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Compare our Nepal tour packages"
        intro="A selection of itineraries you can book or customise from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/raxaul-to-kathmandu-travel/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul to Kathmandu travel</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Nepal tour from Raxaul — common questions" />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl tracking-tight md:text-3xl">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-muted md:text-base">{children}</div>
    </section>
  );
}
