"""
user_service/authentication/views.py  — automation triggers added

Every place a user action should fire an email or notification now calls:
    dispatch_automation_event.delay('EVENT_KEY', payload)

This is fire-and-forget — the Celery worker handles it asynchronously
so the HTTP response is never delayed.
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError
from .models import UserProfile, InfluencerInfo, BrandInfo, Feedback, Log, LOG_TYPE_ALIASES
from .serializers import (
    UserProfileSerializer, UserProfileUpdateSerializer,
    InfluencerInfoSerializer, BrandInfoSerializer,
)
from .utils import generate_response, send_otp_via_email, get_frequent_platforms, get_hires_and_campaigns
from django.views.decorators.csrf import csrf_exempt
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F
import json
import logging

logger = logging.getLogger(__name__)


def _dispatch(event: str, payload: dict):
    """Fire a Celery automation event without blocking the request."""
    try:
        from celery_s.automations import dispatch_automation_event
        dispatch_automation_event.delay(event, payload)
    except Exception as e:
        # Never let automation dispatch failures crash the main request
        logger.warning(f"[views] automation dispatch failed for {event}: {e}")


# ─── Signup ───────────────────────────────────────────────────────────────────

@csrf_exempt
@api_view(['POST'])
def signup(request):
    data = request.data
    username = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    signup_method = data.get('signup_method')
    signed_up_as = data.get('signed_up_as')

    if not all([username, password, first_name, last_name, signup_method]):
        return Response(generate_response("failure", 400, {}, "Missing required fields."), status=400)

    if User.objects.filter(username=username).exists():
        return Response(generate_response("failure", 400, {}, "Email already in use."), status=400)

    user = User.objects.create_user(
        username=username, email=username,
        password=password, first_name=first_name, last_name=last_name,
    )
    ii = InfluencerInfo.objects.create()
    bi = BrandInfo.objects.create()

    profile = UserProfile(
        user=user, signup_method=signup_method,
        influencer_profile=ii, brand_profile=bi,
        signed_up_as=signed_up_as,
    )
    profile.save()

    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['email'] = user.email

    # Log signup
    Log.objects.create(
        type_alias='NEW_INFLUENCER' if signed_up_as in ['influencer', 'both'] else 'NEW_BRAND',
        text=f"New user signed up as {signed_up_as} — {first_name} {last_name} ({username})"
    )

    # ── Trigger: profile incomplete nudge will be sent 24h from now by Celery Beat ──
    # (check_incomplete_profiles beat task handles this automatically)

    response = generate_response("Success", 201, {
        "Message": "Successfully Created User.",
        'refresh_token': str(refresh),
        'access_token': str(access_token),
    })
    return Response(response, status=201)


@csrf_exempt
@api_view(['POST'])
def social_signup_signin(request):
    data = request.data
    username = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    signup_method = data.get('signup_method')
    signed_up_as = data.get('signed_up_as')

    if not all([username, first_name, last_name, signup_method]):
        return Response(generate_response("failure", 400, {}, "Missing required fields."), status=400)

    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        access_token['username'] = user.username
        access_token['email'] = user.email
        return Response(generate_response("Success", 200, {
            "Message": "User Exists",
            'refresh_token': str(refresh),
            'access_token': str(access_token),
        }), status=200)

    user = User.objects.create_user(
        username=username, email=username,
        password=password or User.objects.make_random_password(),
        first_name=first_name, last_name=last_name,
    )
    ii = InfluencerInfo.objects.create()
    bi = BrandInfo.objects.create()
    UserProfile.objects.create(
        user=user, signup_method=signup_method,
        influencer_profile=ii, brand_profile=bi,
        signed_up_as=signed_up_as,
    )

    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['email'] = user.email

    return Response(generate_response("Success", 201, {
        "Message": "Successfully Created User.",
        'refresh_token': str(refresh),
        'access_token': str(access_token),
    }), status=201)


# ─── Login ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not all([email, password]):
        return Response({'error': 'Email and password are required.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(generate_response("failure", 401, {}, "Invalid credentials."), status=401)

    user = authenticate(username=user.username, password=password)
    if user is None:
        return Response(generate_response("failure", 401, {}, "Invalid credentials."), status=401)

    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['email'] = user.email

    return Response(generate_response("success", 200, {
        'refresh_token': str(refresh),
        'access_token': str(access_token),
    }), status=200)


# ─── Profile ──────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    try:
        profile = UserProfile.objects.select_related(
            'user', 'influencer_profile', 'brand_profile'
        ).get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(generate_response("success", 200, serializer.data), status=200)
    except UserProfile.DoesNotExist:
        return Response(generate_response("failure", 404, {}, "Profile not found."), status=404)


@api_view(['GET'])
def get_user_info_by_id(request, user_id):
    try:
        profile = UserProfile.objects.select_related(
            'user', 'influencer_profile', 'brand_profile'
        ).get(user_id=user_id)
        serializer = UserProfileSerializer(profile)
        return Response(generate_response("success", 200, serializer.data), status=200)
    except UserProfile.DoesNotExist:
        return Response(generate_response("failure", 404, {}, "User not found."), status=404)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    data = request.data.copy()
    serializer = UserProfileUpdateSerializer(instance=profile, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        response_serializer = UserProfileUpdateSerializer(instance=profile)
        return Response(generate_response("success", 200, response_serializer.data), status=200)
    return Response(generate_response("failure", 400, {}, serializer.errors), status=400)


@api_view(['GET'])
def get_all_influencers(request):
    desired_roles = ["influencer", "both"]
    qs = UserProfile.objects.filter(signed_up_as__in=desired_roles).select_related(
        'user', 'influencer_profile'
    ).filter(user_id__isnull=False, influencer_profile__isnull=False).annotate(
        net_follower=(
            F('influencer_profile__insta_follower') + F('influencer_profile__facebook_follower') +
            F('influencer_profile__tiktok_follower') + F('influencer_profile__linkedin_follower') +
            F('influencer_profile__youtube_follower') + F('influencer_profile__blog_follower') +
            F('influencer_profile__whatsapp_follower') + F('influencer_profile__podcast_follower') +
            F('influencer_profile__twitter_follower')
        )
    ).filter(net_follower__gt=0)

    paginator = PageNumberPagination()
    paginator.page_size = 8
    paginated = paginator.paginate_queryset(qs, request)
    serializer = UserProfileSerializer(
        [a for a in paginated if a.user is not None and a.influencer_profile], many=True
    )
    return Response(generate_response("success", 200, paginator.get_paginated_response(serializer.data).data), 200)


@api_view(['GET'])
def get_all_brands(request):
    qs = UserProfile.objects.filter(signed_up_as__in=["brand", "both"]).select_related('user', 'brand_profile')
    serializer = UserProfileSerializer([a for a in qs if a.user is not None], many=True)
    return Response(generate_response("success", 200, serializer.data), 200)


@api_view(['GET'])
def get_a_brand(request, brand_id):
    try:
        profile = UserProfile.objects.filter(user_id=brand_id).first()
        if not profile:
            return Response({"error": "profile not found"}, 404)
        if not profile.brand_profile:
            return Response({"error": "user has no brand profile"}, 404)
        serializer = UserProfileSerializer(profile)
        res = get_hires_and_campaigns(profile.user_id, profile.brand_profile.id)
        return Response(generate_response("success", 200, {"res": res, "data": serializer.data}), 200)
    except Exception as e:
        return Response(generate_response("failure", 400, {}, str(e)), 400)


@api_view(['GET'])
def get_a_influencer(request, influencer_id):
    try:
        profile = UserProfile.objects.filter(user_id=influencer_id).first()
        if not profile:
            return Response({}, 404)
        serializer = UserProfileSerializer(profile)
        return Response(generate_response("success", 200, serializer.data), 200)
    except Exception as e:
        return Response(generate_response("failure", 400, {}, str(e)), 400)


# ─── OTP / email verification ─────────────────────────────────────────────────

@api_view(['POST'])
def send_otp(request):
    try:
        email = request.data.get('email')
        user = User.objects.get(username=email)
        profile = UserProfile.objects.get(user=user)
        otp = profile.generate_otp()
        send_otp_via_email(otp, email)
        return Response(generate_response("success", 200, "OTP sent."), 200)
    except Exception as e:
        return Response(generate_response("failure", 400, {}, str(e)), 400)


@api_view(['POST'])
def verify_email(request):
    try:
        email = request.data.get('email')
        user = User.objects.get(username=email)
        profile = UserProfile.objects.get(user=user)
        otp = int(request.data.get('otp'))

        if profile.current_verification_code != otp:
            return Response(generate_response("failure", 400, {}, "Invalid OTP."), 400)

        profile.is_verified = True
        profile.current_verification_code = None  # invalidate OTP
        profile.save()

        # ── Trigger: email verified confirmation ──
        _dispatch('EMAIL_VERIFIED', {'user_id': user.id})

        return Response(generate_response("success", 200, "Email verified successfully."), 200)
    except Exception as e:
        return Response(generate_response("failure", 400, {}, str(e)), 400)


@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    otp = request.data.get('otp')

    if not all([email, new_password, otp]):
        return Response(
            generate_response("failure", 400, {}, "Email, OTP, and new password are required."),
            status=400
        )

    try:
        user = User.objects.get(username=email)
        profile = UserProfile.objects.get(user=user)

        try:
            otp_int = int(otp)
        except (ValueError, TypeError):
            return Response(generate_response("failure", 400, {}, "Invalid OTP format."), 400)

        if profile.current_verification_code != otp_int:
            return Response(generate_response("failure", 400, {}, "Invalid or expired OTP."), 400)

        user.set_password(new_password)
        user.save()
        profile.current_verification_code = None
        profile.save()

        # ── Trigger: password reset success email ──
        _dispatch('PASSWORD_RESET_SUCCESS', {'user_id': user.id})

        return Response(generate_response("success", 200, "Password reset successfully."), 200)

    except User.DoesNotExist:
        return Response(generate_response("failure", 400, {}, "No account found with this email."), 400)
    except Exception as e:
        return Response(generate_response("failure", 400, {}, str(e)), 400)


# ─── Filtering / featured ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def filter_influencers(request):
    qs = UserProfile.objects.all().annotate(net_follower=(
        F('influencer_profile__insta_follower') + F('influencer_profile__facebook_follower') +
        F('influencer_profile__tiktok_follower') + F('influencer_profile__linkedin_follower') +
        F('influencer_profile__youtube_follower') + F('influencer_profile__blog_follower') +
        F('influencer_profile__whatsapp_follower') + F('influencer_profile__podcast_follower') +
        F('influencer_profile__twitter_follower')
    )).filter(net_follower__gt=0)

    search_query = request.data.get('search') or request.data.get('keyword')
    if search_query:
        qs = qs.filter(
            Q(user__first_name__icontains=search_query) | Q(user__last_name__icontains=search_query) |
            Q(user__username__icontains=search_query) | Q(influencer_profile__display_name__icontains=search_query) |
            Q(influencer_profile__short_bio__icontains=search_query) | Q(influencer_profile__content_niches__icontains=search_query)
        )

    niche = request.data.get('content niches') or request.data.get('niche')
    if niche:
        qs = qs.filter(influencer_profile__content_niches__icontains=niche)

    min_followers = request.data.get('min_followers')
    if min_followers:
        qs = qs.filter(net_follower__gte=int(min_followers))

    paginator = PageNumberPagination()
    paginator.page_size = 8
    paginated = paginator.paginate_queryset(qs, request)
    serializer = UserProfileSerializer(paginated, many=True)
    return Response(generate_response("success", 200, paginator.get_paginated_response(serializer.data).data), 200)


@api_view(["GET"])
def get_featured_influencers(request):
    profiles = UserProfile.objects.filter(
        influencer_profile__is_featured=True
    ).select_related("user", "influencer_profile")
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=200)


@api_view(["GET"])
def get_featured_brands(request):
    profiles = UserProfile.objects.filter(
        brand_profile__is_featured=True
    ).select_related("user", "brand_profile")
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=200)


@api_view(['POST'])
def create_feedback(request):
    Feedback.objects.create(
        subject=request.data.get('subject', ''),
        email=request.data.get('email', ''),
        text=request.data.get('feedback', ''),
    )
    return Response({"success": True})


# ─── Activity log ─────────────────────────────────────────────────────────────

@api_view(['POST'])
def create_log(request):
    type_alias = request.data.get('type_alias')
    if not type_alias or type_alias not in LOG_TYPE_ALIASES:
        raise ValidationError({"error": f"invalid type_alias. must be one of {LOG_TYPE_ALIASES}"})

    if type_alias in ['PROPOSAL_SENT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED']:
        brand_id = request.data.get('brand_id')
        influencer_id = request.data.get('influencer_id')
        try:
            brand = UserProfile.objects.get(user_id=brand_id)
            influencer = UserProfile.objects.get(user_id=influencer_id)
            brand_name = (brand.brand_profile.display_name if brand.brand_profile else None) or brand.user.first_name
            inf_name = (influencer.influencer_profile.display_name if influencer.influencer_profile else None) or influencer.user.first_name
            Log.objects.create(
                type_alias=type_alias,
                text=f"{type_alias.replace('_', ' ').title()} — {brand_name} → {inf_name}"
            )
        except UserProfile.DoesNotExist:
            pass

    elif type_alias == 'NEW_BRAND':
        try:
            brand = UserProfile.objects.get(user_id=request.data.get('brand_id'))
            name = (brand.brand_profile.display_name if brand.brand_profile else None) or brand.user.first_name
            Log.objects.create(type_alias=type_alias, text=f"New Brand: {name}")
        except UserProfile.DoesNotExist:
            pass

    elif type_alias == 'NEW_INFLUENCER':
        try:
            inf = UserProfile.objects.get(user_id=request.data.get('influencer_id'))
            # FIX: was brand_profile.display_name (NameError)
            name = (inf.influencer_profile.display_name if inf.influencer_profile else None) or inf.user.first_name
            Log.objects.create(type_alias=type_alias, text=f"New Influencer: {name}")
        except UserProfile.DoesNotExist:
            pass

    elif type_alias == 'FIRST_MESSAGE':
        try:
            # FIX: was UserProfile.object (missing 's')
            brand = UserProfile.objects.get(user_id=request.data.get('brand_id'))
            inf = UserProfile.objects.get(user_id=request.data.get('influencer_id'))
            Log.objects.create(
                type_alias=type_alias,
                text=f"First Message — {brand.user.first_name} → {inf.user.first_name}"
            )
        except UserProfile.DoesNotExist:
            pass

    elif type_alias in ['SUBSCRIPTION_CREATED', 'SUBSCRIPTION_CANCELED', 'CAMPAIGN_COMPLETED']:
        Log.objects.create(type_alias=type_alias, text=request.data.get('text', type_alias))

    return Response({"success": True})
