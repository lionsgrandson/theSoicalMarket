export interface MicroInfluencer {
  id: string;
  userId?: string;
  name: string;
  description: string;
  logo?: string;
  verified: boolean;
  location: string;
  website: string;
  email: string;
  phone: string;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
  mission: string;
  businessType: string;
  contactPerson: { name: string; title: string };
  campaigns: {
    total: number;
    creators: number;
    avgRating: number;
    totalInvested: number;
  };
  activeCampaigns: Array<{
    id: string;
    title: string;
    status: string;
    description: string;
    deadline: string;
    creatorsNeeded: number;
  }>;
  reviews: Array<{
    id: string;
    comment: string;
    reviewer: string;
  }>;
  resources: Array<{
    type: string;
    title: string;
    url: string;
  }>;
  content_niches?: string[];
  response_time?:string;
  totalAudience?: number;
  audienceBreakdown?: {
    instagram?: number;
    facebook?: number;
    tiktok?: number;
    youtube?: number;
    linkedin?: number;
    twitter?: number;
    podcast?: number;
    blog?: number;
    whatsapp?: number;
  };
  pricing?: {
    instagramStory?: string;
    instagramReel?: string;
    facebookPost?: string;
    tiktokVideo?: string;
    youtubeVideo?: string;
    youtubeShort?: string;
    podcastMention?: string;
    blogPost?: string;
    socialPost?: string;
    ugcCreation?: string;
    liveStream?: string;
    repost?: string;
    whatsappStatus?: string;
    affiliateMarketing?: string;
  };
  paymentPreferences?: string[];
  response_time?: string;
activeCampaigns: ActiveCampaignRecord[];
}
