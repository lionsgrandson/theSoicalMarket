// app/robots.ts
// Generates /robots.txt automatically.
// Drop this in the app/ folder — no other config needed.

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep dashboard and auth pages out of search engines
        disallow: [
          "/brand-dashboard/",
          "/influencer-dashboard/",
          "/home_dashboard/",
          "/auth/",
          "/brand-onboarding/",
          "/influencer-onboarding/",
        ],
      },
    ],
    sitemap: "https://thesocialmarket.ai/sitemap.xml",
  };
}
