import { CalendarDays } from "lucide-react";
import { BUSINESS } from "@/lib/seo";

/** A titled prose section (H2 + body) for content/landing pages. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl tracking-tight md:text-3xl">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-muted md:text-base">{children}</div>
    </section>
  );
}

/** Business + last-updated attribution for travel guides (E-E-A-T signal). */
export function ArticleByline({ updated }: { updated: string }) {
  return (
    <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted">
      <CalendarDays className="h-3.5 w-3.5" />
      By {BUSINESS.name} · Updated {updated}
    </p>
  );
}
