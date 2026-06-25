"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PackageDetail } from "@/types";
import { useModal } from "@/lib/modal";

export function FinalCTA({ pkg }: { pkg?: PackageDetail }) {
  const { openBooking } = useModal();

  function onBook() {
    if (pkg) openBooking({ pkg });
    else {
      // No package context — scroll to packages list
      const el = document.getElementById("packages");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.location.href = "/#packages";
    }
  }

  return (
    <section className="relative isolate mt-12 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=80"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-20 text-white sm:py-24 md:px-8 md:py-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="balance max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-7xl"
        >
          Ready for your<br />
          <span className="italic text-champagne">Himalayan adventure?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="pretty mt-5 max-w-xl text-lg text-white/75"
        >
          Hold a date with ₹5,000. Cancel free up to 30 days. Talk to a real human who's actually
          walked the route.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Button size="lg" onClick={onBook}>
            Book Now
            <ArrowRight className="h-4 w-4" />
          </Button>
          <a
            href="tel:+917678538192"
            className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/25 px-7 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            <Phone className="h-4 w-4" />
            +91 70704 06193
          </a>
        </motion.div>
      </div>
    </section>
  );
}
