// app/microinfluencers/[id]/page.tsx
// Phase 6 PATCH: add generateMetadata function at the top of this file.
// The rest of the file stays exactly the same — only add these lines at the top.

// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE LINES at the very top of your existing file, 
// after the existing imports and BEFORE the component definition.
// ─────────────────────────────────────────────────────────────────────────────

/*

import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}user_service/get_a_influencer/${params.id}/`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { title: "Influencer | The Social Market" };
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
      title: `${name}${niche ? ` — ${niche} Influencer` : ""} | The Social Market`,
      description: bio
        ? `${bio.slice(0, 155)}…`
        : `Connect with ${name} on The Social Market.`,
      openGraph: {
        title: `${name} | The Social Market`,
        description: bio || `Collaborate with ${name}.`,
        images: profile?.profile_picture
          ? [{ url: profile.profile_picture }]
          : [],
      },
    };
  } catch {
    return { title: "Influencer | The Social Market" };
  }
}

*/

// ─────────────────────────────────────────────────────────────────────────────
// The rest of your existing file is unchanged — do not modify anything below
// the generateMetadata function.
// ─────────────────────────────────────────────────────────────────────────────
