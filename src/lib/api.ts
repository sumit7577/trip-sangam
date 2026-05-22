import type {
  BlogPost,
  Package,
  PackageDetail,
  TeamMember,
  Testimonial,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REVALIDATE_SECONDS = 60;

/**
 * Resilient fetcher. If the backend is unreachable (build-time in Docker,
 * a brief CMS outage, etc.) returns `fallback` instead of throwing. This is
 * what lets `next build` succeed even when the Django container isn't running
 * yet — pages render with empty data at build time, then ISR refreshes them
 * within REVALIDATE_SECONDS of the first real request.
 */
async function fetchJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.warn(`[api] ${path} → ${res.status}, using fallback`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[api] ${path} fetch failed, using fallback:`, err);
    return fallback;
  }
}

async function fetchJSONOrNull<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`[api] ${path} → ${res.status}, returning null`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[api] ${path} fetch failed, returning null:`, err);
    return null;
  }
}

export const getPackages = () => fetchJSON<Package[]>("/api/packages/", []);
export const getPackage = (slug: string) =>
  fetchJSONOrNull<PackageDetail>(`/api/packages/${slug}/`);

export const getBlogPosts = () => fetchJSON<BlogPost[]>("/api/blog/", []);
export const getBlogPost = (slug: string) =>
  fetchJSONOrNull<BlogPost>(`/api/blog/${slug}/`);

export const getTeam = () => fetchJSON<TeamMember[]>("/api/team/", []);
export const getTestimonials = () =>
  fetchJSON<Testimonial[]>("/api/testimonials/", []);

export interface HomepagePayload {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  stats: { value: string; label: string }[];
  featuredPackages: Package[];
  testimonials: Testimonial[];
  contact?: {
    businessName: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    instagramUrl: string;
    facebookUrl: string;
    twitterUrl: string;
  };
}

const HOMEPAGE_FALLBACK: HomepagePayload = {
  heroEyebrow: "",
  heroTitle: "Sangam Travels",
  heroSubtitle: "",
  heroImage: "",
  stats: [],
  featuredPackages: [],
  testimonials: [],
};

export const getHomepage = () =>
  fetchJSON<HomepagePayload>("/api/homepage/", HOMEPAGE_FALLBACK);

export async function getTeamBySlug(): Promise<Record<string, TeamMember>> {
  const team = await getTeam();
  return Object.fromEntries(team.map((m) => [m.slug, m]));
}
