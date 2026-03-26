"use client";
import Swal from "sweetalert2";
import { useEffect, useState, Suspense } from "react";
import {
  Search,
  MoreHorizontal,
  X,
  Pause,
  Play,
  Trash,
  Instagram,
  ChartArea,
  Users,
  Rocket,
  ChevronDown,
  Star,
  DollarSign,
  Clock,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import CreateCampaignModal from "../../../../components/brand/CreateCampaignModal";
import {
  FaBook,
  FaLinkedin,
  FaPodcast,
  FaQuestionCircle,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiSpeakerphone } from "react-icons/hi";
import { motion } from "framer-motion";
import { Campaign } from "@/types/campaign";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/* -------------------------------------------------
   Types
------------------------------------------------- */
interface Hiring {
  // add more fields if needed
}
interface PlatformConfig {
  match: string;
  icon: React.ReactNode;
  className: string;
}

interface InfluencerProfile {
  display_name: string;
  profile_picture: string | null;
  // Add other fields you need
}

type CampaignApiResponse = {
  id: string;
  campaign_name?: string;
  campaign_description?: string;
  campaign_poster?: string;
  campaign_status?: string;
  budget_range?: string;
  budget_type?: string;
  campaign_timeline?: string;
  campaign_objective?: string;
  content_deliverables?: string;
  payment_preference?: string;
  keywords_and_hashtags?: string;
  target_audience?: string;
  content_approval_required?: boolean;
  auto_match_micro_influencers?: boolean;
  campaign_owner: string;
};

interface HiringCampaign {
  id: number;
  campaign_id: number;
  hired_influencer_id: number;
  is_completed_marked_by_brand: boolean;
  rating: number;
  status?: string;
  // We will attach the fetched profile here for display
  influencer_details?: InfluencerProfile;
  influencer_name: string;
}

/* -------------------------------------------------
   Platform icons
------------------------------------------------- */
const PLATFORM_CONFIG: PlatformConfig[] = [
  {
    match: "instagram",
    icon: <Instagram className="w-4 h-4" />,
    className: "text-[#E4405F]",
  },
  {
    match: "tiktok",
    icon: <FaTiktok className="w-4 h-4" />,
    className: "text-black",
  },
  {
    match: "facebook",
    icon: <FaFacebook className="w-4 h-4" />,
    className: "text-[#1877F2]",
  },
  {
    match: "youtube",
    icon: <FaYoutube className="w-4 h-4" />,
    className: "text-[#FF0000]",
  },
  {
    match: "linkedin",
    icon: <FaLinkedin className="w-4 h-4" />,
    className: "text-[#0A66C2]",
  },
  {
    match: "whatsapp",
    icon: <FaWhatsapp className="w-4 h-4" />,
    className: "text-[#25D366]",
  },
  {
    match: "blog",
    icon: <FaBook className="w-4 h-4" />,
    className: "text-gray-700",
  },
  {
    match: "podcast",
    icon: <FaPodcast className="w-4 h-4" />,
    className: "text-purple-600",
  },
  {
    match: "twitter",
    icon: <FaTwitter className="w-4 h-4" />,
    className: "text-purple-600",
  },
];

const defaultConfig = {
  icon: <FaQuestionCircle className="w-4 h-4" />,
  className: "text-gray-400",
};

const getPlatformConfig = (deliverable?: string | null) => {
  if (!deliverable || typeof deliverable !== "string") {
    return defaultConfig;
  }

  const lowerDeliverable = deliverable.toLowerCase().trim();
  
  let platformKey = lowerDeliverable;
  
  if (lowerDeliverable.includes('instagram')) platformKey = 'instagram';
  else if (lowerDeliverable.includes('tiktok')) platformKey = 'tiktok';
  else if (lowerDeliverable.includes('youtube')) platformKey = 'youtube';
  else if (lowerDeliverable.includes('facebook')) platformKey = 'facebook';
  else if (lowerDeliverable.includes('linkedin')) platformKey = 'linkedin';
  else if (lowerDeliverable.includes('twitter')) platformKey = 'twitter';
  else if (lowerDeliverable.includes('whatsapp')) platformKey = 'whatsapp';
  else if (lowerDeliverable.includes('blog')) platformKey = 'blog';
  else if (lowerDeliverable.includes('podcast')) platformKey = 'podcast';
  
  const config = PLATFORM_CONFIG.find((c) => c.match === platformKey);
  
  return config || defaultConfig;
};

/* -------------------------------------------------
   Component
------------------------------------------------- */
function CampaignDashboardContent() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [previousHirings, setPreviousHirings] = useState<HiringCampaign[]>([]);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingValue, setRatingValue] = useState<Record<number, number>>({});
  const [ratingLoading, setRatingLoading] = useState<number | null>(null);
  const [modalHirings, setModalHirings] = useState<HiringCampaign[]>([]);
  const [archieveLoading, setArchieveLoading] = useState<string | null>(null);

  const [showArchived, setShowArchived] = useState(false);
  const [uniqueInfluencer, setUniqueInfluencer] = useState<HiringCampaign[]>(
    []
  );
  const [completeLoading, setCompleteLoading] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get("create") === "true";

  useEffect(()=>{
    setShowModal(isModalOpen);
  },[isModalOpen]);

  /* ---------- Stats (no type errors) ---------- */
  const stats = [
    {
      title: "Total Campaigns",
      value: allCampaigns.length,
      subtitle: "Currently active and completed",
      icon: <HiSpeakerphone className="w-8 h-8 text-primary" />,
      color: "bg-white",
    },
    {
      title: "Active Campaigns",
      value: allCampaigns.filter((c) => c.status === "active").length,
      subtitle: "Campaigns running this month",
      icon: <Play className="w-8 h-8 text-primary" />,
      color: "bg-green-50",
    },
    {
      title: "Influencers Hired",
      value: uniqueInfluencer.length,
      subtitle: "Unique influencers in your network",
      icon: <Users className="w-8 h-8 text-primary" />,
      color: "bg-purple-50",
    },
    {
      title: "Launch New Campaign",
      value: "",
      subtitle: "Start a new campaign project today",
      icon: <Rocket className="w-8 h-8 text-primary" />,
      color: "bg-orange-50",
      isAction: true,
    },
  ];

  /* ---------- Filters ---------- */
  const filteredCampaigns = allCampaigns.filter((campaign) => {
    if ((campaign.status || "").toLowerCase() === "archive") {
      return false;
    }

    const matchesSearch = (campaign.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (campaign.status || "").toLowerCase() === statusFilter;

    const matchesPlatform =
      platformFilter === "all" ||
      (campaign.platforms || []).some(
        (p) => p.toLowerCase() === platformFilter
      );

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Get archived campaigns for display
  const archivedCampaigns = allCampaigns.filter(
    (campaign) => (campaign.status || "").toLowerCase() === "archive"
  );

  const openCampaignModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };
  const closeCampaignModal = () => setSelectedCampaign(null);

  /* ---------- Fetch campaigns ---------- */
  useEffect(() => {
    const fetchAllCampaigns = async () => {
      try {
        const res = await apiClient("campaign_service/get_my_all_campaigns/", {
          method: "GET",
          auth: true,
        });

        const campaignsArray = Array.isArray(res.data)
          ? [...res.data].reverse()
          : [];

        const transformed: Campaign[] = campaignsArray.map(
          (c: CampaignApiResponse) => ({
            id: c.id,
            title: c.campaign_name || "Untitled Campaign",
            description: c.campaign_description || "",
            image: c.campaign_poster || "/images/placeholder-image.png",
            status: (c.campaign_status || "active") as
              | "active"
              | "paused"
              | "completed",

            budget: c.budget_range ? `$${c.budget_range}` : "$0",
            budgetType: c.budget_type || "total",
            targetReach: "200K",
            timeLeft: c.campaign_timeline || "N/A",
            progress: 0,

            platforms: [],
            assignedCreators: [],

            objective: c.campaign_objective || "",
            timeline: c.campaign_timeline || "",

            deliverables: c.content_deliverables
              ? c.content_deliverables.split(",").map((d: string) => d.trim())
              : [],

            paymentPreferences: c.payment_preference
              ? c.payment_preference.split(",").map((p: string) => p.trim())
              : [],

            keywords: c.keywords_and_hashtags
              ? c.keywords_and_hashtags.split(",").map((k: string) => k.trim())
              : [],

            targetAudience: c.target_audience || "",
            approvalRequired: !!c.content_approval_required,
            autoMatch: !!c.auto_match_micro_influencers,
            campaignOwner: c.campaign_owner,
          })
        );

        setAllCampaigns(transformed);
      } catch (error) {
        console.error("API Error:", error);
        setAllCampaigns([]);
      }
    };

    fetchAllCampaigns();
  }, []);

  useEffect(() => {
    const fetchPreviousHirings = async () => {
      try {
        const hiringsRes = await apiClient(
          "campaign_service/get_my_previous_hirings/",
          {
            method: "GET",
            auth: true,
          }
        );
        const data: HiringCampaign[] = hiringsRes.data;

        if (data && Array.isArray(data)) {
          console.log(data);

          setPreviousHirings(data);

          const uniqueByInfluencer: HiringCampaign[] = Array.from(
            new Map(
              data.map((item: HiringCampaign) => [
                item.hired_influencer_id,
                item,
              ])
            ).values()
          );

          setUniqueInfluencer(uniqueByInfluencer);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchPreviousHirings();
  }, []);

  useEffect(() => {
    const fetchInfluencerDetails = async () => {
      if (!selectedCampaign) return;

      const relevantHirings = previousHirings.filter(
        (h) => Number(h.campaign_id) === Number(selectedCampaign.id)
      );

      // 2. Fetch user info for each hiring
      const hiringsWithProfiles = await Promise.all(
        relevantHirings.map(async (hiring) => {
          try {
            // Using user_service to get influencer details
            const res = await apiClient(
              `user_service/get_a_influencer/${hiring.hired_influencer_id}/`,
              { method: "GET" }
            );

            return {
              ...hiring,
              influencer_details: res.data?.influencer_profile || null,
              influencer_name:
                res.data?.influencer_profile?.display_name ||
                res.data?.user?.first_name,
            };
          } catch (error) {
            console.error("Error fetching influencer:", error);
            return hiring;
          }
        })
      );

      setModalHirings(hiringsWithProfiles);
    };

    if (selectedCampaign && previousHirings.length > 0) {
      fetchInfluencerDetails();
    }
  }, [selectedCampaign, previousHirings]);

  /* ---------- Pause / Resume ---------- */
  const handlePauseResume = async (event: Event, campaign: Campaign) => {
    event.preventDefault();
    event.stopPropagation();

    const isActive = campaign.status.toLowerCase() === "active";
    const newStatus = isActive ? "paused" : "active";

    try {
      await apiClient(`campaign_service/update_a_campaign/${campaign.id}/`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ campaign_status: newStatus }),
      });

      setAllCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id
            ? { ...c, status: newStatus as "active" | "paused" }
            : c
        )
      );
    } catch (err) {
      console.error("Pause/Resume failed", err);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (event: Event, campaign: Campaign) => {
    if (event instanceof MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d2f4f",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient(`campaign_service/delete_a_campaign/${campaign.id}/`, {
        method: "DELETE",
        auth: true,
      });

      setAllCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));

      Swal.fire({
        title: "Deleted!",
        text: "Your campaign has been deleted.",
        icon: "success",
        customClass: {
    icon: 'custom-success-icon'
  }
      });
    } catch (err) {
      console.error("Delete failed", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete campaign.",
        icon: "error",
      });
    }
  };

  const handleCampaignCreated = (rawCampaignData: any) => {
    // Transform the API response to Campaign format (same as fetchAllCampaigns)
    const transformed: Campaign = {
      id: rawCampaignData.id,
      title: rawCampaignData.campaign_name || "Untitled Campaign",
      description: rawCampaignData.campaign_description || "",
      image: rawCampaignData.campaign_poster || "/images/placeholder-image.png",
      status: (rawCampaignData.campaign_status || "active") as
        | "active"
        | "paused"
        | "completed",

      budget: rawCampaignData.budget_range
        ? `$${rawCampaignData.budget_range}`
        : "$0",
      budgetType: rawCampaignData.budget_type || "total",
      targetReach: "200K",
      timeLeft: rawCampaignData.campaign_timeline || "N/A",
      progress: 0,

      platforms: [],
      assignedCreators: [],

      objective: rawCampaignData.campaign_objective || "",
      timeline: rawCampaignData.campaign_timeline || "",

      deliverables: rawCampaignData.content_deliverables
        ? rawCampaignData.content_deliverables
            .split(",")
            .map((d: string) => d.trim())
        : [],

      paymentPreferences: rawCampaignData.payment_preference
        ? rawCampaignData.payment_preference
            .split(",")
            .map((p: string) => p.trim())
        : [],

      keywords: rawCampaignData.keywords_and_hashtags
        ? rawCampaignData.keywords_and_hashtags
            .split(",")
            .map((k: string) => k.trim())
        : [],

      targetAudience: rawCampaignData.target_audience || "",
      approvalRequired: !!rawCampaignData.content_approval_required,
      autoMatch: !!rawCampaignData.auto_match_micro_influencers,
      campaignOwner: rawCampaignData.campaign_owner,
    };

    setAllCampaigns((prev) => [transformed, ...prev]);
    setShowModal(false);
  };

  const getCompleteStatus = (selectedCampaignId: number) => {
    if (!selectedCampaignId) return null;

    // First, try to match by campaign_id
    let status = previousHirings.find(
      (c) => c.campaign_id === selectedCampaignId
    );

    // If no match, fallback: try to match by id or another unique property
    if (!status) {
      status = previousHirings.find((c) => c.id === selectedCampaignId);
    }

    return status || null;
  };

  const handleComplete = async (hiringId: number) => {
    setCompleteLoading(hiringId);
    try {
      const res = await apiClient(
        `campaign_service/complete_offer/${hiringId}/`,
        {
          method: "PATCH",
          auth: true,
        }
      );

      if (res?.code === 200 || res?.status === "success") {
        toast.success("Campaign marked as completed!");

        // 1. Update the Main Hirings State (Global)
        const updatedHirings = previousHirings.map((h) =>
          h.id === hiringId ? { ...h, is_completed_marked_by_brand: true } : h
        );
        setPreviousHirings(updatedHirings);

        // 2. Update the Modal State (Local) so UI changes instantly
        setModalHirings((prev) =>
          prev.map((h) =>
            h.id === hiringId ? { ...h, is_completed_marked_by_brand: true } : h
          )
        );
      }
    } catch (error) {
      console.error("Error marking complete:", error);
      toast.error("Failed to mark as complete.");
    } finally {
      setCompleteLoading(null);
    }
  };

  const handleSubmitRating = async (hiringId: number, rating: number) => {
    setRatingLoading(hiringId);
    try {
      const res = await apiClient(`campaign_service/give_rating/${hiringId}/`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ rating: rating }),
      });

      if (res?.code === 200 || res?.status === "success") {
        toast.success("Rating submitted!");

        // Update local states to show stars are locked in
        setPreviousHirings((prev) =>
          prev.map((h) => (h.id === hiringId ? { ...h, rating: rating } : h))
        );
      }
    } catch (error) {
      toast.error("Failed to submit rating.");
    } finally {
      setRatingLoading(null);
    }
  };

  // handle archieve
  const handleArchieve = async (status: string, id: string) => {
    setArchieveLoading(id);
    try {
      const res = await apiClient(`campaign_service/update_a_campaign/${id}/`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ campaign_status: status }),
      });
      console.log(res);
      if (res.code == 200) {
        // Update the local campaigns list with the new status
        setAllCampaigns((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status: status as "active" | "paused" | "completed" }
              : c
          )
        );

        // Update selectedCampaign if it's the same campaign being archived/restored
        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign({
            ...selectedCampaign,
            status: status as "active" | "paused" | "completed",
          });
        }

        // Show success message
        if (status === "archive") {
          toast.success("Campaign archived successfully!");
          // Close modal after a short delay
          setTimeout(() => closeCampaignModal(), 500);
        } else {
          toast.success("Campaign restored successfully!");
        }
      }
    } catch (err) {
      console.error("Archive failed", err);
      toast.error("Failed to update campaign status");
    } finally {
      setArchieveLoading(null);
    }
  };

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Campaign Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, manage and collaborate with campaigns
            </p>
          </div>
        </div>
      </header>

      <div className="">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`${stat.color} border-0 rounded-lg shadow-sm`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    {stat.value !== undefined && (
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
                {stat.isAction && (
                  <motion.button
                    whileHover={{
                      y: -2,
                      scale: 1.01,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      },
                    }}
                    className="w-full mt-4 bg-secondary cursor-pointer hover:bg-[var(--secondaryhover)] text-primary px-4 py-2 rounded-md font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => setShowModal(true)}
                  >
                    🚀 Launch Campaign
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>

        <CreateCampaignModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleCampaignCreated}
        />

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-700 
      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent outline-none"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter} >
            <SelectTrigger
              className="
      w-full sm:w-[160px]
      bg-white 
      border border-gray-300 
      rounded-lg 
      px-4 py-3 
      text-sm text-gray-700 
      focus:outline-none focus:ring-2 focus:ring-primary/30
    "
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent
              className="
      bg-white 
      rounded-lg 
      shadow-lg 
      border border-gray-200 
      mt-1 
       w-full
    "
            >
              <SelectItem
                className="px-4 py-2 hover:bg-gray-50 rounded-md"
                value="all"
              >
                All Status
              </SelectItem>
              <SelectItem
                className="px-4 py-2 hover:bg-gray-50 rounded-md"
                value="active"
              >
                Active
              </SelectItem>
              <SelectItem
                className="px-4 py-2 hover:bg-gray-50 rounded-md"
                value="paused"
              >
                Paused
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg border border-gray-200 transform transition-transform duration-300 hover:scale-102"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
                  <Image
                    fill
                    src={campaign.image}
                    alt={campaign.title}
                    className="object-cover"
                  />
                  <span
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.status}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-md transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onSelect={(event) => handlePauseResume(event, campaign)}
                      >
                        {(campaign.status || "").toLowerCase() === "active" ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> Resume
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={(event) => handleDelete(event, campaign)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {campaign.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
  {Array.isArray(campaign.deliverables) && campaign.deliverables.length > 0
    ? 
      Array.from(new Set(
        campaign.deliverables
          .filter(Boolean)
          .map(d => {
            const lower = d.toLowerCase();
            if (lower.includes('instagram')) return 'instagram';
            if (lower.includes('tiktok')) return 'tiktok';
            if (lower.includes('youtube')) return 'youtube';
            if (lower.includes('facebook')) return 'facebook';
            if (lower.includes('linkedin')) return 'linkedin';
            if (lower.includes('twitter')) return 'twitter';
            if (lower.includes('whatsapp')) return 'whatsapp';
            if (lower.includes('blog')) return 'blog';
            if (lower.includes('podcast')) return 'podcast';
            return d;
          })
      )).map((platform, idx) => {
        const { icon, className } = getPlatformConfig(platform);
        return (
          <div
            key={idx}
            className={`w-6 h-6 rounded flex items-center justify-center ${className} bg-gray-50 border`}
            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
          >
            {icon}
          </div>
        );
      })
    : (
      <div className="w-6 h-6 rounded flex items-center justify-center text-gray-400 bg-gray-100 border">
        <FaQuestionCircle className="w-4 h-4" />
      </div>
    )}

  {/* Assigned creators avatars */}
  <div className="flex -space-x-2 ml-2">
    {(campaign.assignedCreators || [])
      .slice(0, 3)
      .map((creator, idx) => (
        <div
          key={idx}
          className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-300"
        >
          <Image
            width={600}
            height={600}
            src={creator.avatar || "/placeholder.svg"}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    {(campaign.assignedCreators || []).length > 3 && (
      <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
        <span className="text-xs">
          +{(campaign.assignedCreators || []).length - 3}
        </span>
      </div>
    )}
  </div>
</div>


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
                        <p className="text-base font-semibold text-primary">
                          {campaign.budget}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#0d2f4f]/10 rounded-xl">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timeline
                        </p>
                        <p className="text-base font-semibold text-primary">
                          {campaign.timeLeft}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Objective */}
                  <div className="mt-6 flex items-start gap-3">
                    <div className="p-2.5 bg-[#0d2f4f]/10 rounded-xl flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Objective
                      </p>
                      <p className="text-base font-semibold text-primary mt-1">
                        {campaign.objective}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => openCampaignModal(campaign)}
                      className="group flex w-full items-center justify-between rounded-xl bg-secondary px-5 py-3 text-primary cursor-pointer font-semibold shadow-md hover:shadow-lg hover:from-[#0a2640] hover:to-[#0d2f4f] transition-all duration-200"
                    >
                      <span>View Campaign Details</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No campaigns found.
          </div>
        )}

        {/* Archived Campaigns Section */}
        {archivedCampaigns.length > 0 && (
          <div className="mt-12">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-6 hover:text-primary transition-colors"
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  showArchived ? "rotate-180" : ""
                }`}
              />
              Archived Campaigns ({archivedCampaigns.length})
            </button>

            {showArchived && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {archivedCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:shadow-lg border border-gray-300 transform transition-transform duration-300 hover:scale-102 opacity-75"
                  >
                    <div className="relative">
                      <Image
                        width={600}
                        height={192}
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-48 rounded-t-lg"
                      />
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-gray-400 text-white">
                        Archived
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-md transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleArchieve("active", campaign.id);
                            }}
                          >
                            <Play className="mr-2 h-4 w-4" /> Restore
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={(event) => handleDelete(event, campaign)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                            Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-600">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {campaign.description}
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gray-200 rounded-xl">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Budget
                            </p>
                            <p className="text-base font-semibold text-primary">
                              {campaign.budget}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gray-200 rounded-xl">
                            <Clock className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Timeline
                            </p>
                            <p className="text-base font-semibold text-primary">
                              {campaign.timeLeft}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header Image */}
            <div className="relative">
              <div className=" w-full aspect-[16/9] overflow-hidden rounded-t-lg p-4">
                <Image
                  fill
                  src={selectedCampaign.image}
                  alt={selectedCampaign.title}
                  className="object-cover "
                />
              </div>
              <button
                className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-md transition-colors"
                onClick={closeCampaignModal}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedCampaign.title}
                  </h2>
                  <p className="text-gray-600">
                    {selectedCampaign.description}
                  </p>
                </div>
              </div>

              {/* --- ASSIGNED INFLUENCERS LIST --- */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Assigned Influencers
                </h3>

                <div className="space-y-6">
                  {modalHirings.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
  No influencers hired yet.{" "}
  <br/>
  <p className="text-primary">Click <Link
    href="/brand-dashboard/microinfluencerspage"
    className=" font-medium underline"
  >
     here 
  </Link> to find influencers</p>
  
</p>

                  ) : (
                    modalHirings.map((hiring) => (
                      <div
                        key={hiring.id}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                      >
                        {/* Influencer Info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              {hiring.influencer_details?.profile_picture ? (
                                <Image
                                  width={40}
                                  height={40}
                                  src={
                                    hiring.influencer_details?.profile_picture
                                  }
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="uppercase w-10 h-10 flex justify-center items-center">
                                  {hiring?.influencer_name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {hiring.influencer_details?.display_name ||
                                  `User ${hiring.hired_influencer_id}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {hiring.hired_influencer_id}
                              </p>
                            </div>
                          </div>

                          {/* ACTION BUTTON: Mark Complete */}
                          <button
                            onClick={() => handleComplete(hiring.id)}
                            disabled={
                              hiring.is_completed_marked_by_brand ||
                              completeLoading === hiring.id
                            }
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                              hiring.is_completed_marked_by_brand
                                ? "bg-green-100 text-green-700 cursor-default"
                                : "bg-secondary text-primary hover:bg-[var(--secondaryhover)] cursor-pointer"
                            }`}
                          >
                            {completeLoading === hiring.id ? (
                              <div className="flex gap-1">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Completing…
                              </div>
                            ) : hiring.is_completed_marked_by_brand ? (
                              "✓ Completed"
                            ) : (
                              "Mark as Complete"
                            )}
                          </button>
                        </div>

                        {/* --- REVIEW SECTION (Only if Completed) --- */}
                        {hiring.is_completed_marked_by_brand && (
                          <div className="border-t border-gray-200 pt-3 mt-2">
                            <p className="text-xs text-gray-500 mb-2 font-medium">
                              Rate Experience
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const activeRating =
                                  hoverRating ||
                                  ratingValue[hiring.id] ||
                                  hiring.rating ||
                                  0;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    disabled={hiring.rating > 0}
                                    onClick={() =>
                                      setRatingValue((prev) => ({
                                        ...prev,
                                        [hiring.id]: star,
                                      }))
                                    }
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110 disabled:cursor-default"
                                  >
                                    <Star
                                      className={`w-6 h-6 transition-colors ${
                                        star <= activeRating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-gray-100 text-gray-300"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                              {hiring.rating > 0 && (
                                <span className="ml-2 text-xs text-green-600 font-medium">
                                  Thanks for rating!
                                </span>
                              )}
                            </div>
                            {hiring.rating === 0 && ratingValue[hiring.id] && (
                              <button
                                onClick={() =>
                                  handleSubmitRating(
                                    hiring.id,
                                    ratingValue[hiring.id]
                                  )
                                }
                                disabled={ratingLoading === hiring.id}
                                className="mt-2 px-3 py-1.5 cursor-pointer text-xs font-semibold rounded-md bg-secondary text-primary hover:bg-[var(--secondaryhover)] flex items-center gap-2"
                              >
                                {ratingLoading === hiring.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting…
                                  </>
                                ) : (
                                  "Submit Rating"
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Mark as Archieve button */}
              <div className="flex justify-center items-center">
                <button
                  disabled={
                    (selectedCampaign.status || "").toLowerCase() === "archive" ||
                    archieveLoading === selectedCampaign.id
                  }
                  onClick={() => {
                    const nextStatus =
                      (selectedCampaign.status || "").toLowerCase() === "archive"
                        ? "active"
                        : "archive";

                    handleArchieve(nextStatus, selectedCampaign.id);
                  }}
                  className={`px-8 py-3 text-sm font-semibold rounded-md transition-all
      cursor-pointer
      ${
        (selectedCampaign.status || "").toLowerCase() === "archive"
          ? "bg-slate-200 text-slate-600 hover:bg-gray-300 cursor-not-allowed"
          : "bg-secondary text-primary hover:bg-[var(--secondaryhover)]"
      }
    `}
                >
                  {archieveLoading === selectedCampaign.id ? (
                    <div className="flex gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </div>
                  ) : (selectedCampaign.status || "").toLowerCase() === "archive" ? (
                    "Archived"
                  ) : (
                    "Mark as Archive"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <CampaignDashboardContent />
    </Suspense>
  );
}
