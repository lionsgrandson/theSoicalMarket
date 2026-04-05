"""
Additions to campaign_service/campaign/urls.py and views.py

Add the pending_hires endpoint that the Celery beat reminder task reads.
This file shows only the new additions — merge into existing urls.py and views.py.
"""

# ─── ADD TO urls.py ───────────────────────────────────────────────────────────
# path('pending_hires/', views.get_pending_hires, name='pending_hires'),


# ─── ADD TO views.py ──────────────────────────────────────────────────────────

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Hire
from .serializers import HireGetSerializer
from .utils import generate_response
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
def get_pending_hires(request):
    """
    Internal endpoint — returns Hire objects that are:
      - Not yet accepted or rejected by the influencer
      - Older than 24 hours (so we only remind on genuinely stale proposals)

    Called by the Celery beat send_pending_proposal_reminders task.
    Not exposed through the gateway — internal service-to-service only.
    """
    cutoff = timezone.now() - timedelta(hours=24)

    pending = Hire.objects.filter(
        is_accepted_by_influencer=False,
        is_rejected_by_influencer=False,
        timestamp__lt=cutoff,
    ).order_by('timestamp')

    serializer = HireGetSerializer(pending, many=True)
    return Response(generate_response("success", 200, serializer.data), 200)
