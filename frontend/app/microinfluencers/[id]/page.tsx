import type { Metadata } from "next";
import { buildApiUrl } from "@/lib/backendUrls";

import MicroInfluencerProfileClient from "./MicroInfluencerProfileClient";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(buildApiUrl(`user_service/get_a_influencer/${id}/`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return { title: "Influencer | The Social Market" };
    }

    const data = await res.json();
    const profile = data?.data?.influencer_profile;
    const user = data?.data?.user;
    const name =
      profile?.display_name ||
      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
      "Influencer";
    const niche = profile?.content_niches?.split(",")?.[0]?.trim() ?? "";
    const bio = profile?.short_bio ?? "";

    return {
      title: `${name}${niche ? ` - ${niche} Influencer` : ""} | The Social Market`,
      description: bio
        ? `${bio.slice(0, 155)}...`
        : `Connect with ${name} on The Social Market.`,
      openGraph: {
        title: `${name} | The Social Market`,
        description: bio || `Collaborate with ${name}.`,
        images: profile?.profile_picture ? [{ url: profile.profile_picture }] : [],
      },
    };
  } catch {
    return { title: "Influencer | The Social Market" };
  }
}

export default function MicroInfluencerPage() {
  return <MicroInfluencerProfileClient />;
}
