/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build a fully-static export (HTML/CSS/JS only) into the `out/` directory.
  // Output is hostable anywhere — S3, Cloudflare Pages, GitHub Pages, Nginx,
  // or even by double-clicking out/index.html (with the trailing-slash setting
  // below it also works from a plain file://).
  output: "export",

  // Next/Image needs a server to optimise. Static export disables that, so we
  // serve the original URLs untouched.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },

  // Emit /about/index.html instead of /about.html so links resolve cleanly
  // both on a real host and from disk.
  trailingSlash: true,
};

module.exports = nextConfig;
