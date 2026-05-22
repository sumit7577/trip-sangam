/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-rendered + ISR. Page data is fetched from the Django CMS at
  // /api/packages/, /api/blog/, etc. and cached for 60s (see src/lib/api.ts).
  // For static export back, restore `output: "export"` and `images.unoptimized: true`.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  trailingSlash: true,
};

module.exports = nextConfig;
