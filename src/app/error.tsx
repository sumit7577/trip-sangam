"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Root error boundary — catches anything that throws in the route tree below.
 * Next.js will mount this and pass the error + a reset() that re-tries the segment.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, this is where you'd ship to Sentry / Datadog / Logflare.
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[100svh] w-full items-center justify-center bg-sand px-5 py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-crimson/40 bg-crimson/8 px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-crimson">
          <AlertTriangle className="h-3 w-3" />
          Something went wrong
        </span>
        <h1 className="balance mt-6 font-serif text-4xl tracking-tight md:text-6xl">
          The trail hit <em className="italic text-crimson">unexpected weather.</em>
        </h1>
        <p className="pretty mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
          We've logged the issue. You can try again, or head back to base camp.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-ink px-6 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-ink/90"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-6 text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            Back to home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="mt-6 font-mono text-[10px] text-muted">digest: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
