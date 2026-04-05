"""
Matching engine - finds the best influencer-brand pairs based on niche
overlap, follower range, and platform presence.
"""

from .models import UserProfile, InfluencerInfo, BrandInfo

MAX_MATCHES_PER_EVENT = 10
MIN_SCORE_THRESHOLD = 20

SCORE_NICHE_OVERLAP = 40
SCORE_PLATFORM_OVERLAP = 15
SCORE_FOLLOWER_RANGE = 20
SCORE_VERIFIED = 10
SCORE_FEATURED = 5


def _parse_niches(raw: str) -> set[str]:
    if not raw:
        return set()
    return {n.strip().lower() for n in raw.replace("&", ",").split(",") if n.strip()}


def _parse_platforms(profile: InfluencerInfo) -> set[str]:
    platforms = set()
    handle_map = {
        "instagram": getattr(profile, "instagram_handle", ""),
        "tiktok": getattr(profile, "tiktok_handle", ""),
        "youtube": getattr(profile, "youtube_handle", ""),
        "twitter": getattr(profile, "twitter_handle", ""),
        "linkedin": getattr(profile, "linkedin_handle", ""),
        "facebook": getattr(profile, "facebook_handle", ""),
        "whatsapp": getattr(profile, "whatsapp_handle", ""),
        "podcast": getattr(profile, "podcast_handle", ""),
        "blog": getattr(profile, "blog_handle", ""),
    }
    for platform, handle in handle_map.items():
        if handle and str(handle).strip():
            platforms.add(platform)
    return platforms


def _brand_platform_prefs(brand: BrandInfo) -> set[str]:
    platforms = set()
    if getattr(brand, "instagram_handle", ""):
        platforms.add("instagram")
    if getattr(brand, "tiktok_handle", ""):
        platforms.add("tiktok")
    if getattr(brand, "x_handle", ""):
        platforms.add("twitter")
    if getattr(brand, "linkedin_profile", ""):
        platforms.add("linkedin")
    if getattr(brand, "whatsapp_business", ""):
        platforms.add("whatsapp")
    return platforms


def _total_followers(inf: InfluencerInfo) -> int:
    return sum(
        [
            getattr(inf, "insta_follower", 0) or 0,
            getattr(inf, "facebook_follower", 0) or 0,
            getattr(inf, "tiktok_follower", 0) or 0,
            getattr(inf, "linkedin_follower", 0) or 0,
            getattr(inf, "youtube_follower", 0) or 0,
            getattr(inf, "blog_follower", 0) or 0,
            getattr(inf, "whatsapp_follower", 0) or 0,
            getattr(inf, "podcast_follower", 0) or 0,
            getattr(inf, "twitter_follower", 0) or 0,
        ]
    )


def _format_followers(n: int) -> str:
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.0f}K"
    return str(n)


def score_influencer_for_brand(
    influencer_profile: UserProfile,
    brand_profile: UserProfile,
) -> tuple[int, str]:
    score = 0
    matched_niche = ""

    inf = influencer_profile.influencer_profile
    brand = brand_profile.brand_profile

    if not inf or not brand:
        return 0, ""

    brand_niches = _parse_niches(getattr(brand, "targeted_audience", "")) | _parse_niches(
        getattr(brand, "keyword_hashtags", "")
    )
    inf_niches = _parse_niches(getattr(inf, "content_niches", "")) | _parse_niches(
        getattr(inf, "keyword_and_tags", "")
    )

    overlapping = brand_niches & inf_niches
    if overlapping:
        score += SCORE_NICHE_OVERLAP * len(overlapping)
        matched_niche = sorted(overlapping)[0].title()

    inf_platforms = _parse_platforms(inf)
    brand_platforms = _brand_platform_prefs(brand)
    score += SCORE_PLATFORM_OVERLAP * len(inf_platforms & brand_platforms)

    if influencer_profile.is_verified:
        score += SCORE_VERIFIED
    if getattr(inf, "is_featured", False):
        score += SCORE_FEATURED

    followers = _total_followers(inf)
    if 1_000 <= followers <= 500_000:
        score += SCORE_FOLLOWER_RANGE

    return score, matched_niche


def find_matching_brands_for_new_influencer(influencer_user_id: int) -> list[dict]:
    try:
        influencer_profile = UserProfile.objects.select_related(
            "user", "influencer_profile"
        ).get(user_id=influencer_user_id)
    except UserProfile.DoesNotExist:
        return []

    if not influencer_profile.influencer_profile:
        return []

    inf = influencer_profile.influencer_profile
    inf_name = (
        getattr(inf, "display_name", "")
        or f"{influencer_profile.user.first_name} {influencer_profile.user.last_name}".strip()
        or influencer_profile.user.username
    )

    brand_profiles = (
        UserProfile.objects.filter(signed_up_as__in=["brand", "both"])
        .select_related("user", "brand_profile")
        .exclude(user_id=influencer_user_id)
    )

    scored: list[tuple[int, str, UserProfile]] = []
    for bp in brand_profiles:
        if not bp.brand_profile:
            continue
        score, matched_niche = score_influencer_for_brand(influencer_profile, bp)
        if score >= MIN_SCORE_THRESHOLD:
            scored.append((score, matched_niche, bp))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:MAX_MATCHES_PER_EVENT]

    return [
        {
            "brand_id": bp.user_id,
            "influencer_id": influencer_user_id,
            "matched_niche": niche,
            "score": score,
            "influencer_name": inf_name,
            "follower_count": _format_followers(_total_followers(inf)),
            "niche": niche,
        }
        for score, niche, bp in top
    ]


def find_matching_influencers_for_new_brand(brand_user_id: int) -> list[dict]:
    try:
        brand_profile = UserProfile.objects.select_related("user", "brand_profile").get(
            user_id=brand_user_id
        )
    except UserProfile.DoesNotExist:
        return []

    if not brand_profile.brand_profile:
        return []

    brand = brand_profile.brand_profile
    brand_name = (
        getattr(brand, "business_name", "")
        or getattr(brand, "display_name", "")
        or brand_profile.user.first_name
    )

    inf_profiles = (
        UserProfile.objects.filter(
            signed_up_as__in=["influencer", "both"],
            influencer_profile__isnull=False,
        )
        .select_related("user", "influencer_profile")
        .exclude(user_id=brand_user_id)
    )

    scored: list[tuple[int, str, UserProfile]] = []
    for ip in inf_profiles:
        if not ip.influencer_profile:
            continue
        score, matched_niche = score_influencer_for_brand(ip, brand_profile)
        if score >= MIN_SCORE_THRESHOLD:
            scored.append((score, matched_niche, ip))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:MAX_MATCHES_PER_EVENT]

    return [
        {
            "influencer_id": ip.user_id,
            "brand_id": brand_user_id,
            "matched_niche": niche,
            "score": score,
            "brand_name": brand_name,
            "niche": niche,
        }
        for score, niche, ip in top
    ]
