import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Nepal Tour Packages from Raxaul`,
    short_name: BUSINESS.brand,
    description:
      "Nepal tour packages from Raxaul — Kathmandu, Pokhara, Muktinath and Chitwan, with Raxaul–Birgunj border assistance.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2EEE6",
    theme_color: "#1C1C1A",
    icons: [
      { src: "/tripsangam-logo.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  };
}
