"use client";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import Link from "next/link";
import { FaEdit, FaPlus } from "react-icons/fa";
import { TbMessageCircleFilled } from "react-icons/tb";
import { useEffect, useRef, useState, Suspense } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  X,
  Calendar,
  Paperclip,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import { usePathname, useSearchParams } from "next/navigation";
import { useNotificationStore } from "@/stores/useNotificationStore";
import Swal from "sweetalert2";

// --- Interfaces ---
interface User {
  influencer_profile?: InfluencerProfileInfo | null;
  user?: {
    first_name?: string;
    last_name?: string;
  };
}

interface Attachment {
  id: number;
  link: string;
}

interface Campaign {
  id: number;
  campaign_id: number;
  owner_id: number;
  hired_influencer_id: number;
  start_date: string;
  end_date: string;
  proposal_message: string;
  campaign_deliverables: string | null;
  attachments: Attachment[] | null;
  is_accepted_by_influencer?: boolean;
  budget: number;
  campaign: {
    campaign_name: string;
    id: number;
  };
  timestamp:string | Date;
  isBudgetNegotiable:Boolean;
}

interface InfluencerProfileInfo {
  profile_picture?: string | null;
  display_name?: string;
  content_niches?: string;
}

interface RoomData {
  room_id: string;
  other_user_id: string;
  other_user_avatar?: string | null;
  name?: string | null;
  last_message?: string | null;
  timestamp: string;
  brand_logo?: string | null;
  unread_count?: number;
  is_online?: boolean;
  profile_picture?: string;
  seen?: boolean;
}
const getSafeImageSrc = (src?: string) => {
  if (
    !src ||
    src === "profile_picture" ||
    src === "null" ||
    src === "undefined"
  ) {
    return "";
  }
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
};
function timeAgo(dateString: string | Date): string {
  // Ensure we have a Date object
  const past: Date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now: Date = new Date();

  if (isNaN(past.getTime())) return "Invalid date"; // type-safe check

  const diffInMs: number = now.getTime() - past.getTime();

  const diffInMinutes: number = Math.floor(diffInMs / (1000 * 60));
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;

  const diffInHours: number = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays: number = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 1) return "Yesterday";

  return `${diffInDays} days ago`;
}

