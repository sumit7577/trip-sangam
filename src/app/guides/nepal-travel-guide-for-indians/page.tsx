import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GuideArticle } from "@/components/seo/GuideArticle";
import { Section } from "@/components/seo/Prose";
import type { Faq } from "@/components/seo/FaqSection";

const SLUG = "nepal-travel-guide-for-indians";
const TITLE = "Nepal Travel Guide for Indian Citizens";
const DESCRIPTION =
  "A practical Nepal travel guide for Indian citizens — visa rules, the documents you need, money tips and how to reach Nepal from India via Raxaul.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: `/guides/${SLUG}/` });

const faqs: Faq[] = [
  { q: "Do Indian citizens need a visa for Nepal?", a: "No. Indian citizens do not need a visa to enter Nepal. You should still carry a valid photo identity document and keep spare copies." },
  { q: "Which ID is best for an Indian travelling to Nepal?", a: "A passport or Voter ID is the most reliable. A driving licence is generally not accepted as the main identity document for the border, so carry a passport or Voter ID to be safe." },
  { q: "Can I use Indian rupees in Nepal?", a: "Smaller Indian notes such as ₹100 and ₹200 are commonly accepted, but rules on higher denominations can change, so carry small notes and exchange for Nepali rupees as needed. Cards and ATMs work in cities." },
  { q: "How do Indians usually reach Nepal?", a: "Either by road through a border such as Raxaul–Birgunj, or by air to Kathmandu. From Bihar, the Raxaul–Birgunj crossing is the main road gateway." },
];

export default function Page() {
  return (
    <GuideArticle
      slug={SLUG}
      title={TITLE}
      description={DESCRIPTION}
      intro="Travelling to Nepal from India is refreshingly simple — no visa, an open border and a short hop from Bihar through Raxaul. Here is what to know before you go."
      faqs={faqs}
    >
      <Section title="Do Indian citizens need a visa for Nepal?">
        No. Indian citizens do not need a visa to enter Nepal. You can cross the open border or fly in
        freely. What you do need is a valid photo identity document and a little preparation.
      </Section>

      <Section title="What documents should Indian travellers carry?">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>A valid photo ID — a <strong className="text-ink dark:text-white">passport or Voter ID</strong> is best</li>
          <li>A few spare photocopies of your ID</li>
          <li>A couple of passport-size photographs</li>
          <li>For children, a school ID or birth certificate plus a parent's ID</li>
        </ul>
        A driving licence is usually not accepted as the sole identity document at the border, so plan
        around a passport or Voter ID.
      </Section>

      <Section title="What money should I carry?">
        Smaller Indian notes such as ₹100 and ₹200 are commonly used near the border and in many places,
        but rules on higher denominations can change — so carry small notes and exchange some Nepali
        rupees for convenience. Cards and ATMs are available in cities like Kathmandu and Pokhara.
      </Section>

      <Section title="How do I reach Nepal from India?">
        From Bihar and nearby, the easiest way is by road through the Raxaul–Birgunj border. You can also
        fly into Kathmandu. If you are starting from Raxaul, TripSangam meets you there, helps with the
        crossing and arranges transport onward — see our Raxaul–Birgunj border guide for the details.
      </Section>

      <Section title="Phones and connectivity">
        Local SIM cards (such as Ncell and NTC) are easy to buy in Nepal and are cheaper than Indian
        roaming. Network can be patchy in remote mountain areas like the route to Muktinath.
      </Section>

      <Section title="Health and altitude basics">
        For high-altitude destinations such as Muktinath, ascend gradually, stay hydrated and rest if you
        feel unwell. Carry any personal medicines, and travellers with health concerns should consult
        their doctor before a high-altitude trip.
      </Section>

      <Section title="What to pack">
        Light layers for the cities, warmer clothing for the hills and mountains, comfortable shoes, your
        ID and copies, basic medicines, and a power bank. Pack heavier woollens if you are heading to
        Muktinath or travelling in winter.
      </Section>
    </GuideArticle>
  );
}
