"""
Additions to chat_service/chat/urls.py and views.py

Add the unseen_notification_counts endpoint that the Celery beat
unread reminder task reads to find who to email.

ADD TO urls.py:
  path('unseen_notification_counts/', views.get_unseen_notification_counts),
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Notification
from .utils import generate_response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count


@api_view(['GET'])
def get_unseen_notification_counts(request):
    """
    Internal endpoint — returns a list of {user_id, count} for every user
    who has unseen notifications older than 24 hours.

    Called by the Celery beat send_unread_notification_reminders task.
    Internal service-to-service only — not exposed through the gateway.
    """
    cutoff = timezone.now() - timedelta(hours=24)

    counts = (
        Notification.objects
        .filter(seen=False, timestamp__lt=cutoff)
        .values('user_id')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    data = [{'user_id': row['user_id'], 'count': row['count']} for row in counts]
    return Response(generate_response("success", 200, data), 200)