function InfluencerDashboardContent() {
  const [influencerProfile, setInfluencerProfile] =
    useState<InfluencerProfileInfo | null>(null);
  const [roomData, setRoomData] = useState<RoomData[]>([]);

  // --- Campaign States ---
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [brandMap, setBrandMap] = useState<Record<number, any>>({});

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [campaignActionLoading, setCampaignActionLoading] = useState<{
    id: number | null;
    action: "accept" | "reject" | null;
  }>({ id: null, action: null });
  console.log(user, "name", user?.user?.first_name);
  const unread = useNotificationStore((s) => s.unreadCount);
  const noti = useNotificationStore((s) => s.notifications);
  console.log(unread, "message notification", noti);
  const proposalRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  // const store = useAuthStore.getState();
  useEffect(() => {
    const section = searchParams.get("scrollTo");

    if (section === "proposal" && proposalRef.current) {
      proposalRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [searchParams]);
  // 1. Fetch User Info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient("user_service/get_user_info/", {
          method: "GET",
          auth: true,
        });
        // store.setUser(res.data);
        setUser(res.data);
      } catch (error) {
        console.error("❌ API Error:", error);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch Rooms (Messages)
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const res = await apiClient("chat_service/get_my_rooms/", {
          method: "GET",
          auth: true,
        });
        setRoomData(res.data);
      } catch (error) {
        console.error("❌ API Error:", error);
      }
    };
    fetchAllRooms();
  }, []);

  // 3. Fetch Campaigns (Proposals)
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await apiClient(
          "campaign_service/get_my_previous_where_i_was_hired/",
          {
            method: "GET",
            auth: true,
          }
        );
        if (res.data) {
          console.log("All proposals",res.data);

          setCampaigns(res.data);
        }
      } catch (error) {
        console.error("❌ Campaign Fetch Error:", error);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, []);

  // fetch brand information
  useEffect(() => {
    if (!campaigns.length) return;

    const fetchBrands = async () => {
      try {
        // 1️⃣ unique owner ids
        const ownerIds = [
          ...new Set(campaigns.map((c) => c.owner_id).filter(Boolean)),
        ];

        // 2️⃣ fetch all brands in parallel
        const results = await Promise.allSettled(
          ownerIds.map((id) =>
            apiClient(`user_service/get_a_influencer/${id}/`, {
              method: "GET",
              auth: true,
            })
          )
        );

        const map: Record<number, any> = {};

      results.forEach((result) => {
        // Only process fulfilled (successful) requests
        if (result.status === "fulfilled" && result.value?.data) {
          const userData = result.value.data;
          map[userData.user.id] = userData;
        }
        // Rejected ones (404s) are simply skipped
      });

        console.log("All Brand", map);

        setBrandMap(map);
      } catch (error) {
        console.error("❌ Brand fetch error:", error);
      }
    };

    fetchBrands();
  }, [campaigns]);

  // --- Helper Functions ---
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const e = new Date(end).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${s} - ${e}`;
  };

  // --- Action Handler (Accept/Reject Offer) ---
  const handleCampaignAction = async (
    campaignId: number,
    action: "accept" | "reject"
  ) => {
    if (action === "accept") {
      setCampaignActionLoading({ id: campaignId, action: "accept" });
      try {
        // 1. Call API
        const res = await apiClient(
          `campaign_service/accept_offer/${campaignId}/`,
          {
            method: "PATCH",
            auth: true,
          }
        );

        // 2. Handle Success
        if (res?.code === 200 || res?.status === "success") {
          // 3. Update Local State: Mark this campaign as Accepted (do not remove it)
          setCampaigns((prevCampaigns) =>
            prevCampaigns.map((camp) =>
              camp.id === campaignId
                ? { ...camp, is_accepted_by_influencer: true }
                : camp
            )
          );

          toast(res.data?.message || "Successfully Accepted the offer! 🎉");
          setSelectedCampaign(null);
        } else {
          toast("Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error("Accept Error:", error);
        toast("Failed to accept the offer. Please try again.");
      } finally {
        setCampaignActionLoading({ id: null, action: null });
      }
    } else if (action === "reject") {
      Swal.fire({
        title: "Reject Campaign?",
        text: "Are you sure you want to reject this campaign? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Reject",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setCampaignActionLoading({ id: campaignId, action: "reject" });
          try {
            // Call reject API
            const res = await apiClient(
              `campaign_service/reject_offer/${campaignId}/`,
              {
                method: "PATCH",
                auth: true,
              }
            );

            // Handle Success
            if (res?.code === 200 || res?.status === "success") {
              // Remove rejected campaign from local state
              setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));

              // Show success sweetalert
              Swal.fire({
                title: "Campaign Rejected!",
                text:
                  res.data?.message ||
                  "Campaign has been rejected successfully.",
                icon: "success",
                confirmButtonColor: "#10b981",
                confirmButtonText: "OK",
              });

              setSelectedCampaign(null);
            } else {
              Swal.fire({
                title: "Error",
                text: "Something went wrong. Please try again.",
                icon: "error",
                confirmButtonColor: "#d32f2f",
              });
            }
          } catch (error) {
            console.error("Reject Error:", error);
            Swal.fire({
              title: "Error",
              text: "Failed to reject the offer. Please try again.",
              icon: "error",
              confirmButtonColor: "#d32f2f",
            });
          } finally {
            setCampaignActionLoading({ id: null, action: null });
          }
        }
      });
    }
  };

  const unReadMessage = roomData.filter((room) => room.seen == false);

  console.log(campaigns);

  const acceptedCampaign = campaigns.filter(
    (campaign) => campaign.is_accepted_by_influencer == true
  );

  const totalEarnings = acceptedCampaign.reduce(
    (acc, curr) => acc + curr.budget,
    0
  );
  const profileSrc: string =
    typeof user?.influencer_profile?.profile_picture === "string" &&
    user.influencer_profile.profile_picture !== ""
      ? user.influencer_profile.profile_picture
      : "/images/person.jpg";

  const initial =
  typeof user?.influencer_profile?.display_name === "string"
    ? user.influencer_profile.display_name[0].toUpperCase()
    : typeof user?.user?.first_name === "string"
    ? user.user.first_name[0].toUpperCase()
    : "N";

const avatarLetter = initial.toUpperCase();


      

  return (
    <div className="relative">
      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6 transition-shadow hover:shadow-lg">
          {/* --- Top Row: Greeting + Action --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Greeting + Profile */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                {profileSrc && profileSrc !== "/images/person.jpg" ? (
                  <Image
                    src={profileSrc}
                    width={64}
                    height={64}
                    alt={initial  || "Profile" }
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {avatarLetter}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Welcome back,{" "}
                  {
                    (user?.influencer_profile?.display_name ||
                      user?.user?.first_name ||
                      "Friend") as string
                  }
                  ! 👋
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  Ready to grow your influence today?
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-2">
              <Link
          href="/influencer-dashboard/campaigns"
          className="flex items-center gap-1.5 bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 text-sm px-4 py-2 rounded-lg transition-all font-semibold shadow-sm active:scale-95"
        >
          <Search className="w-4 h-4" />
          Search Campaigns
        </Link>
              <Link
                href="/influencer-dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-medium rounded-lg bg-secondary  text-primary transition"
              >
                <FaEdit /> Edit Profile
              </Link>
            </div>
          </div>

          {/* --- Stats Cards --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
  {[
    {
      value: campaigns.length,
      label: "Total Campaigns",
      icon: "📊",
      bgColor: "bg-secondary",
      textColor: "text-primary",
      href: "/influencer-dashboard/campaigns",
    },
    {
      value: `$${totalEarnings}`,
      label: "Earnings",
      icon: "💰",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      value: unReadMessage.length,
      label: "New Messages",
      icon: "✉️",
      bgColor: "bg-[#fefce9]",
      textColor: "text-primary",
    },
  ].map((item, index) => {
    const CardContent = (
      <div
        className={`rounded-xl p-5 flex flex-col items-center justify-center gap-2 ${item.bgColor}`}
      >
        <div className={`text-3xl font-bold ${item.textColor}`}>
          {item.value}
        </div>
        <div className={`text-sm font-medium ${item.textColor} flex items-center gap-1`}>
          <span>{item.icon}</span> {item.label}
        </div>
      </div>
    );

    return item.href ? (
      <Link key={index} href={item.href} className="block">
        {CardContent}
      </Link>
    ) : (
      <div key={index}>{CardContent}</div>
    );
  })}
</div>

        </div>

        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            {/* --- My Campaigns Section --- */}
            <div
              ref={proposalRef}
              id="proposal"
              className=" border-[#E5E7EB] shadow border-[1px] rounded p-6 h-[420px] flex flex-col"
            >
              <div className="flex items-center space-x-2 mb-4 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">
                  Proposals Received{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({campaigns.length})
                  </span>
                </h2>
              </div>

              {/* Scrollable List */}
              <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {loadingCampaigns ? (
                  <div className="text-center py-10 text-gray-500">
                    Loading proposal...
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No proposal found.
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                      className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors group ${
                        campaign.is_accepted_by_influencer
                          ? "bg-green-50 border-green-200"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                            {campaign.campaign?.campaign_name}
                          </h3>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                            #{campaign.campaign_id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Brand:{" "}
                          {brandMap[campaign.owner_id] ? (
                            <a
                              href={`/influencer-dashboard/brand/${campaign.owner_id}`}
                              className="text-primary font-medium hover:underline"
                            >
                              {brandMap[campaign.owner_id]?.brand_profile
                                ?.business_name ||
                                brandMap[campaign.owner_id]?.user?.first_name}
                            </a>
                          ) : (
                            <span className="text-gray-400">Brand unavailable</span>
                          )}
                        </p>

                        <p className="text-sm text-gray-500 line-clamp-1">
                          {campaign.proposal_message || "No Message provided"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateRange(
                            campaign.start_date,
                            campaign.end_date
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {campaign.is_accepted_by_influencer ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-200 rounded-full px-3 py-1">
                            <CheckCircle className="w-3 h-3" />
                            Accepted
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-primary bg-secondary rounded px-4 py-2">
                            View Offer
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="border-[#E5E7EB] shadow border-[1px] rounded p-6 ">
              <div className="flex items-center space-x-2 mb-4">
                <TbMessageCircleFilled className="text-secondary text-[24px]" />
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              </div>
              <div className="space-y-4">
                {roomData.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages found
                  </div>
                ) : (
                  roomData.slice(0, 2).map((room, index) => {
                    const profile_picture = getSafeImageSrc(
                      room.profile_picture
                    );
                    const name = room.name || "Avatar";
                    const otherUserId = room?.other_user_id;

                    return (
                      <Link
                        href={`/influencer-dashboard/messages?id=${otherUserId}`}
                        key={room.room_id || index}
                      >
                        <div className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-0">
                          {profile_picture ? (
                            <Image
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                              src={profile_picture}
                              alt={name}
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900 truncate">
                                {room.name ||
                                  room.other_user_id ||
                                  "Unknown User"}
                              </span>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatTime(room.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {room.last_message || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6"></div>

          {/* Content Niche */}
          <div className="w-full">
            <div className="border-[#E5E7EB] shadow border-[1px] mt-4 rounded p-6 ">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-secondary">
                  <FaPlus />
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  Content Niche
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const niches = user?.influencer_profile?.content_niches;

                  // Check if niches exists and is a string
                  if (!niches || typeof niches !== "string") {
                    return (
                      <span className="text-center text-gray-500">
                        No Niches Added
                      </span>
                    );
                  }

                  // Check if string is not empty
                  if (niches.trim() === "") {
                    return (
                      <span className="text-center text-gray-500">
                        No Niches Added
                      </span>
                    );
                  }

                  // Parse and display niches
                  const nicheLines = niches
                    .split("\n")
                    .filter((line) => line.trim().length > 0);

                  if (nicheLines.length === 0) {
                    return (
                      <span className="text-center text-gray-500">
                        No Niches Added
                      </span>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {nicheLines.map((niche, index) => (
                        <div
                          key={`niche-${index}`}
                          className="text-center text-gray-500"
                        >
                          {niche.trim()}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Campaign Detail Modal --- */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-primary rounded-full"></div>
                  <h3 className="text-sm font-semibold uppercase text-gray-700 ">
                    Proposal Details
                  </h3>
                </div>

                <div className="space-y-2.5 pl-3">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-sm font-semibold text-primary min-w-[100px]">
                      Campaign ID:
                    </span>
                    <span className="text-sm  text-gray-700 bg-primary/10 px-2 py-0.5 rounded">
                      #{selectedCampaign?.campaign?.id}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-sm font-semibold text-primary min-w-[100px]">
                      Campaign Title:
                    </span>
                    <span className="text-sm text-gray-700">
                      {selectedCampaign?.campaign?.campaign_name}
                    </span>
                  </div>
                  <p className="text-sm text-primary font-semibold mt-1">
                    Brand:{" "}
                    {brandMap[selectedCampaign.owner_id] ? (
                      <a
                        href={`influencer-dashboard/brand/${selectedCampaign.owner_id}`}
                        className="text-primary font-medium tracking-wide underline"
                      >
                        {brandMap[selectedCampaign.owner_id]?.brand_profile
                          ?.business_name ||
                          brandMap[selectedCampaign.owner_id]?.user?.first_name}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not Exist</span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-baseline gap-1">
    <span className="text-sm font-semibold text-primary ">
      Received:
    </span>
    <span className="text-sm text-gray-600">
      {selectedCampaign.timestamp
        ? timeAgo(selectedCampaign.timestamp)
        : "N/A"}
    </span>
  </div>
                  
                </div>
                
                
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Date Section */}
                <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-xl border border-blue-100">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Timeline
                    </p>
                    <p className="text-sm text-primary mt-1">
                      {formatDateRange(
                        selectedCampaign.start_date,
                        selectedCampaign.end_date
                      )}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-sm uppercase tracking-wider text-gray-700">
                  <h4 className="m-0">
    Budget:{" "}
    {selectedCampaign?.isBudgetNegotiable || selectedCampaign.budget === 0
      ? "Open to discussion"
      : `$${selectedCampaign.budget}`}
  </h4>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm tracking-wider uppercase mb-2">
                    Content Deliverables
                  </h4>
                  {selectedCampaign.campaign_deliverables &&
                    (() => {
                      try {
                        const deliverablesArray =
                          typeof selectedCampaign.campaign_deliverables ===
                          "string"
                            ? JSON.parse(selectedCampaign.campaign_deliverables)
                            : selectedCampaign.campaign_deliverables;

                        // 2. Render the array
                        if (Array.isArray(deliverablesArray)) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {deliverablesArray.map(
                                (item: string, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-blue-100 capitalize"
                                  >
                                    {/* 3. Format "socialPost" to "Social Post" using Regex */}
                                    {item.replace(/([A-Z])/g, " $1").trim()}
                                  </span>
                                )
                              )}
                            </div>
                          );
                        }
                        return null;
                      } catch (e) {
                        console.error("Error parsing deliverables", e);
                        return (
                          <p className="text-sm text-gray-500">
                            No deliverables specified
                          </p>
                        );
                      }
                    })()}
                </div>

                {/* Proposal Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Proposal Message
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCampaign.proposal_message || "No Message"}
                  </div>
                </div>

                {/* Attachments Section */}
                {selectedCampaign.attachments &&
                  selectedCampaign.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" /> Attachments
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedCampaign.attachments.map((att) => (
                          <Link
                            href={att.link}
                            key={att.id}
                            target="_blank"
                            className="group relative block overflow-hidden rounded-lg border border-gray-200 hover:border-primary transition-colors"
                          >
                            <div className="aspect-video bg-gray-100 relative">
                              {/* Simple check for image extension for preview, otherwise generic icon */}
                              {/\.(jpg|jpeg|png|gif|webp)$/i.test(att.link) ? (
                                <Image
                                  src={att.link}
                                  alt="Attachment"
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <Paperclip className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white text-xs text-center text-gray-600 truncate px-2">
                              View Attachment {att.id}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
              {/* Only show actions if not already accepted (or handle UI state) */}
              {selectedCampaign.is_accepted_by_influencer ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl font-bold">
                  <CheckCircle className="w-5 h-5" />
                  Offer Accepted
                </div>
              ) : (
                <>
                  <button
                    disabled={
                      campaignActionLoading.id === selectedCampaign.id &&
                      campaignActionLoading.action === "reject"
                    }
                    onClick={() =>
                      handleCampaignAction(selectedCampaign.id, "reject")
                    }
                    className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-700 bg-white hover:bg-red-50 rounded-xl font-semibold transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    {campaignActionLoading.id === selectedCampaign.id &&
                    campaignActionLoading.action === "reject" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Rejecting…
                      </>
                    ) : (
                      <>Reject</>
                    )}
                  </button>
                  <button
                    disabled={campaignActionLoading.id === selectedCampaign.id}
                    onClick={() =>
                      handleCampaignAction(selectedCampaign.id, "accept")
                    }
                    className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {campaignActionLoading.id === selectedCampaign.id &&
                    campaignActionLoading.action === "accept" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Accepting…
                      </>
                    ) : (
                      <>Accept Campaign</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <InfluencerDashboardContent />
    </Suspense>
  );
}
