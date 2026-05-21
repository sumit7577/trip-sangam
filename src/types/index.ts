export type Category = "Trekking" | "Cultural" | "Adventure" | "Spiritual" | "Wildlife" | "Leisure";
export type Difficulty = "Easy" | "Moderate" | "Challenging";

export interface Package {
  slug: string;
  name: string;
  location: string;
  category: Category;
  difficulty: Difficulty;
  durationDays: number;
  groupSize: string;
  rating: number;
  reviewCount: number;
  priceINR: number;
  originalPriceINR: number;
  discountPct: number;
  bestSeason: string;
  heroImage: string;
  shortDescription: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  altitude: number; // meters
  meals: string;
  accommodation: string;
  activities: string[];
}

export interface JourneyStop {
  id: string;
  name: string;
  day: number;
  activity: string;
  // Normalized coordinates inside the Nepal SVG viewBox (0..1)
  x: number;
  y: number;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  photos?: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface PackageDetail extends Package {
  longDescription: string;
  pullQuote: string;
  galleryImages: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  reviews: Review[];
  ratingsBreakdown: { stars: number; pct: number }[];
  faqs: FAQItem[];
  journey: JourneyStop[];
}
