"use client";
import { BusinessBio } from "./BusinessBio";
import { CampaignsSection } from "./CampaignsSection";
import { DashboardHeader } from "./DashboardHeader";
import { RecentCollaborations } from "./RecentCollaborations";
import { AnalyticsCards } from "./AnalyticsCards";
import { BusinessAssets } from "./BusinessAssets";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/useAuthStore";
import SentProposal from "../SentProposal";

// --- 1. Define Interface for Raw API Response (Backend Data) ---
interface RawCampaignResponse {
  id: number;
  campaign_name?: string;
  campaign_description?: string;
  budget_range?: string | number;
  budget_type?: string;
  campaign_timeline?: string;
  campaign_objective?: string;
  content_deliverables?: string;
  payment_preference?: string;
  keywords_and_hashtags?: string;
  target_audience?: string;
  content_approval_required?: boolean;
  auto_match_micro_influencers?: boolean;
  campaign_owner: number;
  status: string;
}

export interface AssignedCreator {
  id: string | number;
  name: string;
  avatar?: string;
}

// --- 2. Define Interface for Transformed Campaigns (Frontend UI) ---
export interface DashboardCampaign {
  id: number;
  title: string;
  description: string;
  budget: string;
  budgetType: string;
  targetReach: string;
  timeLeft: string;
  progress: number;
  platforms: string[];
  assignedCreators: AssignedCreator[]; 
  objective: string;
  timeline: string;
  deliverables: string[];
  paymentPreferences: string[];
  keywords: string[];
  targetAudience: string;
  approvalRequired: boolean;
  autoMatch: boolean;
  campaignOwner: number;
  campaignStatus: string;
  statusColor?: string;

}

interface BrandProfile {
  id: number;
}

// --- 3. Define Interface for Previous Hirings ---
export interface HiringCampaign {
  id: number;
  hired_influencer_id: number | null;
  rating: number;
}

export default function BDashboard() {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [allCampaigns, setAllCampaigns] = useState<DashboardCampaign[]>([]);
  const [previousHirings, setPreviousHirings] = useState<HiringCampaign[]>([]);
  const[uniqueInfluencer,setUniqueInfluencer]=useState<HiringCampaign[]>([]);

  const store = useAuthStore.getState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User Info
        const userRes = await apiClient("user_service/get_user_info/", {
          method: "GET",
          auth: true,
        });
        store.setUser(userRes.data);
        setBrandProfile(userRes?.data?.brand_profile);

        // 2. Fetch All Campaigns
        const campaignsRes = await apiClient("campaign_service/get_my_all_campaigns/", {
          method: "GET",
          auth: true,
        });

        const campaignsArray: RawCampaignResponse[] = Array.isArray(campaignsRes.data)
          ? [...campaignsRes.data].reverse()
          : [];

        // Transform API response
        // Now 'campaign' is strictly typed as RawCampaignResponse
        const transformedCampaigns: DashboardCampaign[] = campaignsArray.map((campaign) => ({
          id: campaign.id,
          title: campaign.campaign_name || "Untitled Campaign",
          description: campaign.campaign_description || "",
          budget: campaign.budget_range ? `$${campaign.budget_range}` : "$0",
          budgetType: campaign.budget_type || "total",
          targetReach: "200K",
          timeLeft: campaign.campaign_timeline || "N/A",
          progress: 0,
          platforms: [],
          assignedCreators: [],
          objective: campaign.campaign_objective || "",
          timeline: campaign.campaign_timeline || "",
          deliverables: campaign.content_deliverables
            ? campaign.content_deliverables.split(",").map((d) => d.trim())
            : [],
          paymentPreferences: campaign.payment_preference
            ? campaign.payment_preference.split(",").map((p) => p.trim())
            : [],
          keywords: campaign.keywords_and_hashtags
            ? campaign.keywords_and_hashtags.split(",").map((k) => k.trim())
            : [],
          targetAudience: campaign.target_audience || "",
          approvalRequired: campaign.content_approval_required || false,
          autoMatch: campaign.auto_match_micro_influencers || false,
          campaignOwner: campaign.campaign_owner,
          campaignStatus: campaign.status,
        }));

        setAllCampaigns(transformedCampaigns);

        // 3. Fetch Previous Hirings
        const hiringsRes = await apiClient("campaign_service/get_my_previous_hirings/", {
          method: "GET",
          auth: true,
        });
const data: HiringCampaign[] = hiringsRes.data;

        if (data && Array.isArray(data)) {
          setPreviousHirings(hiringsRes.data);
          const uniqueByInfluencer: HiringCampaign[] = Array.from(
    new Map(
      data.map((item: HiringCampaign) => [item.hired_influencer_id, item])
    ).values()
  );

  setUniqueInfluencer(uniqueByInfluencer);
        }

      } catch (error) {
        console.error("❌ API Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="">
      <div className="flex-1">
        <DashboardHeader />
        <div className="mt-6 space-y-6">
          <AnalyticsCards allCampaigns={allCampaigns} previousHirings={previousHirings} uniqueInfluencer={uniqueInfluencer} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BusinessBio />
              <SentProposal/>
              {/* <CampaignsSection allCampaigns={allCampaigns} /> */}
            </div>
            <div className="space-y-6">
              <RecentCollaborations rawCampaigns={previousHirings} />
              {/* <BusinessAssets /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}