import type { PricingApiResponse } from "@/components/pricing-section";

const emptyPricingResponse: PricingApiResponse = {
  status: "error",
  code: 500,
  data: [],
  error: {},
  meta: { timestamp: new Date(0).toISOString() },
};

export async function getSubscriptionPlans(): Promise<PricingApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) {
    return emptyPricingResponse;
  }

  try {
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const res = await fetch(`${normalizedBaseUrl}subscription_service/get_subscription_plans/`, {
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
