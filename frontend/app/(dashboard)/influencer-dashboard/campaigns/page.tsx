"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  DollarSign,
  CircleCheck,
  X,
  CheckCircle,
  XCircle,
  Paperclip,
  Calendar,
  Megaphone,
  ArrowRight,
  Target,
  Clock,
  ChevronDown,
} from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// --- Interfaces ---
type AnalyticsSection = "active" | "invitations" | null;

interface Attachment {
  id: number;
  link: string;
}

// Interface for "get_all_camaign_of_all_users" (Marketplace)
interface PublicCampaign {
  id: number;
  campaign_name: string;
  campaign_description: string;
  campaign_objective: string;
  budget_range: string;
  budget_type: string;
  campaign_timeline: string;
  content_deliverables: string;
  payment_preference: string;
  content_approval_required: boolean;
  auto_match_micro_influencers: boolean;
  target_audience: string;
  keywords_and_hashtags: string;
  campaign_status: string;
  campaign_owner?: number;
  campaign_poster: string | null;
  timestamp: string;
  attachments: Attachment[];
  owner_id: number;
  campaign: {
    campaign_name: string;
    campaign_owner: number;
  };
}

// Interface for "get_my_previous_where_i_was_hired" (Your specific jobs)
interface HiredCampaign {
  id: number;
  owner_id: number;
  hired_influencer_id: number;
  start_date: string;
  end_date: string;
  proposal_message: string;
  campaign_deliverables: string;
  attachments: Attachment[];
  is_accepted_by_influencer: boolean;
  is_completed_marked_by_brand: boolean;
  budget: number;
  rating: number;
  campaign_id: number;
  campaign: {
    campaign_name: string;
    campaign_owner: number;
  };
  timestamp: string | Date;
  campaign_owner?: number;
  isBudgetNegotiable: Boolean;
}

function timeAgo(dateString: string | Date): string {
  // Ensure we have a Date object
  const past: Date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const now: Date = new Date();

  if (isNaN(past.getTime())) return "Invalid date"; // type-safe check

  const diffInMs: number = now.getTime() - past.getTime();

  const diffInMinutes: number = Math.floor(diffInMs / (1000 * 60));
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;

  const diffInHours: number = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24)
    return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays: number = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 1) return "Yesterday";

  return `${diffInDays} days ago`;
}

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [platformFilter, setPlatformFilter] = useState("All Platforms");

  // State for Marketplace Campaigns
  const [publicCampaigns, setPublicCampaigns] = useState<PublicCampaign[]>([]);

  // Search State
  const [searchResults, setSearchResults] = useState<PublicCampaign[] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

  // State for My Jobs (Invitations + Active)
  const [hiredCampaigns, setHiredCampaigns] = useState<HiredCampaign[]>([]);

  // Selected Campaign for Modal (Can be either type)
  const [selectedCampaign, setSelectedCampaign] = useState<
    PublicCampaign | HiredCampaign | null
  >(null);
  const [selectedType, setSelectedType] = useState<"public" | "hired" | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingHired, setLoadingHired] = useState(true);

  // Pagination for Public Campaigns
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [campaignActionLoading, setCampaignActionLoading] = useState<{
    id: number | null;
    action: "accept" | "reject" | null;
  }>({ id: null, action: null });
  const [brandMap, setBrandMap] = useState<Record<number, any>>({});

