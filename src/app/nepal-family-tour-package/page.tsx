import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-family-tour-package/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Family Tour Package",
  description:
    "Family tour packages to Nepal from Raxaul — a gentle, well-paced trip across Kathmandu, Pokhara and Chitwan that suits children and senior citizens, with comfortable vehicles and border assistance.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "Is a Nepal trip suitable for children and senior citizens?",
    a: "Yes. We plan a gentle, well-paced family route with comfortable vehicles, regular rest stops and easy sightseeing rather than hard treks, so it works for children and senior travellers alike.",
  },
  {
    q: "Which places do you cover on a family tour?",
    a: "A typical family trip combines Kathmandu, Pokhara and Chitwan — temples and squares, lakeside boating and easy viewpoints, and a jungle safari. Tell us your days and we will shape the route to suit your group.",
  },
  {
    q: "What documents do Indian families need for Nepal?",
    a: "Indian citizens do not need a visa for Nepal, but each traveller should carry a valid photo ID such as a passport or Voter ID, along with a few spare copies and photos. For children, carry a school ID or birth certificate.",
  },
  {
    q: "How long does the travel take?",
    a: "We start from Raxaul, assist at the Raxaul–Birgunj border and arrange the journey onward. Travel time varies with the route, traffic, road and weather conditions and your stops, so we build in comfortable breaks.",
  },
];

export default async function NepalFamilyTourPage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /chitwan|pokhara|kathmandu|heritage/i.test(`${p.name} ${p.location}`))
    .concat(
      packages.filter((p) => !/chitwan|pokhara|kathmandu|heritage/i.test(`${p.name} ${p.location}`)),
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Family Tour Package", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Family Tour Package
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Nepal is an easy, friendly place to travel with the whole family. TripSangam Travels plans
          gentle, well-paced family trips that start from Raxaul, with help at the Raxaul–Birgunj
          border and comfortable vehicles throughout. The pace suits children and senior citizens —
          plenty to see, nothing rushed.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a family tour package to Nepal from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="Why Nepal suits families">
          Nepal packs a lot into a short, relaxed trip — lakes and gentle viewpoints, easygoing
          temples and squares, and a wildlife park where everyone enjoys the safari. It is close to
          Raxaul, warm and welcoming, and the sights are spread out enough to keep children
          interested without tiring out grandparents. A few unhurried days here go a long way.
        </Section>

        <Section title="A comfortable, well-paced trip">
          We plan family trips around a gentle pace rather than a packed schedule. Days start at a
          reasonable hour, the driving is broken up with rest stops, and there is room to slow down
          when little ones or elders need a break. You travel in a comfortable, well-kept vehicle,
          and we keep the daily route sensible so nobody is worn out by the time you reach the next
          place.
        </Section>

        <Section title="Family-friendly things to do">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Pokhara lake boating and easy, low-effort viewpoints</li>
            <li>Chitwan jungle safari and wildlife spotting</li>
            <li>Kathmandu temples and old squares to wander</li>
            <li>Short, easy walks rather than hard treks</li>
          </ul>
        </Section>

        <Section title="Travelling with children and senior citizens">
          The trip is built for comfort. We keep sightseeing easy and on flat, walkable ground, time
          the day so meals and rest are not skipped, and avoid long unbroken drives. Hotels and
          stops are chosen to be convenient, and the itinerary leaves space if anyone wants a quieter
          afternoon. Tell us the ages in your group and any needs, and we will adjust the plan.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal but should carry a valid photo ID such as a
          passport or Voter ID, plus a few spare copies and photos for each traveller. For children,
          a school ID or birth certificate is handy. Pack light layers, comfortable walking shoes and
          any regular medicines, especially for elders.
        </Section>

        <Section title="Plan a family trip">
          Tell us your travel dates, the number of travellers and the ages in your group, and whether
          you would like to add Kathmandu, Pokhara or Chitwan. We will share a gentle, well-paced plan
          and a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a family tour package to Nepal from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Family-friendly Nepal packages"
        intro="Easy, well-paced itineraries we can shape around children and senior travellers from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/chitwan-jungle-safari-package/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Chitwan jungle safari package</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Family trips to Nepal — common questions" />
    </main>
  );
}
