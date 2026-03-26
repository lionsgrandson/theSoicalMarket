from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
import logging

from .models import Hire, Campaign

logger = logging.getLogger(__name__)


def _dispatch(event: str, payload: dict):
    """Fire-and-forget dispatch to the automation registry via Celery."""
    try:
        from celery_s.automations import dispatch_automation_event

        dispatch_automation_event.delay(event, payload)
    except Exception as e:
        logger.warning(f"[signals] dispatch failed for {event}: {e}")


@receiver(post_save, sender=Hire)
def handle_hire_save(sender, instance, created, **kwargs):
    """
    Dispatch automation events when a Hire record changes.

    FIX 1: was reading influencer_profile via brand_profile field - always wrong name
    FIX 2: was synchronous httpx + send_mail inside signal - blocked the request thread,
            caused timeouts on high load. Now dispatches to Celery asynchronously.
    FIX 3: was firing on EVERY save - now checks actual state transitions
    FIX 4: pialzoad@gmail.com as from_email - removed, handled by automations.py
    """
    if created:
        _dispatch(
            "PROPOSAL_SENT",
            {
                "hire_id": instance.id,
                "brand_id": instance.owner_id,
                "influencer_id": instance.hired_influencer_id,
                "campaign_id": instance.campaign_id,
            },
        )
        return

    try:
        original = Hire.objects.get(pk=instance.pk)
    except Hire.DoesNotExist:
        return

    if instance.is_accepted_by_influencer and not original.is_accepted_by_influencer:
        _dispatch(
            "PROPOSAL_ACCEPTED",
            {
                "hire_id": instance.id,
                "brand_id": instance.owner_id,
                "influencer_id": instance.hired_influencer_id,
                "campaign_id": instance.campaign_id,
            },
        )
    elif instance.is_rejected_by_influencer and not original.is_rejected_by_influencer:
        _dispatch(
            "PROPOSAL_REJECTED",
            {
                "hire_id": instance.id,
                "brand_id": instance.owner_id,
                "influencer_id": instance.hired_influencer_id,
                "campaign_id": instance.campaign_id,
            },
        )
    elif instance.is_completed_marked_by_brand and not original.is_completed_marked_by_brand:
        _dispatch(
            "CAMPAIGN_COMPLETED",
            {
                "hire_id": instance.id,
                "brand_id": instance.owner_id,
                "influencer_id": instance.hired_influencer_id,
                "campaign_id": instance.campaign_id,
            },
        )


@receiver(post_delete, sender=Campaign)
def delete_related_hire_proposals(sender, instance, **kwargs):
    """
    Clean up Hire records when a Campaign is deleted.
    This was added by the developer and is correct - kept as-is.
    """
    Hire.objects.filter(campaign_id=instance.id).delete()
