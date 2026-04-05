import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
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
