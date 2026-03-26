import type { Metadata } from "next";
import FAQSection from "@/components/FAQSection";
import Feature from "@/components/Feature";
import GlobalSection from "@/components/GlobalSection";
import Hero from "@/components/hero";
import HowItWorks from "@/components/HowItWorks";
import { PricingSection } from "@/components/pricing-section";
import WhySocial from "@/components/WhySocial";
import { getSubscriptionPlans } from "@/lib/getSubscriptionPlans";
import React from "react";
export const revalidate = 60; 

export const metadata: Metadata = {
  title: "The Social Market - Where Brands and Influencers Grow Together",
  description:
    "Connect with authentic micro-influencers or find brands that match your niche. Affordable influencer marketing made simple.",
  openGraph: {
    title: "The Social Market - Where Brands and Influencers Grow Together",
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

const page = async() => {
  const data = await getSubscriptionPlans();
  
  return (
    <div>
      <Hero />
      <HowItWorks />
      <WhySocial />
      <Feature />
      <PricingSection initialData={data} planName="Your Plan"/>
      <GlobalSection />
      <FAQSection />
    </div>
  );
};

export default page;
