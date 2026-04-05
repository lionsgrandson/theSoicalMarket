from django.contrib import admin
from .models import Campaign, Hire, Files


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = (
        "campaign_name",
        "campaign_owner",
        "campaign_status",
        "budget_type",
        "budget_range",
        "timestamp",
    )
    list_filter = (
        "campaign_status",
        "budget_type",
        "content_approval_required",
        "auto_match_micro_influencers",
    )
    search_fields = (
        "campaign_name",
        "campaign_description",
        "target_audience",
        "keywords_and_hashtags",
    )
    readonly_fields = ("timestamp",)
    ordering = ("-timestamp",)


@admin.register(Hire)
class HireAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "owner_id",
        "hired_influencer_id",
        "campaign_id",
        "budget",
        "is_accepted_by_influencer",
        "is_rejected_by_influencer",
        "is_completed_marked_by_brand",
        "timestamp",
    )
    list_filter = (
        "is_accepted_by_influencer",
        "is_rejected_by_influencer",
        "is_completed_marked_by_brand",
    )
    search_fields = (
        "owner_id",
        "hired_influencer_id",
        "campaign_id",
        "proposal_message",
    )
    readonly_fields = ("timestamp",)
    ordering = ("-timestamp",)


@admin.register(Files)
class FilesAdmin(admin.ModelAdmin):
    list_display = ("id", "link")
