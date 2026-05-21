"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSlider({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const DURATION = 6000;

  // Stable callback so it can safely sit in effect dependency arrays
  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length]
  );

  function jumpTo(target: number) {
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  }

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (!fullscreen) return;
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, go]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(id);
  }, [index, paused, go]);

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
    >
      <div className="relative h-[55vh] w-full overflow-hidden bg-ink sm:h-[65vh] md:h-[70vh]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ x: direction * 80, opacity: 0, scale: 1.04 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction * -40, opacity: 0, scale: 1.02 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ scale: [1, 1.08] }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute inset-0"
            >
              <Image
                src={images[index]}
                alt={`${title} ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-ink/35" />

        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-all hover:bg-white/30 md:left-8 md:h-12 md:w-12"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-all hover:bg-white/30 md:right-8 md:h-12 md:w-12"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-ink/40 px-3 py-1 text-xs text-white backdrop-blur md:right-6 md:top-6 md:gap-3 md:px-4 md:py-1.5">
          <span className="font-mono">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-3 w-px bg-white/30" />
          <span className="font-mono text-white/60">{String(images.length).padStart(2, "0")}</span>
        </div>

        <button
          onClick={() => setFullscreen(true)}
          aria-label="View fullscreen"
          className="absolute left-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-ink/40 text-white backdrop-blur transition-colors hover:bg-ink/60 sm:grid md:left-6 md:top-6"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10">
          <motion.div
            key={index}
            initial={{ width: "0%" }}
            animate={{ width: paused ? "0%" : "100%" }}
            transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
            className="h-full bg-gold"
          />
        </div>
      </div>

      <div className="no-scrollbar mx-auto -mt-10 flex max-w-5xl gap-2 overflow-x-auto px-4 pb-4 md:-mt-12">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => jumpTo(i)}
            className={cn(
              "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-28 sm:rounded-xl md:h-24 md:w-36",
              i === index ? "border-white shadow-lift" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={src} alt="" fill sizes="160px" className="object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
            onClick={() => setFullscreen(false)}
          >
            <motion.div
              key={`fs-${index}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative h-full max-h-[88vh] w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={images[index]} alt="" fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button
              onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Previous"
              className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Next"
              className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 font-mono text-xs text-white backdrop-blur">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
