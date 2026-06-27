import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-tour-packages/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Tour Packages | Kathmandu, Pokhara & Muktinath",
  description:
    "Nepal tour packages for families, groups and pilgrims — Kathmandu, Pokhara, Muktinath, Chitwan and Lumbini. Planned and guided by TripSangam Travels, starting from Raxaul.",
  path: PATH,
});

const destinations = [
  { name: "Kathmandu", note: "Temples, Durbar Squares and the old city — Pashupatinath, Boudhanath and Swayambhunath." },
  { name: "Pokhara", note: "Lakeside calm with Phewa Lake boating and Himalayan views." },
  { name: "Muktinath", note: "A revered pilgrimage site in the mountains, sacred to Hindus and Buddhists." },
  { name: "Chitwan", note: "Jungle safaris and wildlife in the Terai lowlands." },
  { name: "Lumbini", note: "The birthplace of the Buddha and an important pilgrimage destination." },
  { name: "Nagarkot", note: "A hill viewpoint near Kathmandu known for sunrise over the ranges." },
];

const faqs: Faq[] = [
  {
    q: "What is included in a Nepal tour package?",
    a: "Inclusions vary by package. Each package page lists its own inclusions and exclusions — typically transport, sightseeing and stays as described there. Please check the individual package for exact details before booking.",
  },
  {
    q: "Which Nepal tour package is best for families and senior citizens?",
    a: "We plan family and pilgrimage tours at a relaxed pace with comfortable vehicles and stays. Tell us who is travelling and we will suggest a route that suits everyone.",
  },
  {
    q: "Do your Nepal tours start from India?",
    a: "Yes. Our tours start from Raxaul in Bihar and cross into Nepal at the Raxaul–Birgunj border. We assist with the crossing and arrange transport onward.",
  },
  {
    q: "How do I book a Nepal tour package?",
    a: "Pick a package or tell us your destinations and dates, and we will share an itinerary and quotation. Once confirmed, we arrange your pickup from Raxaul and the tour.",
  },
];

export default async function NepalTourPackagesPage() {
  const packages = await getPackages();

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Tour Packages", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Tour Packages for Families, Groups and Pilgrims
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Explore Nepal with TripSangam Travels. Our tour packages cover Kathmandu, Pokhara, Muktinath,
          Chitwan and Lumbini — for pilgrims, families and groups alike. Every trip is planned to start
          from Raxaul, with border assistance and a choice of private or group travel.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like help choosing a Nepal tour package." />
      </header>

      <section className="mx-auto mt-12 max-w-5xl px-5 md:px-8">
        <h2 className="font-serif text-2xl tracking-tight md:text-3xl">Popular Nepal destinations</h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <div key={d.name} className="rounded-3xl border border-line bg-white p-5 dark:bg-white/5">
              <p className="font-serif text-lg text-ink dark:text-white">{d.name}</p>
              <p className="mt-1 text-sm text-muted">{d.note}</p>
            </div>
          ))}
        </div>
      </section>

      <RelatedPackages
        packages={packages}
        heading="Our Nepal tour packages"
        intro="Each itinerary lists its own duration, highlights, inclusions and exclusions. Open a package for full details, or contact us to customise one."
      />

      <section className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="rounded-3xl border border-line bg-white p-6 dark:bg-white/5">
          <h2 className="font-serif text-2xl tracking-tight">Every tour starts from Raxaul</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            All our Nepal tours begin at Raxaul and the Raxaul–Birgunj border, so travellers from Bihar
            and nearby can start close to home. Read more about{" "}
            <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour packages from Raxaul</Link>{" "}
            and{" "}
            <Link href="/raxaul-to-kathmandu-travel/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Raxaul to Kathmandu travel</Link>, or{" "}
            <Link href="/packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">browse and filter all trips</Link>.
          </p>
        </div>
      </section>

      <FaqSection faqs={faqs} heading="Nepal tour packages — common questions" />
    </main>
  );
}
