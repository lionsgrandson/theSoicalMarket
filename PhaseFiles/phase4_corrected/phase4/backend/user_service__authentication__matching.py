"""
user_service/authentication/matching.py

Matching engine — finds the best influencer-brand pairs based on niche
overlap, follower range, and platform presence.

Called from:
  - The signup view (new user joins → find matches and notify)
  - The Celery beat daily_match_scan task (scan recent joiners)
  - The filter_influencers view (filter_by_self=True path)

Design principles:
  - Scoring is transparent: each factor contributes a defined number of points
  - No ML needed: simple overlap scoring is readable, debuggable, and fast
  - Fan-out is capped (MAX_MATCHES_PER_EVENT) so a popular new joiner doesn't
    spam every user on the platform
"""

from django.db.models import Q, F, Value
from django.db.models.functions import Coalesce
from .models import UserProfile, InfluencerInfo, BrandInfo
import logging

logger = logging.getLogger(__name__)

MAX_MATCHES_PER_EVENT = 10   # max users notified when one person joins
MIN_SCORE_THRESHOLD = 20     # minimum score to be considered a match


# ─── Scoring weights ──────────────────────────────────────────────────────────

SCORE_NICHE_OVERLAP    = 40   # per matching niche keyword
SCORE_PLATFORM_OVERLAP = 15   # per matching platform
SCORE_FOLLOWER_RANGE   = 20   # follower count in brand's preferred range
SCORE_VERIFIED         = 10   # influencer is verified
SCORE_FEATURED         = 5    # influencer/brand is featured


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _parse_niches(raw: str) -> set:
    """Parse comma-separated niche string into a normalised set of keywords."""
    if not raw:
        return set()
    return {n.strip().lower() for n in raw.replace('&', ',').split(',') if n.strip()}


def _parse_platforms(profile: InfluencerInfo) -> set:
    """Return the set of platforms an influencer is active on."""
    platforms = set()
    handle_map = {
        'instagram': profile.instagram_handle,
        'tiktok': profile.tiktok_handle,
        'youtube': profile.youtube_handle,
        'twitter': profile.twitter_handle,
        'linkedin': profile.linkedin_handle,
        'facebook': profile.facebook_handle,
        'whatsapp': profile.whatsapp_handle,
        'podcast': profile.podcast_handle,
        'blog': profile.blog_handle,
    }
    for platform, handle in handle_map.items():
        if handle and handle.strip():
            platforms.add(platform)
    return platforms


def _brand_platform_prefs(brand: BrandInfo) -> set:
    """Extract platforms a brand has a presence on."""
    platforms = set()
    if brand.instagram_handle:
        platforms.add('instagram')
    if brand.tiktok_handle:
        platforms.add('tiktok')
    if brand.x_handle:
        platforms.add('twitter')
    if brand.linkedin_profile:
        platforms.add('linkedin')
    if brand.whatsapp_business:
        platforms.add('whatsapp')
    return platforms


def _total_followers(inf: InfluencerInfo) -> int:
    return sum([
        inf.insta_follower or 0,
        inf.facebook_follower or 0,
        inf.tiktok_follower or 0,
        inf.linkedin_follower or 0,
        inf.youtube_follower or 0,
        inf.blog_follower or 0,
        inf.whatsapp_follower or 0,
        inf.podcast_follower or 0,
        inf.twitter_follower or 0,
    ])


def _format_followers(n: int) -> str:
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.0f}K"
    return str(n)


# ─── Core scorer ─────────────────────────────────────────────────────────────

