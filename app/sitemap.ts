import type { MetadataRoute } from "next";

// REPLACE with your real domain once deployed.
const base = "https://smartnest.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
