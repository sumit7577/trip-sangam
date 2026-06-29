import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/nepal-honeymoon-package/";

export const metadata: Metadata = pageMeta({
  title: "Nepal Honeymoon Package",
  description:
    "A romantic Nepal honeymoon from Raxaul — lakeside Pokhara, Sarangkot sunrise and Himalayan views, with a private vehicle, comfortable stays and Raxaul–Birgunj border assistance.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "Is Nepal a good honeymoon destination?",
    a: "Many couples enjoy Nepal for a quiet, scenic honeymoon. Pokhara's lake, the sunrise viewpoints and the Himalayan backdrop make for relaxed, romantic days, and it is easy to reach from Raxaul through the Raxaul–Birgunj border.",
  },
  {
    q: "How many days do we need for a Nepal honeymoon?",
    a: "It depends on how much you want to see. A short trip can focus on Pokhara alone, while a longer one can add Kathmandu or a hill viewpoint. Share your dates and we will suggest a comfortable pace that is not rushed.",
  },
  {
    q: "Do Indian couples need a visa or passport for Nepal?",
    a: "Indian citizens do not need a visa for Nepal, but each traveller should carry a valid photo ID such as a passport or Voter ID, along with a few spare copies and photos. We help with the border formalities at Raxaul–Birgunj.",
  },
  {
    q: "Can the honeymoon trip be private and customised?",
    a: "Yes. We can arrange a private vehicle so the two of you travel at your own pace, and we plan stays and stops around what you want. Tell us your dates and ideas and we will share a plan and quotation.",
  },
];

export default async function NepalHoneymoonPackagePage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /pokhara/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/pokhara/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Nepal Honeymoon Package", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Nepal Honeymoon Package
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          For a calm, romantic honeymoon, Nepal is hard to beat — a lake to sit beside, sunrise over
          the hills and the Himalaya on a clear day. TripSangam Travels plans honeymoon trips that
          start from Raxaul, with help at the Raxaul–Birgunj border and a private vehicle so the two
          of you travel at your own pace.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Nepal honeymoon package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="Why Nepal for a honeymoon">
          Nepal suits couples who want scenery and quiet over a packed schedule. The lakeside in
          Pokhara is easy and unhurried, the viewpoints reward an early start, and a Nepali-owned
          team that knows the route from Raxaul keeps the practical side simple. It is close enough
          to plan without a long flight, yet it feels like a proper change of scene.
        </Section>

        <Section title="Romantic Pokhara">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Boating together on Phewa Lake</li>
            <li>Quiet lakeside evenings and an easy stroll along the water</li>
            <li>A Sarangkot sunrise with the hills lighting up</li>
            <li>The World Peace Pagoda looking out over the lake</li>
          </ul>
        </Section>

        <Section title="Add Kathmandu or a mountain view">
          If you have the days, Pokhara pairs nicely with Kathmandu for temples, old streets and a
          little shopping, or with a hill viewpoint for the bigger Himalayan panoramas. You can keep
          the trip lakeside and slow, or split it — see our{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" "}
          and tell us how many days you have.
        </Section>

        <Section title="A private vehicle and an easy pace">
          A honeymoon is better unhurried. With a private vehicle the two of you decide when to stop,
          how long to linger and what to skip, instead of keeping to a group's clock. We plan
          comfortable breaks along the way; travel time depends on the route, traffic, road and
          weather conditions and your stops, so we leave room and do not rush.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal, but both of you should carry a valid photo ID
          such as a passport or Voter ID, plus a few spare copies and photos. Pack light layers —
          days are mild, but mornings at the viewpoints can be cool. Carry any regular medicines you
          need, and tell us early if you would like a particular kind of stay so we can plan ahead.
        </Section>

        <Section title="Plan your honeymoon">
          Tell us your travel dates, how many days you have and whether you want to add Kathmandu or a
          mountain viewpoint. We will put together a comfortable plan and a quotation for the two of you.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Nepal honeymoon package quotation from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Romantic Nepal packages"
        intro="Lakeside and mountain itineraries we can shape into a honeymoon from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/nepal-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal tour package from Raxaul</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Nepal honeymoon — common questions" />
    </main>
  );
}
