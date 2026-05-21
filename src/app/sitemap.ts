import type { MetadataRoute } from "next";
import { packages } from "@/data/packages";
import { blogPosts } from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://himalayan-trails.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const packageRoutes: MetadataRoute.Sitemap = packages.map((p) => ({
    url: `${SITE_URL}/packages/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.isoDate),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...packageRoutes, ...blogRoutes];
}
