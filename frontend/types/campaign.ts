export interface Creator {
  id: string;
  name: string;
  avatar?: string;
  followers?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "active" | "paused" | "completed";
  budget: string;
  budgetType: string;
  targetReach: string;
  timeLeft: string;
  progress: number;
  platforms: string[];
  assignedCreators: Creator[];
  objective: string;
  timeline: string;
  deliverables: string[];
  paymentPreferences: string[];
  keywords: string[];
  targetAudience: string;
  approvalRequired: boolean;
  autoMatch: boolean;
  campaignOwner: string;
}