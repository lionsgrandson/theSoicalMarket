import type { MetadataRoute } from "next";
import { buildApiUrl } from "@/lib/backendUrls";

const BASE_URL = "https://thesocialmarket.ai";

async function getInfluencerIds(): Promise<string[]> {
  try {
    const res = await fetch(buildApiUrl("user_service/get_all_influencers/?page_size=200"), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.data?.results ?? data?.data ?? [];
    return results.map((user: { id: string | number }) => String(user.id));
  } catch {
    return [];
  }
}

async function getBrandIds(): Promise<string[]> {
  try {
    const res = await fetch(buildApiUrl("user_service/get_all_brands/"), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.data?.results ?? data?.data ?? [];
    return results.map((user: { id: string | number }) => String(user.id));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [influencerIds, brandIds] = await Promise.all([
    getInfluencerIds(),
    getBrandIds(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/microinfluencers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const influencerPages: MetadataRoute.Sitemap = influencerIds.map((id) => ({
    url: `${BASE_URL}/microinfluencers/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandPages: MetadataRoute.Sitemap = brandIds.map((id) => ({
    url: `${BASE_URL}/brands/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...influencerPages, ...brandPages];
}
