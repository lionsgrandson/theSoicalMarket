import type { PricingApiResponse } from "@/components/pricing-section";
import { buildApiUrl } from "@/lib/backendUrls";

const emptyPricingResponse: PricingApiResponse = {
  status: "error",
  code: 500,
  data: [],
  error: {},
  meta: { timestamp: new Date(0).toISOString() },
};

export async function getSubscriptionPlans(): Promise<PricingApiResponse> {
  try {
    const res = await fetch(buildApiUrl("subscription_service/get_subscription_plans/"), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return emptyPricingResponse;
    }

    return (await res.json()) as PricingApiResponse;
  } catch {
    return emptyPricingResponse;
  }
}
