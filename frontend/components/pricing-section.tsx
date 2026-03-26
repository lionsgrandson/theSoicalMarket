"use client";

import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { SkeletonCard } from "./SkeletoCard";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSession } from "next-auth/react";
import LoginRequiredModal from "./LoginRequiredModal";
interface UserData {
  id: number;
  user: { email: string; first_name: string; last_name: string };
  signed_up_as: "influencer" | "brand";
  influencer_profile?: { profile_picture?: string; display_name?: string };
  brand_profile?: { logo?: string; display_name?: string };
}
// --- Interfaces based on your API Response ---
interface Price {
  price_id: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
}

interface Plan {
  product_id: string;
  name: string; // "Influencer" | "Brand" | "Both"
  description: string;
  prices: Price[];
}

export interface PricingApiResponse {
  status: string;
  code: number;
  data: Plan[];
  error: Record<string, unknown>;
  meta: { timestamp: string };
}

export function PricingSection({
  planName,
  initialData,
}: {
  initialData?: PricingApiResponse;
  planName: string;
}) {
  const pathname = usePathname();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>(initialData?.data || []);
  const [token, setToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const[currPlanName,setCurrPlanName]=useState();
    const [showAuthModal, setShowAuthModal] = useState(false);
const isLoading =
  plans.length === 0 ||

  (token !== null && userData === null && currPlanName === undefined);
  
  const { data: session, status: sessionStatus } = useSession(); 

  const fetchUser = async () => {
    const accessToken = localStorage.getItem("access_token");
    const token=(accessToken ) ?? null;
    setToken(token);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient("user_service/get_user_info/", {
        method: "GET",
        auth: true,
      });

      if (res.status === "success") {
        setUserData(res.data);
        console.log(res.data);
        
      } else {
        localStorage.removeItem("access_token");
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      localStorage.removeItem("access_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
    try {
      const res = await apiClient("subscription_service/get_user_subscription_information/", {
        method: "GET",
        auth: true,
      });
      setCurrPlanName(res?.data?.plan_name)
    } catch (error) {
      console.log("error",error);
      
    }
  };

  useEffect(() => {
    fetchUser();

    const handleStorageChange = () => fetchUser();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);


  
  

  useEffect(() => {
    if (initialData?.data && initialData.data.length > 0) {
      setPlans(initialData.data);
      setLoading(false);
    } else {
      // Fallback if data isn't passed immediately
      setLoading(false);
    }
  }, [initialData]);

  // --- Filtering & Sorting Logic ---
  const filteredPlans = plans
  .filter((plan) => {
    // If user already has a plan, apply upgrade logic
    if (currPlanName) {
      // If user has "Brand" or "Influencer", show only "Both" plan
      if (currPlanName === "Brand" || currPlanName === "Influencer") {
        return plan.name === "Both";
      }
      // If user has "Both", show all plans (existing logic)
      if (currPlanName === "Both") {
        return true;
      }
    }

    // If no existing plan (signup flow), filter by user type
    if (userData?.signed_up_as === "influencer") {
      return plan.name === "Influencer" || plan.name === "Both";
    }

    if (userData?.signed_up_as === "brand") {
      return plan.name === "Brand" || plan.name === "Both";
    }

    // fallback (public pricing or unknown plan)
    return true;
  })
  .sort((a, b) => {
    if (a.name === "Both") return 1;
    if (b.name === "Both") return -1;
    return 0;
  });


  // --- Helper Functions ---
  const getPriceForInterval = (prices: Price[]) => {
    return (
      prices.find((p) => p.interval === (isYearly ? "year" : "month")) ||
      prices[0]
    );
  };

  const calculateSavings = (prices: Price[]) => {
  const monthly = prices.find((p) => p.interval === "month");
  const yearly = prices.find((p) => p.interval === "year");

  if (!monthly || !yearly) return null;

  const monthlyTotal = monthly.amount * 12;
  const rawSavings =
    ((monthlyTotal - yearly.amount) / monthlyTotal) * 100;

  if (rawSavings <= 0) return null;

  const floored = Math.floor(rawSavings);

  const marketingFriendly = Math.floor(floored / 5) * 5;

  if (marketingFriendly < 5) return null;

  return `Save over ${marketingFriendly}%`;
};


  const handleCheckout = async (priceId: string) => {

     const token = localStorage.getItem("access_token");

  if (!token) {
    setShowAuthModal(true);
    return;
  }
    try {
      const res = await apiClient(
        "subscription_service/create_checkout_session/",
        {
          auth: true,
          method: "POST",
          body: JSON.stringify({ price_id: priceId,success_url:"http://thesocialmarket.ai/home_dashboard?success",cancel_url:"http://thesocialmarket.ai/home_dashboard?cancel" }),
        }
      );

      if (res.data && res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        toast("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast("Failed to create checkout session");
    }
  };

  const gridCols =
  filteredPlans.length === 1
    ? "md:grid-cols-1"
    : filteredPlans.length === 2
    ? "md:grid-cols-2"
    : "md:grid-cols-3";
const isSinglePlan = filteredPlans.length === 1;

  // --- Loading State ---
  if (isLoading) {
    return (
      <section className="px-4 py-16 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  // --- Empty/Error State ---
  if (error || filteredPlans.length === 0) {
    return (
      <section className="px-4 py-16">
        <div className="mx-auto text-center">
          <p className="text-lg text-red-600">
            {error || "No applicable plans found for your account type."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[40px] font-bold text-primary mb-4">
            Flexible Plans For Everyone
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Pick the plan that works best for you. Cancel anytime.
          </p>

          {/* Toggle Button */}
          <div className="inline-flex bg-gray-100 rounded-full shadow-sm p-1 transition-all duration-300">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200
                ${
                  !isYearly
                    ? "bg-primary text-white shadow-md scale-105"
                    : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200
                ${
                  isYearly
                    ? "bg-primary text-white shadow-md scale-105"
                    : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid  grid-cols-1 ${gridCols}  gap-8 max-w-7xl mx-auto ${
    isSinglePlan ? "place-items-center" : ""}`}>
          {filteredPlans.map((plan) => {
            const price = getPriceForInterval(plan.prices);
            const savings = isYearly ? calculateSavings(plan.prices) : null;

            // UI Title Mapping
            const titleMap: Record<string, string> = {
              Influencer: "Continue as an Influencer",
              Brand: "Continue as a Brand",
              Both: "Influencer + Brand Account",
            };

            return (
              <div
                key={plan.product_id}
                className="bg-[#f6f8fa] rounded-2xl shadow-lg border border-gray-200 overflow-hidden 
                hover:border-primary hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-2 
                transition-all duration-300 flex flex-col"
              >
                <div className="p-8 text-center flex flex-col flex-grow">
                  {/* Plan Name */}
                  <h3 className="md:text-[26px] text-[22px] font-semibold text-primary mb-8 min-h-[70px] flex items-center justify-center">
                    {titleMap[plan.name] || plan.name}
                  </h3>

                  {/* Price Display */}
                  <div className="mb-6 min-h-[90px] flex items-end justify-center">
                    <span className="md:text-[64px] text-3xl font-semibold text-primary leading-none">
                      ${price?.amount?.toFixed(0) || 0}
                    </span>
                    <span className="text-[28px] text-primary font-semibold ml-1 leading-none">
                      /{isYearly ? "Year" : "month"}
                    </span>
                  </div>

                  {/* Savings Badge */}
                  <div className="mb-4 min-h-[24px]">
                    {savings && (
                      <span className="text-red-500 font-semibold text-xl">
                        {savings}
                      </span>
                    )}
                    {/* Hardcoded extra discount logic for 'Both' plan if needed */}
                    {!isYearly && plan.name === "Both" && (
                      <span className="text-red-500 font-semibold text-xl">
                        Save 15%
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-primary text-[18px] mb-8 leading-relaxed flex-grow px-4">
                    {plan.description}
                  </p>

                  {/* Checkout Button */}
                  <button
                    className={`w-full cursor-pointer text-white font-semibold py-4 rounded-lg transition-colors duration-200
                      ${
                        plan.name === planName
                          ? "bg-secondary text-primary"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    onClick={() => handleCheckout(price.price_id)}
                  >
                    {plan.name === planName ? "Current Plan" : "Select Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    <LoginRequiredModal
  open={showAuthModal}
  onClose={() => setShowAuthModal(false)}
/>

    </section>
  );
}