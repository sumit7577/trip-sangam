import type {
  BlogPost,
  Package,
  PackageDetail,
  TeamMember,
  Testimonial,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REVALIDATE_SECONDS = 60;

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`);
  }
  return res.json();
}

async function fetchJSONOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const getPackages = () => fetchJSON<Package[]>("/api/packages/");
export const getPackage = (slug: string) =>
  fetchJSONOrNull<PackageDetail>(`/api/packages/${slug}/`);

export const getBlogPosts = () => fetchJSON<BlogPost[]>("/api/blog/");
export const getBlogPost = (slug: string) =>
  fetchJSONOrNull<BlogPost>(`/api/blog/${slug}/`);

export const getTeam = () => fetchJSON<TeamMember[]>("/api/team/");
export const getTestimonials = () => fetchJSON<Testimonial[]>("/api/testimonials/");

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
export const getHomepage = () => fetchJSON<HomepagePayload>("/api/homepage/");

export async function getTeamBySlug(): Promise<Record<string, TeamMember>> {
  const team = await getTeam();
  return Object.fromEntries(team.map((m) => [m.slug, m]));
}
