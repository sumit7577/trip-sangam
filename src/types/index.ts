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
  // WGS84 geographic coordinates (decimal degrees)
  lat: number;
  lng: number;
  // Bunny CDN URL of the photo shown in the marker lightbox.
  // Empty string when the editor hasn't uploaded one yet.
  image: string;
  // Equirectangular 360° image URL (uploaded pano, or an external/Google
  // image URL, or a Google Street View embed URL). "" when none set.
  panorama: string;
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
  overviewNote: string;
  tripStyle: string;
  maxAltitude: string;
  dailyWalking: string;
  startEnd: string;
  minAge: string;
  languages: string;
  galleryImages: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  reviews: Review[];
  ratingsBreakdown: { stars: number; pct: number }[];
  faqs: FAQItem[];
  journey: JourneyStop[];
}

export type BlogCategory = "Trekking" | "Culture" | "Stories" | "Tips" | "Wildlife";

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  authorSlug: string;
  date: string;
  isoDate: string;
  readingTime: number;
  coverImage: string;
  excerpt: string;
  body: string[];
  pullQuote?: string;
  featured?: boolean;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  region: string;
  yearsExperience: number;
  languages: string[];
  photo: string;
  bio: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  quote: string;
  trip: string;
}
