import type { Metadata } from "next";

import BrandsListClient from "./BrandsListClient";

export const metadata: Metadata = {
  title: "Browse Brands | The Social Market",
  description:
    "Discover brands looking to partner with micro-influencers. Browse by niche, industry, and audience.",
  openGraph: {
    title: "Browse Brands | The Social Market",
    description: "Find brand partnership opportunities that match your niche.",
    url: "https://thesocialmarket.ai/brands",
  },
};

export default function BrandsPage() {
  return <BrandsListClient />;
}
