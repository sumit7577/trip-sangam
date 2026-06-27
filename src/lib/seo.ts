/**
 * Central SEO config + helpers. All canonical URLs are absolute and use a
 * trailing slash to match next.config.js `trailingSlash: true`.
 *
 * Business facts here are the owner-verified NAP (name/address/phone) for
 * TripSangam Travels. Do NOT add prices, ratings, hours, a street address or
 * social profiles unless they are confirmed.
 */
import type { Metadata } from "next";
import type { PackageDetail } from "@/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripsangam.com").replace(/\/$/, "");

export const BUSINESS = {
  name: "TripSangam Travels",
  brand: "Trip Sangam",
  phone: "+917678538192",
  phoneDisplay: "+91 76785 38192",
  whatsapp: "917678538192",
  email: "allcoachingss@gmail.com",
  addressLocality: "Raxaul",
  addressArea: "East Champaran",
  addressRegion: "Bihar",
  postalCode: "845305",
  addressCountry: "IN",
  logo: `${SITE_URL}/tripsangam-logo.jpg`,
  ogImage: `${SITE_URL}/tripsangam-brand.jpg`,
  // Verified social profiles already linked from the site footer.
  instagram: "https://www.instagram.com/trip_sangam_",
  facebook: "https://www.facebook.com/share/1BTLAVtUaM/",
} as const;

/** Build an absolute, trailing-slashed canonical URL from a path. */
export function canonical(path = "/"): string {
  if (!path.startsWith("/")) path = `/${path}`;
  if (path !== "/" && !path.endsWith("/")) path = `${path}/`;
  return `${SITE_URL}${path}`;
}

/**
 * Reusable page-metadata builder so titles/descriptions/canonicals/OG are never
 * hand-duplicated. Pass a path to set the canonical + OG url.
 */
export function pageMeta({
  title,
  description,
  path = "/",
  image = BUSINESS.ogImage,
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = canonical(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS.name,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/* ----------------------------- JSON-LD builders ---------------------------- */

const postalAddress = {
  "@type": "PostalAddress",
  addressLocality: BUSINESS.addressLocality,
  addressRegion: BUSINESS.addressRegion,
  postalCode: BUSINESS.postalCode,
  addressCountry: BUSINESS.addressCountry,
};

/** Organisation + TravelAgency/LocalBusiness for the homepage. Verified NAP only. */
export function travelAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    url: `${SITE_URL}/`,
    logo: BUSINESS.logo,
    image: BUSINESS.ogImage,
    telephone: BUSINESS.phone,
    address: postalAddress,
    areaServed: [
      { "@type": "Country", name: "Nepal" },
      { "@type": "City", name: "Kathmandu" },
      { "@type": "City", name: "Pokhara" },
      { "@type": "Place", name: "Muktinath" },
      { "@type": "Place", name: "Chitwan" },
      { "@type": "City", name: "Raxaul" },
    ],
    knowsLanguage: ["en", "hi", "ne"],
    sameAs: [BUSINESS.instagram, BUSINESS.facebook],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: BUSINESS.name,
    publisher: { "@id": `${SITE_URL}/#organization` },
    // Sitelinks search box — lets Google show a search box under our result.
    // Targets the /packages listing which reads ?q= as a text filter.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/packages/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Product + Offer for a tour package detail page. Price is real (shown on the
 * page) so it's safe to expose; this is what makes the result eligible for the
 * price / "booking options" rich card. Intentionally NO aggregateRating —
 * only add that once we have genuine, on-page customer reviews (Google policy).
 */
export function packageJsonLd(pkg: PackageDetail, path: string) {
  const url = canonical(path);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: pkg.name,
    description: pkg.shortDescription,
    image: pkg.heroImage ? [pkg.heroImage] : undefined,
    brand: { "@type": "Brand", name: BUSINESS.name },
    url,
    offers: {
      "@type": "Offer",
      price: pkg.priceINR,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    mainEntityOfPage: canonical(path),
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Organization", name: BUSINESS.name, url: `${SITE_URL}/` },
    publisher: {
      "@type": "Organization",
      name: BUSINESS.name,
      logo: { "@type": "ImageObject", url: BUSINESS.logo },
    },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
