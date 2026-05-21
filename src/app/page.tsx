import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { CarStrip } from "@/components/ui/CarStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <CarStrip />
      <FeaturedPackages />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}
