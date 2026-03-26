// import FAQSection from "@/components/FAQSection";
import Feature from "@/components/Feature";
import GlobalSection from "@/components/GlobalSection";
import Hero from "@/components/hero";
import HowItWorks from "@/components/HowItWorks";
import { PricingSection } from "@/components/pricing-section";
import WhySocial from "@/components/WhySocial";
import { getSubscriptionPlans } from "@/lib/getSubscriptionPlans";
import React from "react";
export const revalidate = 60; 

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
      {/* <FAQSection /> */}
    </div>
  );
};

export default page;
