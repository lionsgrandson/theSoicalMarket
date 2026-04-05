// app/microinfluencers/page.tsx
// Phase 6: Converted to server component — indexable by Google.
// Paywall blur removed: users can browse freely, subscription required only to contact.
// Added metadata so every page shows a real title in search results.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Browse Micro-Influencers | The Social Market",
  description:
    "Find authentic micro-influencers across every niche — fitness, fashion, food, tech, and more. Browse profiles, see follower counts, and start a collaboration.",
  openGraph: {
    title: "Browse Micro-Influencers | The Social Market",
    description:
      "Find authentic micro-influencers for your next campaign.",
    url: "https://thesocialmarket.ai/microinfluencers",
  },
};

interface InfluencerProfile {
  id: number;
  display_name: string | null;
  profile_picture: string | null;
  short_bio: string | null;
  content_niches: string | null;
  insta_follower: number;
  tiktok_follower: number;
  youtube_follower: number;
  is_featured: boolean;
  is_verified?: boolean;
}

interface InfluencerAccount {
  id: number;
  is_verified: boolean;
  influencer_profile: InfluencerProfile | null;
  user: { id: number; first_name: string; last_name: string };
}

function getTotalFollowers(profile: InfluencerProfile): string {
  const total =
    (profile.insta_follower || 0) +
    (profile.tiktok_follower || 0) +
    (profile.youtube_follower || 0);
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `${Math.round(total / 1_000)}K`;
  return String(total);
}

async function getInfluencers(): Promise<InfluencerAccount[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}user_service/get_all_influencers/?page_size=48`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.results ?? data?.data ?? [];
  } catch {
    return [];
  }
}

export default async function MicroInfluencersPage() {
  const influencers = await getInfluencers();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Browse Micro-Influencers
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Discover authentic creators across every niche. Sign up to contact them.
          </p>
        </div>

        {influencers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No influencers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {influencers.map((account) => {
              const profile = account.influencer_profile;
              if (!profile) return null;
              const name =
                profile.display_name ||
                `${account.user?.first_name ?? ""} ${account.user?.last_name ?? ""}`.trim() ||
                "Influencer";

              return (
                // Phase 6: no paywall — link goes to public profile, anyone can browse
                <Link
                  key={account.id}
                  href={`/microinfluencers/${account.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Profile image */}
                  <div className="aspect-square relative bg-gray-100">
                    {profile.profile_picture ? (
                      <Image
                        src={profile.profile_picture}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => {}}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <span className="text-4xl font-bold text-primary/40">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {account.is_verified && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <h2 className="font-semibold text-primary truncate flex-1">{name}</h2>
                    </div>

                    {profile.content_niches && (
                      <p className="text-xs text-secondary font-medium mb-2 truncate">
                        {profile.content_niches.split(",")[0].trim()}
                      </p>
                    )}

                    {profile.short_bio && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {profile.short_bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{getTotalFollowers(profile)} followers</span>
                      <span className="text-primary font-medium group-hover:underline">
                        View profile →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA for non-members */}
        <div className="mt-16 bg-primary rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to collaborate?</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Sign up free to contact influencers, create campaigns, and track your results.
          </p>
          <Link
            href="/auth"
            className="inline-block bg-secondary text-primary font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
          >
            Get started free
          </Link>
        </div>
      </div>
    </main>
  );
}
