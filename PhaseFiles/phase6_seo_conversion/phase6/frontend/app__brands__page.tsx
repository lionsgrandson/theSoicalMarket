// app/brands/page.tsx
// Phase 6: Added metadata + removed debug logging.
// Data fetching and BrandListWithSearch usage are identical to before.

import type { Metadata } from "next";
import { apiClient } from "@/lib/apiClient";
import BrandListWithSearch from "@/components/BrandListWithSearch";

export const metadata: Metadata = {
  title: "Browse Brands | The Social Market",
  description:
    "Discover brands looking to partner with micro-influencers. Browse by niche, industry, and audience. Sign up to start collaborating.",
  openGraph: {
    title: "Browse Brands | The Social Market",
    description: "Find brand partnership opportunities that match your niche.",
    url: "https://thesocialmarket.ai/brands",
  },
};

export interface BrandProfile {
  id: number; business_name: string | null; display_name: string | null;
  business_type: string | null; logo: string | null; short_bio: string | null;
  keyword_hashtags: string | null; audience_demographic: string | null;
  brand_tone: string | null; choosen_plan: string | null; designation: string | null;
  instagram_handle: string | null; linkedin_profile: string | null;
  tiktok_handle: string | null; x_handle: string | null;
  whatsapp_business: string | null; website: string | null;
  timezone: string | null; targeted_audience: string | null; mission: string | null;
}
interface BrandApiResponse {
  id: number; brand_profile: BrandProfile; user?: { id: number; first_name: string };
}

export default async function BrandsPage() {
  async function fetchBrands() {
    try {
      const res = await apiClient("user_service/get_featured_brands/", { method: "GET" });
      const items: BrandApiResponse[] = res ?? [];
      return items.map((brand: BrandApiResponse) => ({
        id: brand?.id,
        userId: brand?.user?.id ?? 0,
        name: brand?.brand_profile?.display_name || brand?.brand_profile?.business_name || brand?.user?.first_name || "Unnamed",
        location: brand?.brand_profile?.timezone || "Location not specified",
        category: brand?.brand_profile?.business_type ? brand.brand_profile.business_type.split("–")[0].trim() : "General Brand",
        description: brand?.brand_profile?.short_bio || "",
        image: brand?.brand_profile?.logo || "/images/placeholder.jpg",
        logo: brand?.brand_profile?.logo || "/images/placeholder.jpg",
        service: "Brand Campaign",
        rating: 4.5,
        reviews: 0,
      }));
    } catch {
      return []; // Phase 6: removed console.error — silent fail
    }
  }
  const brands = await fetchBrands();
  // Phase 6: removed debug logging for the brands payload
  return <BrandListWithSearch brands={brands} />;
}
