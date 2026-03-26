"use client";

import { useEffect, useState } from "react";
import { PricingSection, type PricingApiResponse } from "@/components/pricing-section";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface SubscriptionInfo {
  plan_name?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  stripe_subscription_id?: string;
  current_period_end?: string;
  [key: string]: unknown;
}

export default function SubscriptionPage() {
  const [planData, setPlanData] = useState<SubscriptionInfo | null>(null);
  const [pricingData, setPricingData] = useState<PricingApiResponse | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadSubscriptionPageData = async () => {
      try {
        const plansRes = await apiClient("subscription_service/get_subscription_plans/", {
          method: "GET",
        });
        if (plansRes.status === "success") {
          setPricingData(plansRes as PricingApiResponse);
        }

        const subRes = await apiClient("subscription_service/get_user_subscription_information/", {
          auth: true,
          method: "GET",
        });
        if (subRes.status === "success") {
          setPlanData(subRes.data);
        }

        const portalRes = await apiClient("subscription_service/customer-portal/", {
          auth: true,
          method: "GET",
        });
        if (portalRes.status === "success") {
          setPortalUrl(portalRes?.data?.portal_url);
        }
      } catch (error) {
        console.error("Failed to load subscription page data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionPageData();
  }, []);

  // const handleCancelSubscription = async () => {
  //   if (!confirm("Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.")) {
  //     return;
  //   }

  //   setActionLoading(true);
  //   try {
  //     const res = await apiClient("subscription_service/cancel_subscription/", {
  //       auth: true,
  //       method: "POST",
  //     });

  //     if (res.status === "success") {
  //       setPlanData((prev) => prev ? { ...prev, cancel_at_period_end: true } : null);
  //       alert("Subscription canceled. It remains active until the end of your billing period.");
  //     } else {
  //       alert("Failed to cancel. Please try again or contact support.");
  //     }
  //   } catch (error) {
  //     console.error("Cancel error:", error);
  //     alert("An error occurred. Please try again.");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // const handleReactivateSubscription = async () => {
  //   setActionLoading(true);
  //   try {
  //     const res = await apiClient("subscription_service/reactivate_subscription/", {
  //       auth: true,
  //       method: "POST",
  //     });

  //     if (res.status === "success") {
  //       setPlanData((prev) => prev ? { ...prev, cancel_at_period_end: false } : null);
  //       alert("Subscription reactivated successfully.");
  //     } else {
  //       alert("Failed to reactivate. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Reactivate error:", error);
  //     alert("An error occurred.");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  const isActive = planData?.status === "active";
  const isCanceled = planData?.cancel_at_period_end === true;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      {/* Current Subscription Card */}
      {planData && isActive && (
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Management</h1>
          
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Current Plan</h2>
                <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${
                  isCanceled 
                    ? "bg-red-100 text-red-700 ring-1 ring-red-600/20" 
                    : "bg-green-100 text-green-700 ring-1 ring-green-600/20"
                }`}>
                  {isCanceled ? "Cancels at period end" : "Active"}
                </span>
              </div>
            </div>
            
            <div className="px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {planData.plan_name || "Unknown Plan"}
                  </p>
                  {planData.current_period_end && (
                    <p className="mt-3 text-base text-gray-600">
                      Next billing: <span className="font-medium">{new Date(planData.current_period_end as string).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* {!isCanceled && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-3 text-base font-medium text-red-700 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
                    >
                      {actionLoading ? "Processing..." : "Cancel Subscription"}
                    </button>
                  )}

                  {isCanceled && (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-white px-6 py-3 text-base font-medium text-green-700 shadow-sm transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
                    >
                      {actionLoading ? "Processing..." : "Reactivate Subscription"}
                    </button>
                  )} */}

                  {portalUrl && (
                    <button
                      onClick={() => router.push(portalUrl)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Manage Billing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Active Subscription */}
      {!planData || !isActive ? (
        <div className="mb-12 text-center py-16 bg-gray-50 rounded-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose a plan below to unlock premium features and get started.</p>
        </div>
      ) : null}

      {/* Upgrade / Choose Plan Section */}
      {/* <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            {planData && isActive ? "Upgrade or Change Plan" : "Choose Your Plan"}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        <PricingSection
          planName={planData?.plan_name ?? ""}
          initialData={pricingData ?? undefined}
        />
      </section> */}

      {/* Footer Manage Billing Link */}
      {portalUrl && planData && isActive && (
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600">
            Need to update payment details or view invoices?{" "}
            <button
              onClick={() => router.push(portalUrl)}
              className="font-medium text-primary hover:underline focus:outline-none"
            >
              Open Stripe Customer Portal
            </button>
          </p>
        </div>
      )}
    </div>
  );
}