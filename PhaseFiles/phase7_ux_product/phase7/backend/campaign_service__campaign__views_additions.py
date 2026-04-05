"""
ADDITIONS FILE: campaign_service/campaign/views.py
===================================================
Copy the three functions below to the BOTTOM of your existing views.py.
Then add the corresponding URLs (shown at the top of each function).
"""

# ─────────────────────────────────────────────────────────────────────────────
# ADD to campaign_service/campaign/urls.py:
#   path('give_brand_rating/<int:offer_id>/', views.give_brand_rating),
#   path('campaign_performance/<int:campaign_id>/', views.get_campaign_performance),
# ─────────────────────────────────────────────────────────────────────────────

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Hire, Campaign
from .utils import generate_response
from .permissions import IsJWTAuthenticated
from rest_framework.decorators import permission_classes


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def give_brand_rating(request, offer_id):
    """
    Phase 7: Influencer rates the brand after campaign completion.
    Was missing — only brands could rate influencers before.
    
    URL: PATCH /give_brand_rating/<offer_id>/
    Body: { "rating": 4.5 }
    """
    user_id = int(request.token_payload.get('user_id'))
    rating = request.data.get('rating')

    if not rating:
        return Response(generate_response("failure", 400, {}, "Rating is required."), 400)

    try:
        rating = float(rating)
        if not (1 <= rating <= 5):
            return Response(generate_response("failure", 400, {}, "Rating must be between 1 and 5."), 400)
    except (ValueError, TypeError):
        return Response(generate_response("failure", 400, {}, "Invalid rating value."), 400)

    try:
        h = Hire.objects.get(pk=offer_id)
    except Hire.DoesNotExist:
        return Response(generate_response("failure", 404, {}, "Offer not found."), 404)

    if h.hired_influencer_id != user_id:
        return Response(generate_response("failure", 403, {}, "You are not the influencer on this offer."), 403)

    if not h.is_completed_marked_by_brand:
        return Response(generate_response("failure", 400, {}, "Cannot rate until the campaign is marked complete."), 400)

    # Store as brand_rating (add this field to Hire model — see instructions below)
    h.brand_rating = rating
    h.save(update_fields=['brand_rating'])

    return Response(generate_response("success", 200, {"message": "Rating submitted."}), 200)


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_campaign_performance(request, campaign_id):
    """
    Phase 7: Returns aggregated performance stats for a campaign.
    Used by brand dashboard to show how each campaign performed.
    
    URL: GET /campaign_performance/<campaign_id>/
    """
    user_id = int(request.token_payload.get('user_id'))

    try:
        campaign = Campaign.objects.get(pk=campaign_id)
    except Campaign.DoesNotExist:
        return Response(generate_response("failure", 404, {}, "Campaign not found."), 404)

    if campaign.campaign_owner != user_id:
        return Response(generate_response("failure", 403, {}, "Not your campaign."), 403)

    hires = Hire.objects.filter(campaign_id=campaign_id)

    stats = hires.aggregate(
        total_proposals=Count('id'),
        accepted=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(is_accepted_by_influencer=True)),
        rejected=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(is_rejected_by_influencer=True)),
        completed=Count('id', filter=__import__('django.db.models', fromlist=['Q']).Q(is_completed_marked_by_brand=True)),
        avg_rating=Avg('rating'),
        total_spend=__import__('django.db.models', fromlist=['Sum']).Sum('budget'),
    )

    total = stats['total_proposals'] or 0
    accepted = stats['accepted'] or 0

    data = {
        "campaign_id": campaign_id,
        "campaign_name": campaign.campaign_name,
        "total_proposals": total,
        "accepted": accepted,
        "rejected": stats['rejected'] or 0,
        "pending": total - accepted - (stats['rejected'] or 0),
        "completed": stats['completed'] or 0,
        "acceptance_rate": round(accepted / total * 100) if total > 0 else 0,
        "completion_rate": round((stats['completed'] or 0) / accepted * 100) if accepted > 0 else 0,
        "average_rating": round(stats['avg_rating'] or 0, 1),
        "total_spend": float(stats['total_spend'] or 0),
    }

    return Response(generate_response("success", 200, data), 200)


# ─────────────────────────────────────────────────────────────────────────────
# MIGRATION REQUIRED for give_brand_rating:
# Add brand_rating field to the Hire model in campaign_service/campaign/models.py:
#
#   brand_rating = models.FloatField(null=True, blank=True)
#
# Then run:
#   docker compose exec campaign_service python manage.py makemigrations campaign
#   docker compose exec campaign_service python manage.py migrate
# ─────────────────────────────────────────────────────────────────────────────
