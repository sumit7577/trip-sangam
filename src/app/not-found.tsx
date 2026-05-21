import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-sand px-5 py-24">
      {/* Subtle distant mountains as visual anchor */}
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-1/2 -z-10 h-40 w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <path
          d="M 0 200 L 100 90 L 200 130 L 320 60 L 440 120 L 560 50 L 680 110 L 820 70 L 940 130 L 1080 80 L 1200 120 L 1200 200 Z"
          fill="#1C2E3D"
        />
      </svg>

      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/60 px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          <Compass className="h-3 w-3" />
          404 · Off the map
        </span>
        <h1 className="balance mt-6 font-serif text-5xl tracking-tight md:text-7xl">
          This trail doesn't <em className="italic text-crimson">exist.</em>
        </h1>
        <p className="pretty mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
          The page you're looking for may have moved with the seasons, or it never lived here at
          all. Head back to base camp and try again.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-ink px-6 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-ink/90"
          >
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#packages"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-6 text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            Browse destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
