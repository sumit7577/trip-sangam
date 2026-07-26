import type {
  BlogPost,
  Package,
  PackageDetail,
  TeamMember,
  Testimonial,
} from "@/types";
import { mediaUrl } from "./media";

function mapPackage(p: Package): Package {
  return { ...p, heroImage: mediaUrl(p.heroImage) };
}

function mapPackageDetail(p: PackageDetail): PackageDetail {
  return {
    ...p,
    heroImage: mediaUrl(p.heroImage),
    galleryImages: p.galleryImages.map(mediaUrl),
    reviews: p.reviews.map((r) => ({
      ...r,
      avatar: mediaUrl(r.avatar),
      photos: r.photos?.map(mediaUrl),
    })),
    journey: p.journey.map((j) => ({
      ...j,
      image: mediaUrl(j.image),
      panorama: mediaUrl(j.panorama),
    })),
  };
}

function mapBlogPost(p: BlogPost): BlogPost {
  return { ...p, coverImage: mediaUrl(p.coverImage) };
}

function mapTeamMember(m: TeamMember): TeamMember {
  return { ...m, photo: mediaUrl(m.photo) };
}

function mapTestimonial(t: Testimonial): Testimonial {
  return { ...t, avatar: mediaUrl(t.avatar) };
}

// Server-side (ISR) fetches prefer the in-cluster URL; falls back to the public
// one. Browser/client API calls use NEXT_PUBLIC_API_URL directly (see lib/auth.ts).
const BASE =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

export const getPackages = async () =>
  (await fetchJSON<Package[]>("/api/packages/", [])).map(mapPackage);
export const getPackage = async (slug: string) => {
  const p = await fetchJSONOrNull<PackageDetail>(`/api/packages/${slug}/`);
  return p ? mapPackageDetail(p) : null;
};

export const getBlogPosts = async () =>
  (await fetchJSON<BlogPost[]>("/api/blog/", [])).map(mapBlogPost);
export const getBlogPost = async (slug: string) => {
  const p = await fetchJSONOrNull<BlogPost>(`/api/blog/${slug}/`);
  return p ? mapBlogPost(p) : null;
};

export const getTeam = async () =>
  (await fetchJSON<TeamMember[]>("/api/team/", [])).map(mapTeamMember);
export const getTestimonials = async () =>
  (await fetchJSON<Testimonial[]>("/api/testimonials/", [])).map(mapTestimonial);

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
  heroTitle: "Trip Sangam",
  heroSubtitle: "",
  heroImage: "",
  stats: [],
  featuredPackages: [],
  testimonials: [],
};

export const getHomepage = async () => {
  const h = await fetchJSON<HomepagePayload>("/api/homepage/", HOMEPAGE_FALLBACK);
  return {
    ...h,
    heroImage: mediaUrl(h.heroImage),
    featuredPackages: h.featuredPackages.map(mapPackage),
    testimonials: h.testimonials.map(mapTestimonial),
  };
};

export async function getTeamBySlug(): Promise<Record<string, TeamMember>> {
  const team = await getTeam();
  return Object.fromEntries(team.map((m) => [m.slug, m]));
}
