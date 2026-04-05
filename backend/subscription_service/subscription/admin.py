from django.contrib import admin

from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "plan_name",
        "status",
        "cancel_at_period_end",
        "current_period_end",
        "updated_at",
    )
    list_filter = ("status", "plan_name", "cancel_at_period_end")
    search_fields = (
        "stripe_customer_id",
        "stripe_subscription_id",
        "plan_name",
    )
    ordering = ("-updated_at",)
    readonly_fields = ("created_at", "updated_at")
