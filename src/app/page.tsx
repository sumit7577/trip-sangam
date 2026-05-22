import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { CarStrip } from "@/components/ui/CarStrip";
import { getHomepage, getPackages } from "@/lib/api";

export default async function HomePage() {
  const [home, packages] = await Promise.all([getHomepage(), getPackages()]);

  return (
    <>
      <Hero
        packages={packages}
        eyebrow={home.heroEyebrow}
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        imageUrl={home.heroImage}
      />
      <StatsStrip />
      <CarStrip />
      <FeaturedPackages packages={home.featuredPackages.length > 0 ? home.featuredPackages : packages} />
      <WhyChooseUs />
      <Testimonials testimonials={home.testimonials} />
      <Newsletter />
    </>
  );
}
