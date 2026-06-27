import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GuideArticle } from "@/components/seo/GuideArticle";
import { Section } from "@/components/seo/Prose";
import type { Faq } from "@/components/seo/FaqSection";

const SLUG = "best-time-to-visit-nepal";
const TITLE = "Best Time to Visit Nepal";
const DESCRIPTION =
  "A season-by-season guide to the best time to visit Nepal — when to go for clear mountain views, sightseeing, pilgrimage and fewer crowds.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: `/guides/${SLUG}/` });

const faqs: Faq[] = [
  { q: "What is the best time to visit Nepal?", a: "Autumn (roughly September to November) and spring (March to May) are generally the most popular, with pleasant weather and clear mountain views. The right time still depends on what you want to do." },
  { q: "Is the monsoon a bad time to visit Nepal?", a: "The monsoon (around June to August) brings rain and the chance of road disruption in the hills, but the countryside is lush and there are fewer crowds. Lowland sightseeing is still possible with a flexible plan." },
  { q: "When is the best time for a Muktinath pilgrimage?", a: "Spring and autumn are usually the most comfortable for Muktinath. Deep winter can be very cold with snow on the high routes, so we plan the timing carefully for pilgrims." },
];

export default function Page() {
  return (
    <GuideArticle
      slug={SLUG}
      title={TITLE}
      description={DESCRIPTION}
      intro="Nepal is a year-round destination, but each season has its own character. Here is what to expect through the year so you can choose the right time for your trip."
      faqs={faqs}
    >
      <Section title="Autumn (September to November)">
        Often considered the best overall season. Skies are usually clear after the monsoon, the air is
        crisp and mountain views are at their finest. It is the busiest season, so plan and book ahead.
      </Section>

      <Section title="Spring (March to May)">
        Warm, colourful and pleasant, with rhododendrons in bloom in the hills. Spring is excellent for
        sightseeing and for higher-altitude travel such as Muktinath as the snow eases.
      </Section>

      <Section title="Monsoon (June to August)">
        The countryside turns green and crowds thin out, but expect rain and the occasional road
        disruption in the hills. With a flexible plan, lowland sightseeing and city visits still work
        well during this time.
      </Section>

      <Section title="Winter (December to February)">
        Cold but often clear, with sharp mountain views on good days. Lower areas like Kathmandu, Pokhara
        and Chitwan are comfortable, while high routes such as Muktinath can be very cold with snow.
      </Section>

      <Section title="Best time by trip type">
        <ul className="ml-5 list-disc space-y-1.5">
          <li><strong className="text-ink dark:text-white">Mountain views &amp; photography:</strong> autumn, then spring</li>
          <li><strong className="text-ink dark:text-white">Pilgrimage (Muktinath):</strong> spring and autumn</li>
          <li><strong className="text-ink dark:text-white">Pokhara &amp; lakeside:</strong> pleasant most of the year except heavy monsoon days</li>
          <li><strong className="text-ink dark:text-white">Chitwan wildlife:</strong> the cooler, drier months are comfortable for safaris</li>
        </ul>
      </Section>

      <Section title="Tell us your dates">
        Whatever the season, we plan the route around the conditions — adding rest days or adjusting the
        order of places when needed. Share your dates and we will suggest the best plan for that time of year.
      </Section>
    </GuideArticle>
  );
}
