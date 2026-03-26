"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaStar, FaSearch, FaLock, FaMapMarkerAlt } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface InfluencerProfile {
  id: number;
  display_name: string | null;
  profile_picture: string | null;
  short_bio: string | null;
  content_niches: string | null;
  insta_follower: number;
  tiktok_follower: number;
  youtube_follower: number;
  facebook_follower: number;
  linkedin_follower: number;
  blog_follower: number;
  rate_range_for_social_post: string | null;
  response_time: string | null;
  is_featured: boolean;
  timezone: string | null;
}

interface BrandProfile {
  id: number;
  business_name: string | null;
  logo: string | null;
  short_bio: string | null;
}

interface InfluencerAccount {
  id: number;
  user: UserDetails;
  is_verified: boolean;
  signed_up_as: "influencer" | "brand";
  influencer_profile: InfluencerProfile | null;
  brand_profile: BrandProfile | null;
}

const formatFollowers = (num: number | null | undefined) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};

export default function InfluencersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [influencers, setInfluencers] = useState<InfluencerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);        // ← changed initial value
  const [planName, setPlanName] = useState<string | null>(null);
  const [planChecked, setPlanChecked] = useState(false);
  const {user}=useAuthStore();
  console.log(user);
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsMember(true);
    } else {
      setIsMember(false);
      setPlanChecked(true); // no need to check plan if not logged in
    }
  }, []);

  // Fetch subscription plan only if logged in
  useEffect(() => {
    if (!isMember) return;

    const fetchUserPlan = async () => {
      try {
        const res = await apiClient("subscription_service/get_user_subscription_information/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setPlanName(res?.data?.plan_name || null);
        console.log(res?.data?.plan_name);
        
      } catch (error) {
        console.error("Failed to fetch user plan", error);
        setPlanName(null);
      } finally {
        setPlanChecked(true);
      }
    };

    fetchUserPlan();
  }, [isMember]);

  // Fetch featured influencers (public endpoint – no auth required)
  useEffect(() => {
    const fetchAllInfluencer = async () => {
      try {
        setLoading(true);
        const res = await apiClient("user_service/get_featured_influencers/", {
          method: "GET",
        });
        setInfluencers(res?.data || res || []);
      } catch (error) {
        console.error("Failed to fetch influencers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllInfluencer();
  }, []);

  const filteredInfluencers = influencers.filter((inf) => {
    const term = searchTerm.toLowerCase();
    const profile = inf.influencer_profile;
    return (
      profile?.display_name?.toLowerCase().includes(term) ||
      profile?.content_niches?.toLowerCase().includes(term) ||
      profile?.short_bio?.toLowerCase().includes(term)
    );
  });

  // Get the signed_up_as value from the user object if available
  const signedUpAs = (user as any)?.signed_up_as;

const hasValidPlan =
  (signedUpAs === "brand" &&
    (planName === "Brand" || planName === "Both")) ||
  (planName === "Both");

  // Access logic ─ only changed part
  const hasAccess    = planChecked && isMember && hasValidPlan;
  const needsUpgrade = planChecked && isMember && !hasValidPlan;
  const isLocked     = !isMember;

  console.log("hasAccess:", hasAccess, "needsUpgrade:", needsUpgrade, "isLocked:", isLocked);
  

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <main className="container mx-auto px-4 pt-16 lg:pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight">
                Grow with <br />
                <span className="text-primary">Micro-Influencers</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Reach real people through trusted voices. Micro-influencers bring
                authentic connections and strong engagement.
              </p>

              <div className="relative max-w-lg w-full mt-8 shadow-lg rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search by niche, name, or keywords..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="relative hidden lg:block">
              <Image
                width={800}
                height={600}
                src="/images/inf-hero.png"
                alt="Influencers Collage"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </main>
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-16 px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Micro-Influencers</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-primary h-10 w-10" />
          </div>
        ) : filteredInfluencers.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredInfluencers.map((inf) => {
              const profile = inf.influencer_profile;
              const totalFollowers = formatFollowers(
                (profile?.insta_follower || 0) +
                (profile?.tiktok_follower || 0) +
                (profile?.youtube_follower || 0)
              );

              return (
                <div
                  key={inf.id}
                  className="group relative bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="sm:w-48 h-48 sm:h-auto relative bg-gray-100">
                    <Image
                      src={profile?.profile_picture || "/images/person.jpg"}
                      alt={profile?.display_name || "Name"}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !hasAccess ? "blur-[4px]" : ""
                      }`}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-900 rounded-md shadow-sm uppercase truncate max-w-[120px] block">
                        {profile?.content_niches?.split(",")[0] || "Creator"}
                      </span>
                    </div>
                    {!hasAccess && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                          <FaLock className="text-gray-700 w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {hasAccess
                            ? profile?.display_name
                            : needsUpgrade
                            ? "Premium Profile"
                            : "Locked Profile"}
                        </h3>
                        {/* <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <FaMapMarkerAlt className="text-gray-400 w-3 h-3" />
                          {profile?.timezone || "Location Not Specified"}
                        </div> */}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex text-yellow-400 text-sm">
                          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {profile?.is_featured ? "Featured" : "New Talent"}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary mt-1">
                          {totalFollowers} Reach
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                      {profile?.short_bio || "No bio available."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Rate (Post)</p>
                        <p className="text-gray-900 font-semibold">
                          {profile?.rate_range_for_social_post
                            ? `$${profile.rate_range_for_social_post}`
                            : "Contact for rates"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Response</p>
                        <p className="text-gray-900 font-semibold">
                          {profile?.response_time || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {hasAccess ? (
                        <Link
                          href={`/microinfluencers/${inf.user?.id}`}
                          className="block w-full py-2.5 text-center rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                        >
                          View Full Profile
                        </Link>
                      ) : (
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="w-full py-2.5 text-center rounded-lg bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaLock className="w-3 h-3" />
                          {needsUpgrade ? "Upgrade Your Plan" : "Unlock to View"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900">No influencers found</h3>
            <button
              onClick={() => setSearchTerm("")}
              className="text-primary font-medium hover:underline mt-2"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      {/* Auth / Upgrade Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md bg-white p-6 rounded-xl shadow-2xl">
          <DialogHeader className="space-y-3 text-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {needsUpgrade ? "Upgrade Your Plan" : "Unlock Full Access"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-base">
              {needsUpgrade
                ? "You're logged in! Upgrade to a premium plan to access full influencer profiles."
                : "Sign up to unlock full profile details and start collaborations."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-6">
            {needsUpgrade ? (
              <Button
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/pricing");
                }}
              >
                View Plans & Upgrade
              </Button>
            ) : (
              <>
              <Button
                  className="w-full h-12 text-base font-semibold border-2 border-primary text-white hover:bg-primary hover:text-white"
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/signup?role=influencer&returnTo=/influencer-onboarding");
                  }}
                >
                  Sign up as Influencer
                </Button>
              <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-primary  text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/signup?role=brand&returnTo=/brand-onboarding");
                  }}
                >
                  Sign up as Brand
                </Button>
                
                
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/signup?role=both&returnTo=/brand-onboarding");
                  }}
                >
                  Sign up as Both
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-center pt-6 text-sm text-gray-500">
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/auth/login");
                }}
                className="text-secondary font-semibold hover:underline ml-1"
              >
                Log in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}