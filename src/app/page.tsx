import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { HomeIntro } from "@/components/home/HomeIntro";
import { CategoryNav } from "@/components/home/CategoryNav";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { DealsStrip } from "@/components/home/DealsStrip";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Newsletter } from "@/components/home/Newsletter";
import { CarStrip } from "@/components/ui/CarStrip";
import { FaqSection, type Faq } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomepage, getPackages } from "@/lib/api";
import { canonical, travelAgencyJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/") },
};

const homeFaqs: Faq[] = [
  {
    q: "How do I travel from Raxaul to Kathmandu?",
    a: "Most travellers cross the Raxaul–Birgunj border and continue to Kathmandu by road. TripSangam meets you at Raxaul and arranges a private vehicle or a group tour onward. Actual road time varies with traffic, road and weather conditions, border formalities and stops along the way.",
  },
  {
    q: "Where does the Nepal tour begin?",
    a: "Our Nepal tours begin at Raxaul and the Raxaul–Birgunj border. We meet you in Raxaul, help with the crossing into Nepal, and start the journey from there.",
  },
  {
    q: "Which Nepal destinations can I visit from Raxaul?",
    a: "From Raxaul you can visit Kathmandu, Pokhara, Muktinath, Chitwan, Lumbini and Nagarkot. Tell us your interests and dates and we will suggest a route that fits.",
  },
  {
    q: "What documents should Indian travellers carry for Nepal?",
    a: "Indian citizens do not need a visa for Nepal, but should carry a valid photo identity document such as a passport or Voter ID. It helps to keep a few spare copies and passport-size photos.",
  },
  {
    q: "Does TripSangam provide border assistance?",
    a: "Yes. We assist with the Raxaul–Birgunj border crossing and arrange transport from Raxaul into Nepal so your journey is smooth.",
  },
  {
    q: "Can families and senior citizens book these tours?",
    a: "Yes. We plan family and pilgrimage tours at a comfortable pace and can arrange suitable vehicles and stays for senior travellers.",
  },
];

export default async function HomePage() {
  const [home, packages] = await Promise.all([getHomepage(), getPackages()]);

  return (
    <>
      <JsonLd data={[travelAgencyJsonLd(), websiteJsonLd()]} />
      <Hero
        packages={packages}
        eyebrow={home.heroEyebrow}
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        imageUrl={home.heroImage}
      />
      <CategoryStrip />
      <HomeIntro />
      <CategoryNav packages={packages} />
      <CarStrip />
      <FeaturedPackages packages={home.featuredPackages.length > 0 ? home.featuredPackages : packages} />
      <DealsStrip packages={packages} />
      <WhyChooseUs />
      <FaqSection faqs={homeFaqs} heading="Nepal tours from Raxaul — your questions" />
      <Newsletter />
    </>
  );
}
