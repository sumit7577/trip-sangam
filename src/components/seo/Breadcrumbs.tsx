import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export type Crumb = { name: string; path: string };

/** Visible breadcrumb trail + matching BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-xs text-muted ${className}`}>
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={c.path} className="inline-flex items-center gap-1.5">
            {last ? (
              <span className="text-ink dark:text-white" aria-current="page">{c.name}</span>
            ) : (
              <Link href={c.path} className="hover:text-ink dark:hover:text-white">{c.name}</Link>
            )}
            {!last && <ChevronRight className="h-3 w-3" />}
          </span>
        );
      })}
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}
