import type { MetadataRoute } from "next";

// REPLACE with your real domain once deployed.
const base = "https://smartnest.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
