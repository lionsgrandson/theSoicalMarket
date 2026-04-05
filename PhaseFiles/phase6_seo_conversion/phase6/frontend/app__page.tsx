// app/page.tsx — Phase 6: FAQ uncommented, debug log removed, metadata added
import type { Metadata } from "next";
import FAQSection from "@/components/FAQSection";
import Feature from "@/components/Feature";
import GlobalSection from "@/components/GlobalSection";
import Hero from "@/components/hero";
import HowItWorks from "@/components/HowItWorks";
import { PricingSection } from "@/components/pricing-section";
import WhySocial from "@/components/WhySocial";
import React from "react";

export const revalidate = 60;

// Phase 6: proper metadata so this page shows up correctly in Google
export const metadata: Metadata = {
  title: "The Social Market — Where Brands & Influencers Grow Together",
  description:
    "Connect with authentic micro-influencers or find brands that match your niche. Affordable influencer marketing made simple.",
  openGraph: {
    title: "The Social Market — Where Brands & Influencers Grow Together",
    description:
      "Connect with authentic micro-influencers or find brands that match your niche.",
    url: "https://thesocialmarket.ai",
    siteName: "The Social Market",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Social Market",
    description: "Affordable, authentic influencer marketing.",
  },
};

async function getPlans() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}subscription_service/get_subscription_plans/`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getPlans();
  // Phase 6: removed debug plan logging — it was writing plan data to server logs in production

  return (
    <div>
      <Hero />
      <HowItWorks />
      <WhySocial />
      <Feature />
      {data && <PricingSection initialData={data} planName="Your Plan" />}
      <GlobalSection />
      {/* Phase 6: FAQ uncommented — was commented out since launch */}
      <FAQSection />
    </div>
  );
}
