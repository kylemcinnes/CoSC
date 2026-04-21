import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/site";

/**
 * Installable PWA manifest (Next.js MetadataRoute).
 * Replace /icons/icon-192.png and /icons/icon-512.png with branded artwork when ready.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Second Chances",
    description:
      "Restoration, healing, and second chances through Jesus Christ — GTA / Port Credit.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#0a2540",
    lang: "en-CA",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
