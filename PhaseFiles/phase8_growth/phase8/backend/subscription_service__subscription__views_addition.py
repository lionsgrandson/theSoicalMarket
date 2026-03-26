"""
ADDITION FILE: subscription_service/subscription/views.py
==========================================================
Copy the get_all_subscriptions function to the BOTTOM of your existing views.py.
Then add the URL to subscription_service/subscription/urls.py.
"""

# ─────────────────────────────────────────────────────────────────────────────
# ADD to subscription_service/subscription/urls.py:
#   path('get_all_subscriptions/', views.get_all_subscriptions),
# ─────────────────────────────────────────────────────────────────────────────

FUNCTION_TO_ADD = '''
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Subscription
from .serializers import SubscriptionSerializer


@api_view(["GET"])
def get_all_subscriptions(request):
    """
    Phase 8: Internal endpoint used by the Celery beat renewal reminder task.
    Returns all active/trialing subscriptions with their renewal dates.
    Not exposed through the gateway — internal service-to-service only.
    """
    subs = Subscription.objects.filter(
        status__in=["active", "trialing"],
        current_period_end__isnull=False,
    ).values(
        "user",
        "plan_name",
        "status",
        "current_period_end",
        "cancel_at_period_end",
    )
    return Response({"status": "success", "data": list(subs)}, 200)
'''
