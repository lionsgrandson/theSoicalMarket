"""
PATCH FILE: campaign_service/campaign/views.py
===============================================
Open views.py and make these 4 surgical replacements.
Do NOT copy this whole file — make only these changes.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH 1: update_a_campaign — missing return after Campaign.DoesNotExist
# Find this exact block and replace it
# ─────────────────────────────────────────────────────────────────────────────

FIND_1 = """    try:
        campaign_object = Campaign.objects.get(pk=campaign_id)
    except:
        response = generate_response("failure", 400, {}, "Campaign Not Found")

    
    if campaign_object.campaign_owner != user:"""

REPLACE_1 = """    try:
        campaign_object = Campaign.objects.get(pk=campaign_id)
    except:
        response = generate_response("failure", 404, {}, "Campaign Not Found")
        return Response(response, 404)  # FIX: was missing return — caused UnboundLocalError

    if campaign_object.campaign_owner != user:"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 2: accept_offer — raise e before error response (unreachable handler)
# ─────────────────────────────────────────────────────────────────────────────

FIND_2 = """    except Exception as e:
        raise e
        response = generate_response(
            "failure", 400, {}, "Offer Not Found."
        )
        return Response(
            response, status=400
        )


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def reject_offer"""

REPLACE_2 = """    except Hire.DoesNotExist:
        # FIX: was "raise e" before this — made error response unreachable, always 500
        response = generate_response("failure", 404, {}, "Offer not found.")
        return Response(response, status=404)
    except Exception as e:
        response = generate_response("failure", 500, {}, str(e))
        return Response(response, status=500)


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def reject_offer"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 3: reject_offer — bare raise before error response (same bug)
# ─────────────────────────────────────────────────────────────────────────────

FIND_3 = """    except Exception as e:
        raise
        response = generate_response(
            "failure", 400, {}, "Offer Not Found."
        )
        return Response(
            response, status=400
        )
    

@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def complete_offer"""

REPLACE_3 = """    except Hire.DoesNotExist:
        # FIX: was bare "raise" before this — made error response unreachable
        response = generate_response("failure", 404, {}, "Offer not found.")
        return Response(response, status=404)
    except Exception as e:
        response = generate_response("failure", 500, {}, str(e))
        return Response(response, status=500)


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def complete_offer"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 4: get_my_previous_where_i_was_hired — pending offers included
# ─────────────────────────────────────────────────────────────────────────────

FIND_4 = """    h_set = Hire.objects.filter(hired_influencer_id=user_id, is_rejected_by_influencer=False)"""

REPLACE_4 = """    # FIX: was only filtering is_rejected=False — included pending proposals as "hirings"
    # Now requires is_accepted=True so only genuinely accepted hires appear
    h_set = Hire.objects.filter(
        hired_influencer_id=user_id,
        is_accepted_by_influencer=True,
        is_rejected_by_influencer=False,
    )"""
