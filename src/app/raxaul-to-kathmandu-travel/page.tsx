import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/raxaul-to-kathmandu-travel/";

export const metadata: Metadata = pageMeta({
  title: "Raxaul to Kathmandu Trip & Travel Package",
  description:
    "Planning a Raxaul to Kathmandu trip? TripSangam arranges pickup at Raxaul, Raxaul–Birgunj border assistance and a private vehicle or tour package to Kathmandu.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "How do I go from Raxaul to Kathmandu?",
    a: "From Raxaul you cross the India–Nepal border at Birgunj and continue to Kathmandu by road. TripSangam meets you at Raxaul, assists with the border crossing and arranges a private vehicle or a group tour onward.",
  },
  {
    q: "Do Indian travellers need a visa or passport for Kathmandu?",
    a: "Indian citizens do not need a visa for Nepal. You should still carry a valid photo identity document such as a passport or Voter ID, and it helps to keep a few spare copies and passport-size photos.",
  },
  {
    q: "How long does the Raxaul to Kathmandu journey take?",
    a: "Road time varies with traffic, road and weather conditions, border formalities and the breaks you take, so we do not fix it to a single number. We plan each trip with comfortable stops rather than a tight schedule.",
  },
  {
    q: "Can TripSangam arrange a private car or taxi from Raxaul to Kathmandu?",
    a: "Yes. You can choose a private vehicle for flexibility or a seat on a group tour. Share your dates and group size and we will recommend the better option and send a quotation.",
  },
  {
    q: "Where will I be picked up in Raxaul?",
    a: "We can pick you up from Raxaul railway station or a point near the Raxaul–Birgunj border. Tell us your arrival train or time and we will be there.",
  },
];

export default async function RaxaulToKathmanduPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /kathmandu/i.test(`${p.name} ${p.location}`) || p.category === "Cultural")
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Raxaul to Kathmandu Trip", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Raxaul to Kathmandu Trip &amp; Travel Packages
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Planning a Raxaul to Kathmandu trip? TripSangam Travels arranges the complete
          journey from Raxaul and the Raxaul–Birgunj border to Kathmandu — with pickup, border
          assistance and a choice of private vehicle or group tour. Here is what to know before you go.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a quotation for Raxaul to Kathmandu travel." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="How can I travel from Raxaul to Kathmandu?">
          From Raxaul, you cross the India–Nepal border at Birgunj and continue to Kathmandu by road.
          TripSangam meets you at Raxaul, helps with the border formalities and arranges either a
          private vehicle or a seat on a group tour. The road climbs through the hills into the
          Kathmandu Valley, and the exact travel time depends on traffic, road and weather conditions,
          border procedures and your stops — so we plan with comfortable breaks rather than a fixed clock.
        </Section>

        <Section title="Crossing the Raxaul–Birgunj border">
          Raxaul sits right beside Birgunj, the main entry point into Nepal from Bihar. Indian citizens
          do not need a visa to enter Nepal, but you should carry a valid photo ID such as a passport or
          Voter ID. Our team guides you through the crossing so the paperwork stays simple.
        </Section>

        <Section title="The Raxaul to Kathmandu road route">
          The journey from Birgunj heads north towards the Kathmandu Valley through Nepal's hill country.
          We choose the route and stops based on the day's road conditions and what suits your group —
          families and senior travellers usually prefer a relaxed pace with tea and meal breaks.
        </Section>

        <Section title="Pickup options from Raxaul">
          We can pick you up from Raxaul railway station or a point near the Raxaul–Birgunj border,
          whichever is convenient. Just tell us your arrival train or time.
        </Section>

        <Section title="Private vehicle or tour package?">
          A private vehicle lets you set your own pace and stops. A Kathmandu tour package is easier if
          you would rather have sightseeing and stays arranged for you. We offer both — share your dates
          and group size and we will recommend the better fit.
        </Section>

        <Section title="Documents Indian travellers should carry">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>A valid photo ID — passport or Voter ID</li>
            <li>A few spare ID copies and passport-size photos</li>
            <li>Any personal medicines you need</li>
            <li>Warm layers if you are travelling in winter</li>
          </ul>
        </Section>

        <Section title="How many days do you need in Kathmandu?">
          Even a short trip lets you see the main temples and old city, while two to three days makes for
          a relaxed visit. If you would like to add Pokhara, Muktinath or Chitwan, we will extend the plan.
        </Section>

        <Section title="What to see in Kathmandu">
          Popular places include Pashupatinath Temple, Boudhanath Stupa, Swayambhunath (the Monkey
          Temple), Kathmandu Durbar Square and the lanes of Thamel. We can build sightseeing around the
          places that matter most to you.
        </Section>

        <Section title="How to request a quotation">
          Tell us your travel dates, the number of travellers and the places you would like to cover, and
          we will share a suitable plan with a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Raxaul to Kathmandu quotation." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Kathmandu tour packages"
        intro="Browse our Kathmandu and Nepal itineraries, or contact us to customise one from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Raxaul to Kathmandu — common questions" />
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
