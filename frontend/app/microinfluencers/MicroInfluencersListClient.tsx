"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buildApiUrl } from "@/lib/backendUrls";

interface InfluencerProfile {
  id: number;
  display_name: string | null;
  profile_picture: string | null;
  short_bio: string | null;
  content_niches: string | null;
  insta_follower: number;
  tiktok_follower: number;
  youtube_follower: number;
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

export default function MicroInfluencersListClient() {
  const [influencers, setInfluencers] = useState<InfluencerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInfluencers() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(buildApiUrl("user_service/get_featured_influencers/"));
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.data?.results ?? data?.data ?? [];

        if (!cancelled) {
          setInfluencers(items);
        }
      } catch (err) {
        if (!cancelled) {
          setInfluencers([]);
          setError(err instanceof Error ? err.message : "Unable to load influencers");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInfluencers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-primary md:text-4xl">
            Browse Micro-Influencers
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Discover authentic creators across every niche. Sign up to contact them.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">Loading influencers...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            <p className="text-lg">Unable to load influencers.</p>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
          </div>
        ) : influencers.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">No influencers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {influencers.map((account) => {
              const profile = account.influencer_profile;
              if (!profile) return null;
              const name =
                profile.display_name ||
                `${account.user?.first_name ?? ""} ${account.user?.last_name ?? ""}`.trim() ||
                "Influencer";

              return (
                <Link
                  key={account.id}
                  href={`/microinfluencers/${account.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {profile.profile_picture ? (
                      <Image
                        src={profile.profile_picture}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <span className="text-4xl font-bold text-primary/40">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {account.is_verified && (
                      <span className="absolute right-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="mb-1 truncate font-semibold text-primary">{name}</h2>

                    {profile.content_niches && (
                      <p className="mb-2 truncate text-xs font-medium text-secondary">
                        {profile.content_niches.split(",")[0].trim()}
                      </p>
                    )}

                    {profile.short_bio && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                        {profile.short_bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{getTotalFollowers(profile)} followers</span>
                      <span className="font-medium text-primary group-hover:underline">
                        View profile
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-16 rounded-2xl bg-primary p-8 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">Ready to collaborate?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/80">
            Sign up free to contact influencers, create campaigns, and track your results.
          </p>
          <Link
            href="/auth"
            className="inline-block rounded-lg bg-secondary px-8 py-3 font-semibold text-primary transition hover:opacity-90"
          >
            Get started free
          </Link>
        </div>
      </div>
    </main>
  );
}
