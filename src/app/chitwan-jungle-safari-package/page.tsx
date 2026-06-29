import type { Metadata } from "next";
import Link from "next/link";
import { getPackages } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { Section } from "@/components/seo/Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { RelatedPackages } from "@/components/packages/RelatedPackages";

const PATH = "/chitwan-jungle-safari-package/";

export const metadata: Metadata = pageMeta({
  title: "Chitwan Jungle Safari Package",
  description:
    "Chitwan National Park jungle safari from Raxaul — jeep safari, one-horned rhinos, birdlife and Tharu culture in Nepal's Terai, with border assistance and easy add-ons to Pokhara.",
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: "What wildlife might I see on a Chitwan safari?",
    a: "Chitwan is best known for the one-horned rhino, and the grasslands and riverbanks are also home to deer, monkeys, crocodiles and a lot of birdlife. Wildlife is wild, so nothing can be guaranteed — you may see plenty on one drive and less on another. Early mornings and a patient naturalist usually give you the best chance.",
  },
  {
    q: "How do I reach Chitwan from Raxaul?",
    a: "From Raxaul you cross into Nepal at the Raxaul–Birgunj border and continue to the Chitwan area by road. We meet you at Raxaul, help with the crossing and arrange the journey onward. Travel time varies with the route, traffic, road and weather conditions and your stops, so we plan with comfortable breaks.",
  },
  {
    q: "When is a good time to visit Chitwan?",
    a: "The cooler, drier months are generally the most comfortable for safari and easier wildlife viewing, while the monsoon brings lush green forest and fewer visitors. Tell us your dates and we will set realistic expectations for the season you choose.",
  },
  {
    q: "Can I combine Chitwan with Pokhara or Kathmandu?",
    a: "Yes. Chitwan sits between the Terai and the hills, so it pairs naturally with Pokhara and Kathmandu. Our Himalayan Soul Escape package already includes a Chitwan stop, and we can also build a custom route around your days.",
  },
];

export default async function ChitwanSafariPackagePage() {
  const packages = await getPackages();
  const related = packages
    .filter((p) => /chitwan|himalayan soul|ghandruk/i.test(`${p.name} ${p.location}`))
    .concat(packages.filter((p) => !/chitwan|himalayan soul|ghandruk/i.test(`${p.name} ${p.location}`)))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <header className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Chitwan Jungle Safari Package", path: PATH }]} />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Chitwan Jungle Safari Package
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
          Chitwan is Nepal's Terai at its wildest — sal forest, tall grassland and the slow Rapti
          river, with the famous one-horned rhino somewhere in between. TripSangam Travels plans
          Chitwan jungle safari trips that start from Raxaul, with help at the Raxaul–Birgunj border
          and easy add-ons to Pokhara or Kathmandu.
        </p>
        <ContactCTA className="mt-6" message="Hi TripSangam, I'd like a Chitwan jungle safari package from Raxaul." />
      </header>

      <article className="mx-auto mt-12 max-w-3xl space-y-10 px-5 md:px-8">
        <Section title="About Chitwan National Park">
          Chitwan National Park is a UNESCO World Heritage site in Nepal's low-lying Terai, a belt of
          sub-tropical forest and grassland very different from the Himalayan hills. It is best known
          for the greater one-horned rhino, and its mix of riverine forest, marshes and open
          grassland supports a rich variety of wildlife. For travellers from Raxaul it is one of the
          closest big nature experiences across the border.
        </Section>

        <Section title="Safari and things to do">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Jeep safari deep into the park's forest and grassland tracks</li>
            <li>A canoe ride on the Rapti river, watching the banks as you drift</li>
            <li>Looking out for rhinos, deer and Chitwan's birdlife — wildlife you may see, never guaranteed</li>
            <li>A visit to the elephant breeding centre near the park</li>
            <li>A Tharu cultural evening with the local community's music and stick dance</li>
          </ul>
        </Section>

        <Section title="How to reach Chitwan from Raxaul">
          From Raxaul you cross into Nepal at the Raxaul–Birgunj border and continue to the Chitwan
          area by road. We meet you at Raxaul, assist with the crossing and arrange the journey
          onward in a private vehicle or as part of a group tour. Travel time depends on the route,
          traffic, road and weather conditions and your stops, so we keep the plan relaxed with
          breaks along the way.
        </Section>

        <Section title="Combine Chitwan with Pokhara or Kathmandu">
          Chitwan sits on the way between the Terai and the hills, so it slots neatly into a longer
          Nepal trip. Our Himalayan Soul Escape package already includes a Chitwan stop alongside the
          mountains, and Chitwan also pairs well with a few relaxed days in Pokhara — see our{" "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>.
          Share your dates and we will suggest a route that fits your days.
        </Section>

        <Section title="Documents and good-to-know">
          Indian citizens do not need a visa for Nepal but should carry a valid photo ID such as a
          passport or Voter ID, plus a few spare copies and photos. For the jungle, pack neutral,
          comfortable clothing, closed shoes, a hat and insect repellent, and bring binoculars if you
          have them. Mornings can be cool and afternoons warm, so light layers help.
        </Section>

        <Section title="How to book">
          Tell us your travel dates, the number of travellers and whether you want to add Pokhara or
          Kathmandu to the trip. We will share a plan and a quotation.
          <ContactCTA className="mt-5" message="Hi TripSangam, please share a Chitwan jungle safari quotation from Raxaul." />
        </Section>
      </article>

      <RelatedPackages
        packages={related}
        heading="Chitwan & Nepal packages"
        intro="Trips that feature Chitwan, or that we can customise from Raxaul."
      />

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-sm text-muted">
          See also:{" "}
          <Link href="/nepal-tour-packages/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">All Nepal tour packages</Link>{" · "}
          <Link href="/pokhara-tour-package-from-raxaul/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Pokhara tour package from Raxaul</Link>{" · "}
          <Link href="/nepal-family-tour-package/" className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">Nepal family tour package</Link>
        </p>
      </div>

      <FaqSection faqs={faqs} heading="Chitwan safari — common questions" />
    </main>
  );
}
