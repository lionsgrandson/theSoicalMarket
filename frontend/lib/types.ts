export interface Campaign {
  id: string;
  title: string;
  description: string;
  status: "Active" | "Completed" | "Draft";
  budget: number;
  targetReach: string;
  endDate: string;
  image: string;
  platforms: string[];
  collaborators: number;
}

export interface Creator {
  id: string;
  name: string;
  category: string;
  followers: string;
  rating: number;
  bio: string;
  pricing: number;
  collaborations: number;
  image: string;
  platforms: string[];
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  avatar: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  creatorsHired: number;
  earnings?: number;
  newMessages?: number;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  verified: boolean;
  location: string;
  website: string;
  email: string;
  phone: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  mission: string;
  businessType: string;
  contactPerson: {
    name: string;
    title: string;
  };
  campaigns: {
    total: number;
    creators: number;
    avgRating: number;
    totalInvested: number;
  };
  activeCampaigns: ActiveCampaign[];
  reviews: Review[];
  resources: Resource[];
}

export interface ActiveCampaign {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: "Active" | "Completed" | "Draft";
  creatorsNeeded: number;
  budget: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  date: string;
}

export interface Resource {
  type: string;
  title: string;
  url: string;
}
