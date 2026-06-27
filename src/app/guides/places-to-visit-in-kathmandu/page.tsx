import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GuideArticle } from "@/components/seo/GuideArticle";
import { Section } from "@/components/seo/Prose";
import type { Faq } from "@/components/seo/FaqSection";

const SLUG = "places-to-visit-in-kathmandu";
const TITLE = "Top Places to Visit in Kathmandu";
const DESCRIPTION =
  "The best places to visit in Kathmandu — Pashupatinath, Boudhanath, Swayambhunath, the Durbar Squares and Thamel — and how to see them on a tour from Raxaul.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: `/guides/${SLUG}/` });

const faqs: Faq[] = [
  { q: "What are the must-see places in Kathmandu?", a: "Pashupatinath Temple, Boudhanath Stupa, Swayambhunath (the Monkey Temple) and Kathmandu Durbar Square are the highlights, with Thamel for shopping and food. Patan and Bhaktapur Durbar Squares are easy add-ons." },
  { q: "How many days do you need for Kathmandu sightseeing?", a: "Two to three days lets you see the main temples and old squares at a relaxed pace. A shorter trip can still cover the key sites if you plan well." },
  { q: "Can TripSangam arrange Kathmandu sightseeing from Raxaul?", a: "Yes. We pick you up at Raxaul, help with the border, and plan your Kathmandu sightseeing around the places you most want to see." },
];

export default function Page() {
  return (
    <GuideArticle
      slug={SLUG}
      title={TITLE}
      description={DESCRIPTION}
      intro="Kathmandu packs temples, stupas and centuries-old squares into one valley. Here are the places most travellers want to see, and how they fit into a trip from Raxaul."
      faqs={faqs}
    >
      <Section title="Pashupatinath Temple">
        One of the most sacred Hindu temples, set on the banks of the Bagmati river. The complex is busy
        with pilgrims and rituals, and is a moving place to visit even from the outer areas.
      </Section>
      <Section title="Boudhanath Stupa">
        One of the largest stupas anywhere, ringed by monasteries and cafés. Walking a slow clockwise loop
        with the pilgrims, especially around dusk, is the classic Boudhanath experience.
      </Section>
      <Section title="Swayambhunath (Monkey Temple)">
        A hilltop stupa reached by a long stair, with watchful eyes painted on the spire and wide views
        over the city. It is lively with monkeys, hence the nickname.
      </Section>
      <Section title="Kathmandu Durbar Square">
        The old royal square, full of carved temples and palace courtyards — a UNESCO-listed heart of the
        old city. Patan and Bhaktapur have their own Durbar Squares nearby, each worth a half day.
      </Section>
      <Section title="Thamel">
        The traveller hub of narrow lanes packed with shops, gear stores, restaurants and cafés. It is the
        easiest place to wander in the evening and pick up souvenirs.
      </Section>
      <Section title="Planning your visit">
        We can build a Kathmandu plan around the sites that matter most to you, and combine it with Pokhara,
        Muktinath or Chitwan. Tell us your dates and we will suggest a comfortable route from Raxaul.
      </Section>
    </GuideArticle>
  );
}
