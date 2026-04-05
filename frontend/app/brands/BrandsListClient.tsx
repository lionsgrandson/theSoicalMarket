"use client";

import { useEffect, useState } from "react";
import BrandListWithSearch from "@/components/BrandListWithSearch";
import { buildApiUrl } from "@/lib/backendUrls";

interface BrandProfile {
  id: number;
  business_name: string | null;
  display_name: string | null;
  business_type: string | null;
  logo: string | null;
  short_bio: string | null;
  timezone: string | null;
}

interface BrandApiResponse {
  id: number;
  brand_profile: BrandProfile;
  user?: {
    id: number;
    first_name: string;
  };
}

interface BrandCardData {
  id: number;
  userId: number;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
  logo: string;
  service: string;
  rating: number;
  reviews: number;
}

function mapBrands(items: BrandApiResponse[]): BrandCardData[] {
  return items.map((brand) => ({
    id: brand?.id,
    userId: brand?.user?.id ?? 0,
    name:
      brand?.brand_profile?.display_name ||
      brand?.brand_profile?.business_name ||
      brand?.user?.first_name ||
      "Unnamed",
    location: brand?.brand_profile?.timezone || "Location not specified",
    category: brand?.brand_profile?.business_type
      ? brand.brand_profile.business_type.split("â€“")[0].trim()
      : "General Brand",
    description: brand?.brand_profile?.short_bio || "",
    image: brand?.brand_profile?.logo || "/images/placeholder.jpg",
    logo: brand?.brand_profile?.logo || "/images/placeholder.jpg",
    service: "Brand Campaign",
    rating: 4.5,
    reviews: 0,
  }));
}

export default function BrandsListClient() {
  const [brands, setBrands] = useState<BrandCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBrands() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(buildApiUrl("user_service/get_featured_brands/"));
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const items: BrandApiResponse[] = Array.isArray(data)
          ? data
          : data?.data?.results ?? data?.data ?? [];

        if (!cancelled) {
          setBrands(mapBrands(items));
        }
      } catch (err) {
        if (!cancelled) {
          setBrands([]);
          setError(err instanceof Error ? err.message : "Unable to load brands");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-lg">Loading brands...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-red-500">Unable to load brands.</p>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
      </section>
    );
  }

  return <BrandListWithSearch brands={brands} />;
}
