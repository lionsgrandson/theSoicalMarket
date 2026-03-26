"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CiStar } from "react-icons/ci";
import { apiClient } from "@/lib/apiClient";

// 1. Raw Data Interface (Incoming Props)
interface Campaign {
  id: number;
  hired_influencer_id: number | null;
  rating: number;
}

// 2. User Data Interface
interface UserResponse {
  influencer_profile: {
    display_name: string;
    profile_picture: string | null;
  };
}

// 3. UI Data Interface
interface CollabData {
  campaignId: number;
  influencerId: number;
  username: string;
  avatar: string;
  rating: number;
  followers: string;
  insta_follower: string;
  facebook_follower: string;
  tiktok_follower: string;
  linkedin_follower: string;
  youtube_follower: string;
  blog_follower: string;
  podcast_follower: string;
  whatsapp_follower: string;
  twitter_follower: string;
}

/// --- Helper to calculate total followers ---
const calculateFollowers = (inf: CollabData | undefined | null) => {
  if (!inf) return 0;

  const total =
    Number(inf.insta_follower || 0) +
    Number(inf.facebook_follower || 0) +
    Number(inf.tiktok_follower || 0) +
    Number(inf.linkedin_follower || 0) +
    Number(inf.youtube_follower || 0) +
    Number(inf.twitter_follower || 0)+
    Number(inf.whatsapp_follower || 0)+
    Number(inf.podcast_follower || 0)+
    Number(inf.blog_follower || 0);

  return total;
};
export function RecentCollaborations({
  rawCampaigns,
}: {
  rawCampaigns: Campaign[];
}) {
  const [collaborations, setCollaborations] = useState<CollabData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Only run if we have data from the parent
      if (!rawCampaigns || rawCampaigns.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Filter out campaigns where no influencer was hired
        const validCampaigns = rawCampaigns.filter(
          (c) => c.hired_influencer_id !== null
        );

        // Fetch Influencer Profile for each campaign
        const detailedCollabs = await Promise.all(
          validCampaigns.map(async (campaign) => {
            try {
              const userRes = await apiClient(
                `user_service/get_a_influencer/${campaign.hired_influencer_id}/`,
                { method: "GET" }
              );

              const profile = userRes.data?.influencer_profile;
              console.log("Recent Collaborations",userRes);
              
              const total = calculateFollowers(
                userRes.data?.influencer_profile
              );

              return {
                campaignId: campaign.id,
                influencerId: campaign.hired_influencer_id!,
                username:
                  profile?.display_name || userRes.data?.user?.first_name,
                avatar: profile?.profile_picture,
                rating: campaign.rating > 0 ? campaign.rating : 5.0,
                followers: total > 0 ? `${(total / 1000).toFixed(1)}K` : "N/A",
              };
            } catch (err) {
              console.error(
                `Failed to fetch user ${campaign.hired_influencer_id}`,
                err
              );
              return null;
            }
          })
        );

        setCollaborations(
          detailedCollabs.filter((c): c is CollabData => c !== null)
        );
      } catch (error) {
        console.error("Error fetching collaboration details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [rawCampaigns]); 

  const handleCardClick = (influencerId: number) => {
    router.push(`/brand-dashboard/microinfluencerspage/${influencerId}`);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200  flex flex-col">
      <h3 className="text-xl font-bold text-slate-700 mb-4 flex-shrink-0">
        Recent Collaborations
      </h3>

      <div className="space-y-4 overflow-y-auto flex-grow h-[300px] pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : collaborations.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-500">No recent collaborations.</p>
          </div>
        ) : (
          collaborations.map((collab) => (
            <div
              key={collab.campaignId}
              onClick={() => handleCardClick(collab.influencerId)}
              className="flex items-center justify-between p-2 bg-white shadow border-gray-50 border-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3 ">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                  {collab.avatar ? (
                    <Image
                      width={40}
                      height={40}
                      src={collab.avatar}
                      alt={collab.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center uppercase">
                      <span className="text-sm font-bold text-primary">
                        {collab?.username?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm truncate max-w-[120px]">
                    {collab.username}
                  </p>
                  <p className="text-xs text-slate-600">{collab.followers}</p>
                </div>
              </div>

              {/* <div className="flex items-center space-x-1">
                <span className="text-secondary">
                  <CiStar size={20} />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {collab.rating.toFixed(1)}
                </span>
              </div> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
