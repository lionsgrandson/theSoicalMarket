import type { Metadata } from "next";

import MicroInfluencersListClient from "./MicroInfluencersListClient";

export const metadata: Metadata = {
  title: "Browse Micro-Influencers | The Social Market",
  description:
    "Find authentic micro-influencers across every niche - fitness, fashion, food, tech, and more.",
  openGraph: {
    title: "Browse Micro-Influencers | The Social Market",
    description: "Find authentic micro-influencers for your next campaign.",
    url: "https://thesocialmarket.ai/microinfluencers",
  },
};

export default function MicroInfluencersPage() {
  return <MicroInfluencersListClient />;
}