const [openSection, setOpenSection] = useState<AnalyticsSection>(null);
const analyticsRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const ITEMS_PER_PAGE = 9;

  // --- Search Handler ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const res = await apiClient("campaign_service/search_campaign/", {
        method: "POST",
        body: JSON.stringify({ campaign_name: searchQuery }),
        auth: true,
      });

      if (res.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Failed to search campaigns.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  // --- Fetch Hired Campaigns (Invitations & Active) ---
  useEffect(() => {
    const fetchHiredCampaigns = async () => {
      try {
        const res = await apiClient(
          "campaign_service/get_my_previous_where_i_was_hired/",
          {
            method: "GET",
            auth: true,
          }
        );
        if (res.data) {
          setHiredCampaigns(res.data);
        }
      } catch (error) {
        console.error("❌ Hired Campaign Fetch Error:", error);
      } finally {
        setLoadingHired(false);
      }
    };
    fetchHiredCampaigns();
  }, []);

  // fetch brand information
  useEffect(() => {
    if (!hiredCampaigns.length) return;

    const fetchBrands = async () => {
      try {
        // 1️⃣ unique owner ids
        const ownerIds = [
          ...new Set(hiredCampaigns.map((c) => c.owner_id).filter(Boolean)),
        ];

        // 2️⃣ fetch all brands in parallel
        const responses = await Promise.all(
          ownerIds.map((id) =>
            apiClient(`user_service/get_a_influencer/${id}/`, {
              method: "GET",
              auth: true,
            })
          )
        );

        // 3️⃣ build lookup map
        const map: Record<number, any> = {};
        responses.forEach((res) => {
          if (res?.data) {
            map[res.data.user.id] = res.data;
          }
        });

        console.log("All Brand", map);

        setBrandMap(map);
      } catch (error) {
        console.error("❌ Brand fetch error:", error);
      }
    };

    fetchBrands();
  }, [hiredCampaigns]);

  // --- Fetch Public Campaigns ---
  useEffect(() => {
    const fetchAllCampaigns = async () => {
      try {
        setLoadingPublic(true);
        const res = await apiClient(
          `campaign_service/get_all_camaign_of_all_users/?page=${currentPage}`,
          {
            auth: true,
            method: "GET",
          }
        );

        if (res.status === "success" && res.data.results) {
          setPublicCampaigns(res.data.results);
          setTotalCount(res.data.count);
          setNextUrl(res.data.next);
          setPreviousUrl(res.data.previous);
        }
      } catch (error) {
        console.error("Failed to fetch public campaigns:", error);
      } finally {
        setLoadingPublic(false);
      }
    };

    fetchAllCampaigns();
  }, [currentPage]);

  // --- Calculations & Logic ---

  // 1. Calculate Progress
  const calculateProgress = (
    startDateStr: string,
    endDateStr: string
  ): number => {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;
    if (end === start) return 100; // Avoid division by zero

    const totalDuration = end - start;
    const elapsed = now - start;

    return Math.round((elapsed / totalDuration) * 100);
  };

  // 2. Filter Hired Campaigns
  const invitations = hiredCampaigns.filter(
    (c) => !c.is_accepted_by_influencer
  );
  const activeCampaigns = hiredCampaigns.filter(
    (c) => c.is_accepted_by_influencer && !c.is_completed_marked_by_brand
  );
  const completedCampaigns = hiredCampaigns.filter(
    (c) => c.is_completed_marked_by_brand
  );

  const totalEarnings = hiredCampaigns.reduce(
    (acc, curr) => acc + curr.budget,
    0
  );

  // 3. Filter Public Campaigns (Search)
  const filteredPublicCampaigns = publicCampaigns.filter((campaign) => {
    // const matchesSearch =
    //   campaign.campaign_name
    //     ?.toLowerCase()
    //     .includes(searchQuery.toLowerCase()) ||
    //   campaign.campaign_description
    //     ?.toLowerCase()
    //     .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      campaign.campaign_status?.toLowerCase() === statusFilter.toLowerCase();
    
    return  matchesStatus;
  });

  // --- Handlers ---

  const handleViewDetails = (
    campaign: PublicCampaign | HiredCampaign,
    type: "public" | "hired"
  ) => {
    setSelectedCampaign(campaign);
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
    setSelectedType(null);
  };

  const handleConnectWithOwner = () => {
    if (selectedCampaign) {
      // Logic depends on which ID is the owner.
      // HiredCampaign has `owner_id`, PublicCampaign has `campaign_owner`
      const ownerId =
        "owner_id" in selectedCampaign
          ? selectedCampaign.owner_id
          : (selectedCampaign as PublicCampaign)?.campaign_owner;
      router.push(`/influencer-dashboard/messages?id=${ownerId}`);
    }
  };

  const handleCampaignAction = async (
    campaignId: number,
    action: "accept" | "reject"
  ) => {
    if (action === "accept") {
      try {
        const res = await apiClient(
          `campaign_service/accept_offer/${campaignId}/`,
          {
            method: "PATCH",
            auth: true,
          }
        );

        if (res?.code === 200 || res?.status === "success") {
          // ✅ Update State Locally to reflect change instantly
          setHiredCampaigns((prev) =>
            prev.map((c) =>
              c.id === campaignId
                ? { ...c, is_accepted_by_influencer: true }
                : c
            )
          );

          toast(res.data?.message || "Offer Accepted! 🎉");
          handleCloseModal();
        } else {
          alert("Something went wrong.");
        }
      } catch (error) {
        console.error("Accept Error:", error);
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
              setHiredCampaigns((prev) =>
                prev.filter((c) => c.id !== campaignId)
              );

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

  // --- Helpers ---
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


  const handleSectionClick = (section: AnalyticsSection) => {
  setOpenSection((prev) => (prev === section ? null : section));

  setTimeout(() => {
    analyticsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Management
        </h1>
        <p className="text-gray-600 hidden md:block">
          Collaborate with campaigns
        </p>
        <h2 className="text-xl font-bold text-slate-700 mt-4">Analytics</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Campaigns"
          value={activeCampaigns.length.toString()}
          subtitle="Currently running"
          icon={<div className="flex items-center gap-2">
      <Megaphone className="w-8 h-8 text-primary" />
      <ChevronDown className="w-4 h-4 text-gray-400 md:hidden" />
    </div>}
          onClick={()=>handleSectionClick("active")}
          className="shadow-sm
    active:scale-[0.98]
    active:bg-gray-50"
        />
        <StatCard
          title="Completed"
          value={completedCampaigns.length.toString()}
          subtitle="Total completed"
          icon={<CircleCheck className="w-8 h-8 text-primary" />}
        />
        <StatCard
          title="Invitations"
          value={invitations.length.toString()}
          subtitle="Pending offers"
          icon={<div className="flex items-center gap-2">
      <Paperclip className="w-8 h-8 text-primary" />
      <ChevronDown className="w-4 h-4 text-gray-400 md:hidden" />
    </div>}
          onClick={() => handleSectionClick("invitations")}
          className="shadow-sm
    active:scale-[0.98]
    active:bg-gray-50"
    
        />
        <StatCard
          title="Total Earnings"
          value={`$${totalEarnings}`}
          icon={<DollarSign className="w-8 h-8 text-primary" />}
        />
      </div>

      <div ref={analyticsRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6  `}>
        {/* 1. Campaign Invitations */}
        {
<div className={`border rounded-lg p-4 h-[400px] flex flex-col  ${openSection === "invitations" ? "block" : "hidden"}
    lg:block `}>
          <h2 className="text-lg font-semibold mb-4">
            Campaign Invitations ({invitations.length})
          </h2>
          <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
            {loadingHired ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No pending invitations.
              </div>
            ) : (
              invitations.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleViewDetails(campaign, "hired")}
                  className="flex justify-between items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                        {campaign?.campaign?.campaign_name}
                      </h3>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        #{campaign?.campaign_id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {campaign.proposal_message || "No description provided"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateRange(campaign.start_date, campaign.end_date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white bg-secondary rounded px-4 py-2">
                      View Offer
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          
        }
        
{
  <div className={`border rounded-lg p-4 h-[400px] flex flex-col ${openSection === "active" ? "block" : "hidden"}
    lg:block`}>
          <h2 className="text-lg font-semibold mb-4">
            My Active Campaigns ({activeCampaigns.length})
          </h2>
          <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
            {activeCampaigns.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No active campaigns.
              </div>
            ) : (
              activeCampaigns.map((item, i) => {
                const progress = calculateProgress(
                  item.start_date,
                  item.end_date
                );
                return (
                  <div
                    key={i}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewDetails(item, "hired")}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                          {item?.campaign?.campaign_name}
                        </h3>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                          #{item?.campaign_id}
                        </span>
                      </div>
                      {/* <div>
                        <h3 className="font-medium">Campaign #{item.id}</h3>
                        <p className="text-sm text-gray-500">
                          Brand ID: {item.owner_id}
                        </p>
                      </div> */}
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800">
                        {progress === 100 ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">
                        Deadline:{" "}
                        {new Date(item.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-secondary font-semibold">{`$${item.budget}`}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
}
        {/* 2. My Active Campaigns */}
        
      </div>

      {/* Search and Filters for Marketplace */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">
        Explore Marketplace
      </h2>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search public campaigns..."
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
            {searchResults && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Public Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {loadingPublic || isSearching ? (
          <div className="col-span-full text-center py-8 text-gray-600">
            {isSearching ? "Searching campaigns..." : "Loading..."}
          </div>
        ) : (searchResults || filteredPublicCampaigns).length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-600">
            No campaigns found
          </div>
        ) : (
          (searchResults || filteredPublicCampaigns).map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
                <Image
                  fill
                  src={campaign.campaign_poster || "/images/placeholder.jpg"}
                  alt={campaign.campaign_name || "Campaign"}
                  className=" object-cover"
                />
                <div
                  className={`absolute top-2 right-2 ${
                    campaign.campaign_status === "active"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }  rounded-full px-3 py-1 text-xs font-semibold capitalize`}
                >
                  {campaign.campaign_status}
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl     transition-all duration-300">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00786f]/5 to-transparent opacity-0  transition-opacity duration-300" />

                <div className="group relative overflow-hidden rounded-2xl     transition-all duration-300">
                  {/* Subtle hover overlay with your primary color */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d2f4f]/5 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none" />

                  <div className="p-6 relative">
                    {/* Campaign Name */}
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-[#0d2f4f] transition-colors duration-200">
                      {campaign.campaign_name}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {campaign.campaign_description}
                    </p>

                    {/* Key Metrics Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-6">
                      {/* Budget */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#0d2f4f]/10 rounded-xl">
                          <DollarSign className="w-5 h-5 text-[#0d2f4f]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Budget
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            ${campaign.budget_range}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#0d2f4f]/10 rounded-xl">
                          <Clock className="w-5 h-5 text-[#0d2f4f]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timeline
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {campaign.campaign_timeline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Objective */}
                    <div className="mt-6 flex items-start gap-3">
                      <div className="p-2.5 bg-[#0d2f4f]/10 rounded-xl flex-shrink-0">
                        <Target className="w-5 h-5 text-[#0d2f4f]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Objective
                        </p>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                          {campaign.campaign_objective}
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDetails(campaign, "public")}
                        className="group flex w-full items-center justify-between rounded-xl bg-secondary px-5 py-3 text-primary cursor-pointer font-semibold shadow-md hover:shadow-lg hover:from-[#0a2640] hover:to-[#0d2f4f] transition-all duration-200"
                      >
                        <span>View Campaign Details</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (Only show if NOT searching) */}
      {!searchResults && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={!previousUrl}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 md:block hidden"
          >
            ← First
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!previousUrl}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page <span className="font-bold">{currentPage}</span> of{" "}
            <span className="font-bold">
              {Math.ceil(totalCount / ITEMS_PER_PAGE)}
            </span>
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!nextUrl}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>

          <button
            onClick={() =>
              setCurrentPage(Math.ceil(totalCount / ITEMS_PER_PAGE))
            }
            disabled={!nextUrl}
            className="px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 md:block hidden"
          >
            Last →
          </button>
        </div>
      )}

      {/* --- Campaign Detail Modal (Handles both Types) --- */}
      {isModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-700 ">
                  {selectedType === "public"
                    ? "Campaign Details"
                    : "Proposal Details"}
                </h3>
                <div className="flex flex-wrap items-baseline gap-1 mt-2">
                  <span className="text-sm font-semibold text-primary min-w-[100px]">
                    Campaign ID:
                  </span>
                  <span className="text-sm  text-gray-700 bg-primary/10 px-2 py-0.5 rounded">
                    #{selectedCampaign.id}
                  </span>
                </div>
                {/* <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-sm font-semibold text-primary min-w-[100px]">
                      Campaign Title:
                    </span>
                    <span className="text-sm text-gray-700">
                      {selectedCampaign?.campaign?.campaign_name}
                    </span>
                  </div> */}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* --- Conditional Rendering based on Type --- */}
              {selectedType === "public" ? (
                // PUBLIC CAMPAIGN DETAILS
                <>
                  {/* 1. Campaign Poster & Status */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
                    <Image
                      src={
                        (selectedCampaign as PublicCampaign).campaign_poster ||
                        "/images/placeholder.jpg"
                      }
                      alt={(selectedCampaign as PublicCampaign).campaign_name}
                      fill
                      className="object-cover "
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold capitalize text-primary shadow-sm border border-gray-100">
                      {(selectedCampaign as PublicCampaign).campaign_status}
                    </div>
                  </div>

                  {/* 2. Title & Description */}
                  <h2 className="text-base font-bold text-gray-900 my-4">
                    {(selectedCampaign as PublicCampaign).campaign_name}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {(selectedCampaign as PublicCampaign).campaign_description}
                  </p>

                  {/* 3. Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                        Budget
                      </p>
                      <p className="font-semibold text-primary text-lg">
                        ${(selectedCampaign as PublicCampaign).budget_range}
                        <span className="text-xs text-gray-400 font-normal ml-1 capitalize">
                          / {(selectedCampaign as PublicCampaign).budget_type}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                        Timeline
                      </p>
                      <p className="font-semibold text-primary text-lg capitalize">
                        {(selectedCampaign as PublicCampaign).campaign_timeline}
                      </p>
                    </div>
                    <div className="col-span-2 border-t border-gray-200 pt-3 mt-1">
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                        Objective
                      </p>
                      <p className="font-semibold text-primary capitalize">
                        {
                          (selectedCampaign as PublicCampaign)
                            .campaign_objective
                        }
                      </p>
                    </div>
                  </div>

                  {/* 4. Deliverables (Splitting comma-separated string) */}
                  <div className="mb-6">
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" /> Required
                      Deliverables
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCampaign as PublicCampaign)
                        .content_deliverables ? (
                        (
                          selectedCampaign as PublicCampaign
                        ).content_deliverables
                          .split(",")
                          .map((item, i) => (
                            <span
                              key={i}
                              className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium border  capitalize"
                            >
                              {item.trim().replace(/-/g, " ")}
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No specific deliverables
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5. Payment Preferences */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3">
                      Payment Preferences
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCampaign as PublicCampaign)
                        .payment_preference ? (
                        (selectedCampaign as PublicCampaign).payment_preference
                          .split(",")
                          .map((item, i) => (
                            <span
                              key={i}
                              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-green-100 capitalize"
                            >
                              {item.trim()}
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 6. Audience & Keywords */}
                  <div className="grid grid-cols-1 gap-6 mb-4 p-4 border border-gray-100 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">
                        Target Audience
                      </h4>
                      <p className="text-sm text-gray-600 leading-snug">
                        {(selectedCampaign as PublicCampaign).target_audience}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">
                        Keywords & Hashtags
                      </h4>
                      <p className="text-sm text-primary font-medium">
                        {
                          (selectedCampaign as PublicCampaign)
                            .keywords_and_hashtags
                        }
                      </p>
                    </div>
                  </div>

                  {/* 7. Requirements Flags */}
                  <div className="flex gap-4 text-xs text-gray-500">
                    {(selectedCampaign as PublicCampaign)
                      .content_approval_required && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-primary" />{" "}
                        Approval Required
                      </span>
                    )}
                    {(selectedCampaign as PublicCampaign)
                      .auto_match_micro_influencers && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-primary" />{" "}
                        Auto-Match Enabled
                      </span>
                    )}
                  </div>
                </>
              ) : (
                // HIRED CAMPAIGN DETAILS
                <>
                  <p className="text-sm text-gray-700 font-semibold my-1">
                    Brand:{" "}
                    {brandMap[selectedCampaign.owner_id] ? (
                      <a
                        href={`influencer-dashboard/brand/${selectedCampaign.owner_id}`}
                        className="text-primary font-medium underline"
                      >
                        {brandMap[selectedCampaign.owner_id]?.brand_profile
                          ?.business_name ||
                          brandMap[selectedCampaign.owner_id]?.user?.first_name}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not Exist</span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-baseline gap-1 mb-2">
                    <span className="text-sm font-semibold text-primary ">
                      Received:
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedCampaign.timestamp
                        ? timeAgo(selectedCampaign.timestamp)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-1 mb-2">
                    <span className="text-sm font-semibold text-primary min-w-[100px]">
                      Campaign Title:
                    </span>
                    <span className="text-sm text-gray-700">
                      {selectedCampaign?.campaign?.campaign_name}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-primary mb-4">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        Timeline
                      </p>
                      <p className="text-sm text-primary mt-1">
                        {formatDateRange(
                          (selectedCampaign as HiredCampaign).start_date,
                          (selectedCampaign as HiredCampaign).end_date
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="font-semibold text-sm uppercase tracking-wider text-gray-700 mb-2">
                    <h4 className="m-0">
                      Budget:{" "}
                      {(selectedCampaign as HiredCampaign)
                        ?.isBudgetNegotiable ||
                      (selectedCampaign as HiredCampaign).budget === 0
                        ? "Open to discussion"
                        : `$${(selectedCampaign as HiredCampaign).budget}`}
                    </h4>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Proposal Message
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {(selectedCampaign as HiredCampaign).proposal_message ||
                        "No Message"}
                    </div>
                  </div>

                  {/* Render Deliverables from JSON string */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 text-sm tracking-wider uppercase my-2">
                      Deliverables
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const raw = (selectedCampaign as HiredCampaign)
                            .campaign_deliverables;
                          const parsed =
                            typeof raw === "string" ? JSON.parse(raw) : raw;
                          if (Array.isArray(parsed)) {
                            return parsed.map((d: string, i: number) => (
                              <span
                                key={i}
                                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize"
                              >
                                {d.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            ));
                          }
                          return null;
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                </>
              )}
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

            {/* Footer Actions */}
            <div className="p-6 w-full border-t border-gray-200 bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              {selectedType === "hired" &&
              !(selectedCampaign as HiredCampaign).is_accepted_by_influencer ? (
                <>
                  <button
                    onClick={() =>
                      handleCampaignAction(selectedCampaign.id, "reject")
                    }
                    className="w-full px-4 py-3 border font-bold flex gap-1 justify-center items-center border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() =>
                      handleCampaignAction(selectedCampaign.id, "accept")
                    }
                    className="w-full px-4 py-3 flex gap-1 justify-center items-center font-bold bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnectWithOwner}
                  className="px-6 py-2 bg-secondary text-primary rounded-lg font-medium hover:bg-[var(--secondaryhover)]"
                >
                  Message Brand
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
