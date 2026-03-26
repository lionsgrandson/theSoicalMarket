import type { Campaign } from "../types";

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Summer Skincare Launch",
    description:
      "Promoting our new oil-free serum with micro-influencers in beauty niche",
    status: "Active",
    budget: 5000,
    targetReach: "200K",
    endDate: "Ends in 5 days",
    image: "/images/campaign1.jpg",
    platforms: ["instagram", "tiktok"],
    collaborators: 2,
  },
  {
    id: "2",
    title: "Tech Gadget Unboxing",
    description:
      "Unboxing videos for our new wireless earbuds with tech reviewers",
    status: "Active",
    budget: 5000,
    targetReach: "200K",
    endDate: "Ends in 5 days",
    image: "/images/campaign2.png",
    platforms: ["youtube", "instagram"],
    collaborators: 2,
  },
  {
    id: "3",
    title: "Fitness Challenge",
    description: "30-day fitness challenge with health and wellness Creators",
    status: "Completed",
    budget: 5000,
    targetReach: "200K",
    endDate: "Completed 2 weeks ago",
    image: "/images/campaign3.png",
    platforms: ["instagram", "tiktok"],
    collaborators: 5,
  },
];
