import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GuideArticle } from "@/components/seo/GuideArticle";
import { Section } from "@/components/seo/Prose";
import type { Faq } from "@/components/seo/FaqSection";

const SLUG = "raxaul-birgunj-border-guide";
const TITLE = "Raxaul–Birgunj Border Travel Guide";
const DESCRIPTION =
  "How to cross the India–Nepal border at Raxaul–Birgunj — what to carry, vehicle options, timing tips and how TripSangam helps you cross smoothly.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: `/guides/${SLUG}/` });

const faqs: Faq[] = [
  { q: "Where is the Raxaul–Birgunj border?", a: "Raxaul is a town in East Champaran, Bihar, that adjoins Birgunj in Nepal. It is the main road gateway into Nepal from Bihar." },
  { q: "Do Indians need a visa to cross at Birgunj?", a: "No. Indian citizens do not need a visa for Nepal, but should carry a valid photo ID such as a passport or Voter ID and keep spare copies." },
  { q: "Can I take a vehicle across the border?", a: "There are options for taking vehicles across, but most travellers continue in a Nepal-side vehicle. TripSangam arranges transport onward from Raxaul so you don't have to worry about it." },
  { q: "How does TripSangam help at the border?", a: "We meet you at Raxaul — at the railway station or near the border — guide you through the crossing formalities, and arrange your transport into Nepal." },
];

export default function Page() {
  return (
    <GuideArticle
      slug={SLUG}
      title={TITLE}
      description={DESCRIPTION}
      intro="The Raxaul–Birgunj crossing is the busiest road gateway into Nepal from Bihar. It is straightforward once you know what to expect — here is a simple walkthrough."
      faqs={faqs}
    >
      <Section title="Where is the Raxaul–Birgunj border?">
        Raxaul sits in East Champaran, Bihar, right beside Birgunj on the Nepal side. For travellers from
        Bihar and nearby, this is the most convenient road entry point into Nepal, and the starting
        point for most TripSangam tours.
      </Section>

      <Section title="How does the crossing work?">
        At the border you pass through the usual immigration and customs formalities. Indian citizens do
        not need a visa, but you should carry a valid photo ID and keep it handy. Keep your bags
        accessible and your documents together to make the crossing quick.
      </Section>

      <Section title="What to carry at the border">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>A valid photo ID — passport or Voter ID</li>
          <li>A few photocopies of your ID and some passport photos</li>
          <li>Small Indian notes and, ideally, some Nepali rupees</li>
          <li>Any permits relevant to your onward travel (we advise on these)</li>
        </ul>
      </Section>

      <Section title="Vehicle and transport options">
        Most travellers cross on foot or by short transfer and then continue in a Nepal-side vehicle.
        TripSangam arranges your transport onward from Raxaul — a private vehicle or a group tour — so
        you only need to reach Raxaul.
      </Section>

      <Section title="Timing and practical tips">
        Plan to cross during daytime hours and allow some buffer at busy times. Keep documents within
        reach, carry water, and let us know your arrival train or time so we can be there to meet you.
      </Section>

      <Section title="How TripSangam helps you cross">
        We meet you at Raxaul, guide you through the crossing into Nepal and handle the transport
        onward. It turns the most uncertain part of the trip into the easiest.
      </Section>
    </GuideArticle>
  );
}
