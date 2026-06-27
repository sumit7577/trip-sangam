import { JsonLd } from "./JsonLd";
import { faqJsonLd } from "@/lib/seo";

export type Faq = { q: string; a: string };

/**
 * Visible FAQ block (answers rendered open, not collapsed — better for AI
 * Overviews) plus a matching FAQPage JSON-LD. The schema text equals the
 * visible text, as required.
 */
export function FaqSection({
  faqs,
  heading = "Frequently asked questions",
  className = "",
}: {
  faqs: Faq[];
  heading?: string;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20 ${className}`}>
      <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{heading}</h2>
      <dl className="mt-8 divide-y divide-line">
        {faqs.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="font-serif text-lg text-ink dark:text-white">{f.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
          </div>
        ))}
      </dl>
      <JsonLd data={faqJsonLd(faqs)} />
    </section>
  );
}
