import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GuideArticle } from "@/components/seo/GuideArticle";
import { Section } from "@/components/seo/Prose";
import type { Faq } from "@/components/seo/FaqSection";

const SLUG = "places-to-visit-in-pokhara";
const TITLE = "Top Places to Visit in Pokhara";
const DESCRIPTION =
  "The best places to visit in Pokhara — Phewa Lake, Sarangkot sunrise, the World Peace Pagoda and Davis Falls — and how to see them on a tour from Raxaul.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: `/guides/${SLUG}/` });

const faqs: Faq[] = [
  { q: "What are the must-see places in Pokhara?", a: "Phewa Lake (with boating), the Sarangkot sunrise viewpoint, the World Peace Pagoda and Davis Falls are the highlights, with the lakeside area for an easy evening stroll." },
  { q: "Is Pokhara good for families and senior travellers?", a: "Yes. Pokhara is relaxed and mostly easy-going, so it suits families and senior travellers. Boating and the lakeside are gentle, and viewpoints can be reached by vehicle." },
  { q: "Can TripSangam plan a Pokhara trip from Raxaul?", a: "Yes. We arrange pickup at Raxaul, border assistance and travel onward to Pokhara, often combined with Kathmandu or Muktinath." },
];

export default function Page() {
  return (
    <GuideArticle
      slug={SLUG}
      title={TITLE}
      description={DESCRIPTION}
      intro="Pokhara is Nepal's relaxed lakeside town, framed by Himalayan peaks. These are the places most visitors enjoy, and how they fit a trip from Raxaul."
      faqs={faqs}
    >
      <Section title="Phewa Lake">
        The heart of Pokhara — calm water with hills and, on clear days, mountains reflected in it. A boat
        ride to the lakeside Tal Barahi temple on its small island is the classic thing to do.
      </Section>
      <Section title="Sarangkot">
        The favourite sunrise viewpoint above Pokhara, looking out over the Annapurna range and the valley
        below. It is an early start, but the views reward it on a clear morning.
      </Section>
      <Section title="World Peace Pagoda">
        A white stupa on a ridge above the lake, reached by a short hike or drive. It offers a peaceful
        spot and a wide view back over Phewa Lake and the town.
      </Section>
      <Section title="Davis Falls & Gupteshwor Cave">
        A waterfall that disappears into an underground channel, with the Gupteshwor cave and shrine just
        across the road — an easy, popular stop.
      </Section>
      <Section title="Lakeside">
        The main strip along Phewa Lake, lined with cafés, shops and restaurants. It is the most pleasant
        place to relax in the evening after a day of sightseeing.
      </Section>
      <Section title="Planning your visit">
        We can combine Pokhara with Kathmandu, or use it as the base for a Muktinath pilgrimage. Share your
        dates and we will plan a comfortable route starting from Raxaul.
      </Section>
    </GuideArticle>
  );
}
