import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/live`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/sermons`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/register`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
