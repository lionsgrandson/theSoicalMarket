from django.contrib import admin

from .models import BrandInfo, InfluencerInfo, UserProfile, Feedback, Log


@admin.register(InfluencerInfo)
class InfluencerInfoAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "instagram_handle",
        "tiktok_handle",
        "youtube_handle",
        "is_featured",
        "stripe_connected",
    )

    list_filter = (
        "is_featured",
        "stripe_connected",
        "gender",
        "timezone",
    )

    search_fields = (
        "display_name",
        "instagram_handle",
        "tiktok_handle",
        "youtube_handle",
        "facebook_handle",
        "linkedin_handle",
    )

    readonly_fields = ()

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "display_name",
                "profile_picture",
                "short_bio",
                "gender",
                "timezone",
            )
        }),
        ("Social Handles", {
            "fields": (
                "instagram_handle",
                "tiktok_handle",
                "youtube_handle",
                "twitter_handle",
                "linkedin_handle",
                "facebook_handle",
                "whatsapp_handle",
            )
        }),
        ("Audience & Content", {
            "fields": (
                "content_niches",
                "audience_demographics",
                "keyword_and_tags",
                "content_formats",
                "audience_reach",
            )
        }),
        ("Followers Count", {
            "fields": (
                "insta_follower",
                "facebook_follower",
                "tiktok_follower",
                "linkedin_follower",
                "youtube_follower",
                "blog_follower",
            )
        }),
        ("Rates", {
            "fields": (
                "rate_range_for_social_post",
                "rate_range_for_instagram_story",
                "rate_range_for_instagram_reel",
                "rate_range_for_tiktok_video",
                "rate_range_for_youtube_video",
                "rate_range_for_youtube_short",
                "rate_range_for_blog_post",
                "rate_range_for_repost",
                "rate_range_for_podcast_mention",
                "rate_range_for_live_stream",
                "rate_range_for_ugc_creation",
                "rate_range_for_whatsapp_status_post",
                "rate_range_for_facebook_post",
                "rate_range_for_affiliate_marketing_percent",
            )
        }),
        ("Payment Info", {
            "fields": (
                "payment_method",
                "account_holder_name",
                "account_number",
                "routing_number",
                "bank_name",
                "paypal_email",
                "stripe_connected",
            )
        }),
        ("Preferences", {
            "fields": (
                "response_time",
                "payment_preferences",
                "notifications_email",
                "notifications_push",
                "is_featured",
            )
        }),
    )


@admin.register(BrandInfo)
class BrandInfoAdmin(admin.ModelAdmin):
    list_display = (
        "business_name",
        "website",
        "timezone",
        "choosen_plan",
        "is_featured",
    )

    list_filter = (
        "timezone",
        "choosen_plan",
        "is_featured",
    )

    search_fields = (
        "business_name",
        "website",
        "display_name",
        "instagram_handle",
        "tiktok_handle",
        "x_handle",
    )

    fieldsets = (
        ("Brand Identity", {
            "fields": (
                "business_name",
                "logo",
                "website",
                "short_bio",
                "business_type",
                "brand_tone",
                "mission",
            )
        }),
        ("Targeting", {
            "fields": (
                "targeted_audience",
                "audience_demographic",
                "keyword_hashtags",
            )
        }),
        ("Social Presence", {
            "fields": (
                "instagram_handle",
                "tiktok_handle",
                "x_handle",
                "linkedin_profile",
                "whatsapp_business",
            )
        }),
        ("Plan & Settings", {
            "fields": (
                "choosen_plan",
                "timezone",
                "is_featured",
            )
        }),
        ("Contact Person", {
            "fields": (
                "display_name",
                "designation",
            )
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "user_id",
        "signed_up_as",
        "signup_method",
        "is_verified",
    )

    list_filter = (
        "signed_up_as",
        "signup_method",
        "is_verified",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    readonly_fields = ("current_verification_code",)

    fieldsets = (
        ("User", {
            "fields": ("user",)
        }),
        ("Account Status", {
            "fields": (
                "signed_up_as",
                "signup_method",
                "is_verified",
                "current_verification_code",
            )
        }),
        ("Profiles", {
            "fields": (
                "influencer_profile",
                "brand_profile",
            )
        }),
    )


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    pass


@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "type_alias",
        "short_text",
        "timestamp",
    )

    list_filter = (
        "type_alias",
        "timestamp",
    )

    search_fields = (
        "text",
        "type_alias",
    )

    ordering = ("-timestamp",)

    readonly_fields = (
        "type_alias",
        "text",
        "timestamp",
    )
    def short_text(self, obj):
        return obj.text[:60] + "..." if len(obj.text) > 60 else obj.text

    short_text.short_description = "Log Text"