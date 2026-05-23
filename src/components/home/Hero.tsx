"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import type { Package } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=85";
const DEFAULT_EYEBROW = "Spring '26 departures open";
const DEFAULT_TITLE = "Where the Sky Begins";
const DEFAULT_SUBTITLE =
  "Curated journeys across Nepal's most sacred landscapes — led by local guides who grew up in the shadow of these mountains.";

interface HeroProps {
  packages: Package[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export function Hero({ packages, eyebrow, title, subtitle, imageUrl }: HeroProps) {
  const heroImage = imageUrl || DEFAULT_IMAGE;
  const heroEyebrow = eyebrow || DEFAULT_EYEBROW;
  const heroTitle = title || DEFAULT_TITLE;
  const heroSubtitle = subtitle || DEFAULT_SUBTITLE;

  return (
    <section className="relative min-h-[100svh] w-full">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized={heroImage.startsWith("http://")}
          />
        </div>
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 bg-grain opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-5 pt-24 pb-20 text-center md:px-8 md:pt-32 md:pb-24">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          {heroEyebrow}
        </motion.span>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="balance mt-8 font-serif text-[clamp(2.5rem,7vw,6.5rem)] font-light leading-[0.95] tracking-tight text-white"
        >
          {heroTitle}
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="pretty mt-6 max-w-xl text-base text-white/80 md:text-lg"
        >
          {heroSubtitle}
        </motion.p>

        <SearchBar packages={packages} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-white/70"
          >
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
