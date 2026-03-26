"""
user_service/authentication/matching_views.py  (new file)

Exposes the matching engine as an internal HTTP endpoint so the Celery worker
can call it without importing Django models directly (cross-service boundary).

ADD to user_service/authentication/urls.py:
  from . import matching_views
  path('run_matching/', matching_views.run_matching, name='run_matching'),
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .matching import find_matching_brands_for_new_influencer, find_matching_influencers_for_new_brand
from .utils import generate_response
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
def run_matching(request):
    """
    Internal endpoint called by run_match_fanout Celery task on signup.
    Returns two lists:
      - brand_matches: brands to notify about the new influencer
      - influencer_matches: influencers to notify about the new brand

    Not exposed through the gateway — internal service-to-service only.
    """
    user_id = request.data.get('user_id')
    signed_up_as = request.data.get('signed_up_as', 'influencer')

    if not user_id:
        return Response(generate_response("failure", 400, {}, "user_id required"), 400)

    brand_matches = []
    influencer_matches = []

    try:
        if signed_up_as in ('influencer', 'both'):
            # New influencer joined — find brands to notify
            brand_matches = find_matching_brands_for_new_influencer(user_id)

        if signed_up_as in ('brand', 'both'):
            # New brand joined — find influencers to notify
            influencer_matches = find_matching_influencers_for_new_brand(user_id)

    except Exception as e:
        logger.error(f"[matching] run_matching({user_id}): {e}")
        return Response(generate_response("failure", 500, {}, str(e)), 500)

    logger.info(
        f"[matching] user {user_id} ({signed_up_as}): "
        f"{len(brand_matches)} brand matches, {len(influencer_matches)} influencer matches"
    )

    return Response(generate_response("success", 200, {
        'brand_matches': brand_matches,
        'influencer_matches': influencer_matches,
    }), 200)
