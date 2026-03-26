import { PricingSection } from '@/components/pricing-section'
import { getSubscriptionPlans } from '@/lib/getSubscriptionPlans'
import React from 'react'

const page = async() => {
    const data = await getSubscriptionPlans();
    
  return (
    <div>
      <PricingSection initialData={data} planName="Your Plan"/>
    </div>
  )
}

export default page
