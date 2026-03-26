"""
ADDITIONS FILE: user_service/authentication/views.py + models.py
=================================================================
Copy the functions below to the BOTTOM of your existing views.py.
The model addition goes in models.py.
URLs go in authentication/urls.py.
"""

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Add to user_service/authentication/models.py
# (Add this new model class at the bottom of the file)
# ─────────────────────────────────────────────────────────────────────────────

NEW_MODEL = """
class SavedInfluencer(models.Model):
    \"\"\"Phase 7: Brands can bookmark influencers they want to work with.\"\"\"
    brand_user_id = models.IntegerField()
    influencer_user_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['brand_user_id', 'influencer_user_id']]
        ordering = ['-created_at']

    def __str__(self):
        return f"Brand {self.brand_user_id} saved Influencer {self.influencer_user_id}"
"""

# After adding the model, run:
#   docker compose exec user_service python manage.py makemigrations authentication
#   docker compose exec user_service python manage.py migrate


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Add these URLs to user_service/authentication/urls.py
# ─────────────────────────────────────────────────────────────────────────────

URLS_TO_ADD = """
    path('save_influencer/<int:influencer_id>/', views.save_influencer, name='save-influencer'),
    path('unsave_influencer/<int:influencer_id>/', views.unsave_influencer, name='unsave-influencer'),
    path('get_saved_influencers/', views.get_saved_influencers, name='saved-influencers'),
    path('platform_stats/', views.get_platform_stats, name='platform-stats'),
"""


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Copy these functions to the bottom of views.py
# ─────────────────────────────────────────────────────────────────────────────

VIEWS_TO_ADD = '''
from .models import SavedInfluencer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_influencer(request, influencer_id):
    """Phase 7: Brand bookmarks an influencer."""
    user_id = request.user.id
    obj, created = SavedInfluencer.objects.get_or_create(
        brand_user_id=user_id,
        influencer_user_id=influencer_id,
    )
    if not created:
        return Response(generate_response("success", 200, {"message": "Already saved."}), 200)
    return Response(generate_response("success", 201, {"message": "Influencer saved."}), 201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_influencer(request, influencer_id):
    """Phase 7: Brand removes a bookmark."""
    user_id = request.user.id
    deleted, _ = SavedInfluencer.objects.filter(
        brand_user_id=user_id,
        influencer_user_id=influencer_id,
    ).delete()
    if deleted:
        return Response(generate_response("success", 200, {"message": "Removed from saved."}), 200)
    return Response(generate_response("failure", 404, {}, "Not saved."), 404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_influencers(request):
    """Phase 7: Returns all influencers a brand has bookmarked."""
    user_id = request.user.id
    saved_ids = SavedInfluencer.objects.filter(
        brand_user_id=user_id
    ).values_list('influencer_user_id', flat=True)

    profiles = UserProfile.objects.filter(
        user_id__in=saved_ids,
    ).select_related('user', 'influencer_profile')

    serializer = UserProfileSerializer(profiles, many=True)
    return Response(generate_response("success", 200, serializer.data), 200)


@api_view(['GET'])
def get_platform_stats(request):
    """
    Phase 7: Public endpoint — returns live platform counts for homepage social proof.
    No auth required so it works on the public homepage.
    """
    from django.contrib.auth.models import User
    from .models import Log

    total_users = UserProfile.objects.count()
    total_influencers = UserProfile.objects.filter(
        signed_up_as__in=["influencer", "both"]
    ).count()
    total_brands = UserProfile.objects.filter(
        signed_up_as__in=["brand", "both"]
    ).count()
    completed = Log.objects.filter(type_alias="CAMPAIGN_COMPLETED").count()

    return Response(generate_response("success", 200, {
        "total_users": total_users,
        "total_influencers": total_influencers,
        "total_brands": total_brands,
        "campaigns_completed": completed,
    }), 200)
'''
