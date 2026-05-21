"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Gallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const spans = ["row-span-2", "", "", "row-span-2", "", "", "", "row-span-2", ""];

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl">From the trail</h2>
        <p className="pretty mt-2 text-muted">Click any photo to view full size.</p>
      </div>

      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {images.map((src, i) => (
          <motion.button
            key={i}
            layoutId={`gal-${i}`}
            onClick={() => setLightbox(i)}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: (i % 6) * 0.04, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className={`group relative overflow-hidden rounded-2xl ${spans[i % spans.length]}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink/85 p-4 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              layoutId={`gal-${lightbox}`}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl"
            >
              <Image
                src={images[lightbox]}
                alt=""
                width={1600}
                height={1000}
                className="max-h-[85vh] w-auto object-contain"
              />
            </motion.div>

            <button
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
              }}
              className="absolute left-6 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((i) => (i === null ? 0 : (i + 1) % images.length));
              }}
              className="absolute right-6 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white backdrop-blur">
              {String(lightbox + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
