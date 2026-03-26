from django.db import models
from django.conf import settings
from django.utils import timezone

class Subscription(models.Model):
    STATUS_CHOICES = [
        ("incomplete", "Incomplete"),
        ("trialing", "Trialing"),
        ("active", "Active"),
        ("past_due", "Past Due"),
        ("canceled", "Canceled"),
        ("unpaid", "Unpaid"),
    ]

    user = models.IntegerField(default=0)
    stripe_customer_id = models.CharField(max_length=100, unique=True)
    stripe_subscription_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="incomplete")
    plan_name = models.CharField(max_length=100, null=True, blank=True)
    price_id = models.CharField(max_length=100, null=True, blank=True)
    product_id = models.CharField(max_length=100, null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # FIX: was self.user.email — user is IntegerField not FK, crashed admin list
        return f"User #{self.user} — {self.plan_name or 'No Plan'} ({self.status})"

    class Meta:
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"
