import type { MetadataRoute } from "next";
import { getBlogPosts, getPackages } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { GUIDES, GUIDES_UPDATED_ISO } from "@/lib/guides";

// trailingSlash: true → every canonical URL ends with "/".
const u = (path: string) => `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packages, blogPosts] = await Promise.all([getPackages(), getBlogPosts()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: u("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: u("/nepal-tour-packages"), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: u("/nepal-tour-package-from-raxaul"), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: u("/raxaul-to-kathmandu-travel"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: u("/pokhara-tour-package-from-raxaul"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: u("/muktinath-tour-package-from-raxaul"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: u("/packages"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: u("/guides"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: u("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: u("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: u("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: u(`/guides/${g.slug}`),
    lastModified: new Date(GUIDES_UPDATED_ISO),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const packageRoutes: MetadataRoute.Sitemap = packages.map((p) => ({
    url: u(`/packages/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: u(`/blog/${p.slug}`),
    lastModified: new Date(p.isoDate),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes, ...packageRoutes, ...blogRoutes];
}
