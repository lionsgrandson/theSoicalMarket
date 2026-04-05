from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.contrib.auth.models import User
from .models import BrandInfo, InfluencerInfo, UserProfile, Feedback, Log


# ── Custom admin site with dashboard ─────────────────────────────────────────

class SocialMarketAdminSite(admin.AdminSite):
    site_header = "The Social Market Admin"
    site_title = "The Social Market"
    index_title = "Platform Overview"

    def get_urls(self):
        urls = super().get_urls()
        custom = [path("dashboard/", self.admin_view(self.dashboard_view), name="dashboard")]
        return custom + urls

    def dashboard_view(self, request):
        # Import here to avoid circular imports
        from django.db.models import Count

        total_users = UserProfile.objects.count()
        total_influencers = UserProfile.objects.filter(
            signed_up_as__in=["influencer", "both"]
        ).count()
        total_brands = UserProfile.objects.filter(
            signed_up_as__in=["brand", "both"]
        ).count()

        # Cross-service counts use Log events since we can't query other DBs directly
        total_proposals = Log.objects.filter(type_alias="PROPOSAL_SENT").count()
        accepted_proposals = Log.objects.filter(type_alias="PROPOSAL_ACCEPTED").count()
        rejected_proposals = Log.objects.filter(type_alias="PROPOSAL_REJECTED").count()
        pending_proposals = max(0, total_proposals - accepted_proposals - rejected_proposals)
        completed_campaigns = Log.objects.filter(type_alias="CAMPAIGN_COMPLETED").count()
        completion_rate = (
            round(completed_campaigns / accepted_proposals * 100)
            if accepted_proposals > 0 else 0
        )

        # Subscription counts (from Log events as proxy)
        active_subscriptions = Log.objects.filter(type_alias="SUBSCRIPTION_CREATED").count()
        trialing_subscriptions = 0  # set when Stripe webhook logs trialing events

        total_campaigns = Log.objects.filter(type_alias__in=[
            "PROPOSAL_SENT", "PROPOSAL_ACCEPTED", "CAMPAIGN_COMPLETED"
        ]).values("text").distinct().count()
        active_campaigns = accepted_proposals - completed_campaigns

        recent_logs = Log.objects.order_by("-timestamp")[:30]

        context = {
            **self.each_context(request),
            "title": "Dashboard",
            "total_users": total_users,
            "total_influencers": total_influencers,
            "total_brands": total_brands,
            "total_campaigns": total_campaigns,
            "active_campaigns": max(0, active_campaigns),
            "total_proposals": total_proposals,
            "accepted_proposals": accepted_proposals,
            "rejected_proposals": rejected_proposals,
            "pending_proposals": pending_proposals,
            "completed_campaigns": completed_campaigns,
            "completion_rate": completion_rate,
            "active_subscriptions": active_subscriptions,
            "trialing_subscriptions": trialing_subscriptions,
            "recent_logs": recent_logs,
        }
        return render(request, "admin/dashboard.html", context)


admin_site = SocialMarketAdminSite(name="tsm_admin")


# ── Model registrations ───────────────────────────────────────────────────────

@admin.register(InfluencerInfo, site=admin_site)
class InfluencerInfoAdmin(admin.ModelAdmin):
    list_display = (
        "display_name", "instagram_handle", "tiktok_handle",
        "youtube_handle", "is_featured", "stripe_connected",
    )
    list_filter = ("is_featured", "stripe_connected", "gender", "timezone")
    search_fields = (
        "display_name", "instagram_handle", "tiktok_handle",
        "youtube_handle", "facebook_handle", "linkedin_handle",
    )
    readonly_fields = ()
    fieldsets = (
        ("Basic Info", {"fields": ("display_name", "profile_picture", "short_bio", "gender", "timezone")}),
        ("Social Handles", {"fields": (
            "instagram_handle", "tiktok_handle", "youtube_handle", "twitter_handle",
            "linkedin_handle", "facebook_handle", "whatsapp_handle",
        )}),
        ("Audience & Content", {"fields": (
            "content_niches", "audience_demographics", "keyword_and_tags",
            "content_formats", "audience_reach",
        )}),
        ("Followers Count", {"fields": (
            "insta_follower", "facebook_follower", "tiktok_follower", "linkedin_follower",
            "youtube_follower", "blog_follower",
        )}),
        ("Rates", {"fields": (
            "rate_range_for_social_post", "rate_range_for_instagram_story",
            "rate_range_for_instagram_reel", "rate_range_for_tiktok_video",
            "rate_range_for_youtube_video", "rate_range_for_youtube_short",
            "rate_range_for_blog_post", "rate_range_for_repost",
            "rate_range_for_podcast_mention", "rate_range_for_live_stream",
            "rate_range_for_ugc_creation", "rate_range_for_whatsapp_status_post",
            "rate_range_for_facebook_post", "rate_range_for_affiliate_marketing_percent",
        )}),
        ("Payment Info", {"fields": (
            "payment_method", "account_holder_name", "account_number",
            "routing_number", "bank_name", "paypal_email", "stripe_connected",
        )}),
        ("Preferences", {"fields": (
            "response_time", "payment_preferences",
            "notifications_email", "notifications_push", "is_featured",
        )}),
    )


@admin.register(BrandInfo, site=admin_site)
class BrandInfoAdmin(admin.ModelAdmin):
    list_display = ("business_name", "website", "timezone", "choosen_plan", "is_featured")
    list_filter = ("timezone", "choosen_plan", "is_featured")
    search_fields = ("business_name", "website", "display_name", "instagram_handle", "tiktok_handle", "x_handle")
    fieldsets = (
        ("Brand Identity", {"fields": (
            "business_name", "logo", "website", "short_bio", "business_type", "brand_tone", "mission",
        )}),
        ("Targeting", {"fields": ("targeted_audience", "audience_demographic", "keyword_hashtags")}),
        ("Social Presence", {"fields": (
            "instagram_handle", "tiktok_handle", "x_handle", "linkedin_profile", "whatsapp_business",
        )}),
        ("Plan & Settings", {"fields": ("choosen_plan", "timezone", "is_featured")}),
        ("Contact Person", {"fields": ("display_name", "designation")}),
    )


@admin.register(UserProfile, site=admin_site)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "user_id", "signed_up_as", "signup_method", "is_verified")
    list_filter = ("signed_up_as", "signup_method", "is_verified")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("current_verification_code",)
    fieldsets = (
        ("User", {"fields": ("user",)}),
        ("Account Status", {"fields": (
            "signed_up_as", "signup_method", "is_verified", "current_verification_code",
        )}),
        ("Profiles", {"fields": ("influencer_profile", "brand_profile")}),
    )


@admin.register(Feedback, site=admin_site)
class FeedbackAdmin(admin.ModelAdmin):
    pass


@admin.register(Log, site=admin_site)
class LogAdmin(admin.ModelAdmin):
    list_display = ("id", "type_alias", "short_text", "timestamp")
    list_filter = ("type_alias", "timestamp")
    search_fields = ("text", "type_alias")
    ordering = ("-timestamp",)
    readonly_fields = ("type_alias", "text", "timestamp")

    def short_text(self, obj):
        return obj.text[:60] + "..." if len(obj.text) > 60 else obj.text
    short_text.short_description = "Log Text"


# Register Django's built-in User model too
@admin.register(User, site=admin_site)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("is_staff", "is_superuser", "is_active")