def score_influencer_for_brand(
    influencer_profile: UserProfile,
    brand_profile: UserProfile,
) -> tuple[int, str]:
    """
    Score how well an influencer matches a brand.
    Returns (score, matched_niche) — matched_niche is the top overlapping keyword.
    """
    score = 0
    matched_niche = ""

    inf = influencer_profile.influencer_profile
    brand = brand_profile.brand_profile

    if not inf or not brand:
        return 0, ""

    # Niche overlap: brand's targeted_audience vs influencer's content_niches
    brand_niches = _parse_niches(brand.targeted_audience) | _parse_niches(brand.keyword_hashtags)
    inf_niches = _parse_niches(inf.content_niches) | _parse_niches(inf.keyword_and_tags)

    overlapping = brand_niches & inf_niches
    if overlapping:
        score += SCORE_NICHE_OVERLAP * len(overlapping)
        matched_niche = sorted(overlapping)[0].title()

    # Platform overlap
    inf_platforms = _parse_platforms(inf)
    brand_platforms = _brand_platform_prefs(brand)
    platform_overlap = inf_platforms & brand_platforms
    score += SCORE_PLATFORM_OVERLAP * len(platform_overlap)

    # Verified bonus
    if influencer_profile.is_verified:
        score += SCORE_VERIFIED

    # Featured bonus
    if inf.is_featured:
        score += SCORE_FEATURED

    # Follower count bonus (reward micro-influencers in the 1K–500K range)
    followers = _total_followers(inf)
    if 1_000 <= followers <= 500_000:
        score += SCORE_FOLLOWER_RANGE

    return score, matched_niche


# ─── Fan-out functions ───────────────────────────────────────────────────────

def find_matching_brands_for_new_influencer(influencer_user_id: int) -> list[dict]:
    """
    Called when a new influencer joins.
    Returns up to MAX_MATCHES_PER_EVENT brand payload dicts for the automation dispatcher.
    """
    try:
        influencer_profile = UserProfile.objects.select_related(
            'user', 'influencer_profile'
        ).get(user_id=influencer_user_id)
    except UserProfile.DoesNotExist:
        return []

    if not influencer_profile.influencer_profile:
        return []

    inf = influencer_profile.influencer_profile
    inf_niches = _parse_niches(inf.content_niches) | _parse_niches(inf.keyword_and_tags)

    if not inf_niches:
        return []

    # Find brands whose targeted_audience or keywords overlap
    brand_profiles = UserProfile.objects.filter(
        signed_up_as__in=['brand', 'both']
    ).select_related('user', 'brand_profile').exclude(user_id=influencer_user_id)

    scored = []
    for bp in brand_profiles:
        if not bp.brand_profile:
            continue
        score, matched_niche = score_influencer_for_brand(influencer_profile, bp)
        if score >= MIN_SCORE_THRESHOLD:
            scored.append((score, matched_niche, bp))

    # Sort by score descending, take top N
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:MAX_MATCHES_PER_EVENT]

    return [
        {
            'brand_id': bp.user_id,
            'influencer_id': influencer_user_id,
            'matched_niche': niche,
            'score': score,
            'influencer_name': (
                inf.display_name or
                f"{influencer_profile.user.first_name} {influencer_profile.user.last_name}".strip()
            ),
            'follower_count': _format_followers(_total_followers(inf)),
            'niche': niche,
        }
        for score, niche, bp in top
    ]


def find_matching_influencers_for_new_brand(brand_user_id: int) -> list[dict]:
    """
    Called when a new brand joins.
    Returns up to MAX_MATCHES_PER_EVENT influencer payload dicts.
    """
    try:
        brand_profile = UserProfile.objects.select_related(
            'user', 'brand_profile'
        ).get(user_id=brand_user_id)
    except UserProfile.DoesNotExist:
        return []

    if not brand_profile.brand_profile:
        return []

    brand = brand_profile.brand_profile
    brand_niches = _parse_niches(brand.targeted_audience) | _parse_niches(brand.keyword_hashtags)

    if not brand_niches:
        return []

    # Find influencers with overlapping niches
    inf_profiles = UserProfile.objects.filter(
        signed_up_as__in=['influencer', 'both'],
        influencer_profile__isnull=False,
    ).select_related('user', 'influencer_profile').exclude(user_id=brand_user_id)

    scored = []
    for ip in inf_profiles:
        if not ip.influencer_profile:
            continue
        score, matched_niche = score_influencer_for_brand(ip, brand_profile)
        if score >= MIN_SCORE_THRESHOLD:
            scored.append((score, matched_niche, ip))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:MAX_MATCHES_PER_EVENT]

    inf_name_map = {}
    return [
        {
            'influencer_id': ip.user_id,
            'brand_id': brand_user_id,
            'matched_niche': niche,
            'score': score,
            'brand_name': (
                brand.business_name or brand.display_name or
                f"{brand_profile.user.first_name}".strip()
            ),
            'niche': niche,
        }
        for score, niche, ip in top
    ]
