/** Travel-guide registry — used by the /guides hub and the sitemap. */
export const GUIDES_UPDATED = "27 June 2026";
export const GUIDES_UPDATED_ISO = "2026-06-27";

export const GUIDES = [
  {
    slug: "nepal-travel-guide-for-indians",
    title: "Nepal Travel Guide for Indian Citizens",
    excerpt: "Visa rules, the documents you need, money tips and how to reach Nepal from India.",
  },
  {
    slug: "raxaul-birgunj-border-guide",
    title: "Raxaul–Birgunj Border Travel Guide",
    excerpt: "How the India–Nepal crossing at Birgunj works, what to carry and how we help.",
  },
  {
    slug: "best-time-to-visit-nepal",
    title: "Best Time to Visit Nepal",
    excerpt: "A season-by-season guide to weather, mountain views and what each season suits.",
  },
] as const;
