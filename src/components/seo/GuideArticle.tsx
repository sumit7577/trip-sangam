import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { FaqSection, type Faq } from "./FaqSection";
import { JsonLd } from "./JsonLd";
import { ArticleByline } from "./Prose";
import { ContactCTA } from "@/components/ui/ContactCTA";
import { articleJsonLd } from "@/lib/seo";
import { GUIDES, GUIDES_UPDATED, GUIDES_UPDATED_ISO } from "@/lib/guides";

/** Shared shell for travel-guide articles: breadcrumbs, H1, byline, body,
 *  CTA, cross-links to other guides, FAQ + Article/FAQPage JSON-LD. */
export function GuideArticle({
  slug,
  title,
  description,
  intro,
  faqs,
  children,
}: {
  slug: string;
  title: string;
  description: string;
  intro: string;
  faqs: Faq[];
  children: React.ReactNode;
}) {
  const path = `/guides/${slug}/`;
  const others = GUIDES.filter((g) => g.slug !== slug);

  return (
    <main className="min-h-screen bg-sand pb-8 pt-28 dark:bg-[#0E0E0D] md:pt-32">
      <JsonLd data={articleJsonLd({ title, description, path, datePublished: GUIDES_UPDATED_ISO })} />
      <article className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Travel Guides", path: "/guides/" },
            { name: title, path },
          ]}
        />
        <h1 className="balance mt-4 font-serif text-4xl tracking-tight md:text-5xl">{title}</h1>
        <ArticleByline updated={GUIDES_UPDATED} />
        <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">{intro}</p>

        <div className="mt-10 space-y-10">{children}</div>

        <div className="mt-12 rounded-3xl border border-line bg-white p-6 dark:bg-white/5">
          <p className="font-serif text-xl text-ink dark:text-white">Planning a Nepal trip from Raxaul?</p>
          <p className="mt-1 text-sm text-muted">Tell us your dates and destinations and we will share an itinerary and quotation.</p>
          <ContactCTA className="mt-4" />
        </div>

        <div className="mt-8">
          <p className="text-sm text-muted">
            More guides:{" "}
            {others.map((g, i) => (
              <span key={g.slug}>
                <Link href={`/guides/${g.slug}/`} className="font-medium text-ink underline-offset-4 hover:underline dark:text-white">{g.title}</Link>
                {i < others.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </div>
      </article>

      <FaqSection faqs={faqs} />
    </main>
  );
}
