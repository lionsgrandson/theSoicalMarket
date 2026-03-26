from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import ValidationError   
from .models import UserProfile, InfluencerInfo, BrandInfo, Feedback
from .serializers import *
from .utils import generate_response, send_otp_via_email, get_frequent_platforms, get_hires_and_campaigns
from django.views.decorators.csrf import csrf_exempt
import json
import httpx

import os

from django.core.mail import send_mail

from rest_framework.pagination import PageNumberPagination

from django.db.models import Q, F



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


    # if User.objects.filter(username=username).count() > 0:
    #     user = User.objects.filter(username=username)[0]
    #     refresh = RefreshToken.for_user(user)
    #     access_token = refresh.access_token
    #     access_token['username'] = user.username
    #     access_token['email'] = user.email
    #     response = generate_response("Success", 200, {"Message": "User Exists", 'refresh_token': str(refresh),  'access_token': str(access_token)})


    #     return Response(response, status=200)


    if not all([username, password, first_name, last_name, signup_method]):
        response = generate_response("failure", 400, {}, "Missing required fields.")
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        response = generate_response("failure", 400, {}, "Email already in use.")
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=username,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    ii = InfluencerInfo()
    ii.save()
    bi = BrandInfo()
    bi.save()

    user_profile = UserProfile()
    user_profile.user = user
    user_profile.signup_method = signup_method
    user_profile.influencer_profile = ii
    user_profile.brand_profile = bi
    user_profile.signed_up_as = signed_up_as
    user_profile.save()


    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['email'] = user.email

    Log.objects.create(
        type_alias='NEW_INFLUENCER' if signed_up_as in ['influencer', 'both'] else 'NEW_BRAND',
        text=(
            f"New user signed up as {signed_up_as} - user_name: "
            f"{ii.display_name if signed_up_as in ['influencer', 'both'] else bi.display_name}"
        )
    )

    response = generate_response("Success", 201, {"Message": "Succesfully Created User.", 'refresh_token': str(refresh),  'access_token': str(access_token)})
    message = f"""
    Dear {first_name},<br>
    From The Social Market<br>
    Your account has been successfully created. Click <a href="https://thesocialmarket.com">here</a> to complete your profile.<br>
    Best Regards,<br>
    The Social Market Team
    """

    print("DEBUG SECRET CODE......")
    print("DEBUG SECRET CODE......")
    print(os.environ['SERVICES_SHARED_SECRET'])
    res = httpx.post(
        f"http://celery_service:8000/send_email_if_profile_not_complete/{user_profile.user.id}/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
        json={"message": message}
    )
    print(res.request.headers)
    # print(res.text)
    res.raise_for_status()
    return Response(response, status=status.HTTP_201_CREATED)
# ^&ASDF()_+|}{F:J./?><d,.a/;'[]=-098^d21
# ^&ASDF()_+|}{F:J./?><d,.a/;'[]=-098^d21 
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


    if User.objects.filter(username=username).count() > 0:
        user = User.objects.filter(username=username)[0]
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        access_token['username'] = user.username
        access_token['email'] = user.email
        response = generate_response("success", 200, {"Message": "User Exists", 'refresh_token': str(refresh),  'access_token': str(access_token)})


        return Response(response, status=200)


    # if not all([username, password, first_name, last_name, signup_method]):
    #     response = generate_response("failure", 400, {}, "Missing required fields.")
    #     return Response(response, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        response = generate_response("failure", 400, {}, "Email already in use.")
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=username,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    ii = InfluencerInfo()
    ii.save()
    bi = BrandInfo()
    bi.save()

    user_profile = UserProfile()
    user_profile.user = user
    user_profile.signup_method = signup_method
    user_profile.influencer_profile = ii
    user_profile.brand_profile = bi
    user_profile.signed_up_as = signed_up_as
    user_profile.save()


    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['email'] = user.email


    response = generate_response("Success", 201, {"Message": "Succesfully Created User.", 'refresh_token': str(refresh),  'access_token': str(access_token)})


    return Response(response, status=status.HTTP_201_CREATED)



@csrf_exempt
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not all([email, password]):
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        response = generate_response("failure", 400, {}, "Invalid credentials.")
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user.username, password=password)
    if user is None:
        response = generate_response("failure", 400, {}, "Invalid credentials.")
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['email'] = user.email


    response = generate_response("success", 200, {'refresh_token': str(refresh),  'access_token': str(access_token)})

    print('I am hitted')
    return Response(response, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user

    profile, created = UserProfile.objects.get_or_create(user=user)

    data = UserProfileSerializer(profile).data

    print(">>>>>>>>>>")
    print(">>>>>>>>>>")
    
    print(data['is_brand_profile_complete'])
    print(data['is_influencer_profile_complete'])
    response = generate_response("success", 200, data)

    return Response(
       response,
        status=200
    )


@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user_info_by_id(request, user_id):
    print("DEBUG .........SDFSDFSFSDF")
    if request.user.is_anonymous:
        service_shared_secret = request.headers.get('services-shared-secret')
        if service_shared_secret and service_shared_secret != os.environ.get('SERVICES_SHARED_SECRET'):
            print("Authenticated by shared secret for user_id:", user_id)
            raise ValidationError("Invalid shared secret.")

    user = User.objects.filter(id=user_id).first()
    if not user:
        print("User not found with id:", user_id)
        response = generate_response("failure", 400, {}, "User not found.")
        return Response(response, status=404)
    profile, created = UserProfile.objects.get_or_create(user=user)

    data = UserProfileSerializer(profile).data

    response = generate_response("success", 200, data)

    return Response(
       response,
        status=200
    )

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_user_info_by_id(request, user_id):
#     from django.shortcuts import get_object_or_404
#     from django.contrib.auth import get_user_model

#     User = get_user_model()

#     user = get_object_or_404(User, id=user_id)

#     profile = user.profile

#     data = UserProfileSerializer(profile).data

#     brand = profile.brand_profile
#     res = get_hires_and_campaigns(user_id, brand.id)
#     response = generate_response("success", 200, data)

#     return Response(res, status=200)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    print('i got a hit')
    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    data = request.data.copy()

    # profile_picture_file = request.FILES.get('profile_picture')
    # if profile_picture_file:
    #     profile.influencer_profile._profile_picture_file = profile_picture_file
    #     profile.influencer_profile.save()

    # for key in ['user', 'influencer_profile', 'brand_profile']:
    #     if key in data and isinstance(data[key], str):
    #         try:
    #             data[key] = json.loads(data[key])
    #         except json.JSONDecodeError:
    #             response = generate_response("failure", 400, {}, f"Invalid JSON format for '{key}'.")
    #             return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    if profile.signed_up_as == 'brand':
        brand_profile_updated_now=profile.is_brand_profile_complete
    elif profile.signed_up_as == 'influencer':
        brand_profile_updated_now=profile.is_influencer_profile_complete
    serializer = UserProfileUpdateSerializer(instance=profile, data=data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        if brand_profile_updated_now^serializer.data['is_brand_profile_complete'] or True:

            maching_influencers = UserProfile.objects.filter(
                is_brand_profile_complete=True,
                signed_up_as__in=['influencer', 'both'],
                influencer_profile__content_niches__icontains=profile.brand_profile.business_type
            )
            influencer_emails = [inf.user.email for inf in maching_influencers]
            send_mail(
                from_email=os.environ['EMAIL_HOST_USER'],
                subject="New Match!",
                message=f"""
Dear Influencer,
From The Social Market

A brand that matches your vibe just joined The Social Market! Check it out before anyone else does. visit href="https://thesocialmarket.com to message them and begin your next collab.
Best Regards,
The Social Market Team
                """,
                html_message=f"""
Dear Influencer,
From The Social Market

A brand that matches your vibe just joined The Social Market! Check it out before anyone else does. Click <a href="https://thesocialmarket.com">here</a> to message them and begin your next collab.
Best Regards,
The Social Market Team
                """,

                recipient_list=influencer_emails
            )
        elif brand_profile_updated_now^serializer.data['is_influencer_profile_complete'] or True:
            matching_brands = UserProfile.objects.filter(
                is_influencer_profile_complete=True,
                signed_up_as__in=['brand', 'both'],
                content_niches__icontains=profile.influencer_profile.content_niches
            )
            brand_emails = [inf.user.email for inf in matching_brands]
            send_mail(
                subject="New Match!",
                message=f"""
Dear Brand,
From The Social Market

An influencer that matches your vibe just joined The Social Market! Check it out before anyone else does. visit https://thesocialmarket.com to message them and begin your next collab.
Best Regards,
The Social Market Team
                """,
                html_message=f"""
Dear Brand,
From The Social Market

An influencer that matches your vibe just joined The Social Market! Check it out before anyone else does. Click <a href="https://thesocialmarket.com">here</a> to message them and begin your next collab.
Best Regards,
The Social Market Team
                """,

                recipient_list=brand_emails
            )
        response_serializer = UserProfileUpdateSerializer(instance=profile)

        response = generate_response("success", 200, response_serializer.data)
        return Response(response, status=200)
    else:
        response = generate_response("failure", 400, {}, serializer.errors)
        return Response(response, status=400)



@api_view(['GET'])
def get_all_influencers(request):
    desired_roles = ["influencer", "both"]
    influencer_profiles = UserProfile.objects.filter(signed_up_as__in=desired_roles).order_by('-id')
    influencer_profiles = influencer_profiles.select_related('user', 'influencer_profile')
    influencer_profiles = influencer_profiles.filter(user_id__isnull=False, influencer_profile__isnull=False)
    influencer_profiles = influencer_profiles.filter(Q(is_brand_profile_complete=True) | Q(is_influencer_profile_complete=True))
    
    # influencer_profiles = influencer_profiles.annotate(net_follower=(
    #     F('influencer_profile__insta_follower') +
    #     F('influencer_profile__facebook_follower') +
    #     F('influencer_profile__tiktok_follower') +
    #     F('influencer_profile__linkedin_follower') +
    #     F('influencer_profile__youtube_follower') +
    #     F('influencer_profile__blog_follower') +
    #     F('influencer_profile__whatsapp_follower') +
    #     F('influencer_profile__podcast_follower') +
    #     F('influencer_profile__twitter_follower')
    # )).filter(net_follower__gt=0)

    paginator = PageNumberPagination()
    paginator.page_size = 8

    paginated_campaigns = paginator.paginate_queryset(influencer_profiles, request)

    serializer = UserProfileSerializer([a for a in paginated_campaigns if a.user is not None and a.influencer_profile], many=True)

    response = generate_response("success", 200, paginator.get_paginated_response(serializer.data).data)

    # serializer = UserProfileSerializer(influencer_profiles, many=True)

    # response = generate_response("success", 200, serializer.data)

    return Response(
        response, 200
    )


@api_view(['GET'])
def get_all_brands(request):
    desired_roles = ["brand", "both"]
    influencer_profiles = UserProfile.objects.filter(
        signed_up_as__in=desired_roles, brand_profile__isnull=False, user_id__isnull=False
    ).order_by('-id')
    influencer_profiles = influencer_profiles.filter(Q(is_brand_profile_complete=True) | Q(is_influencer_profile_complete=True))
    serializer = UserProfileSerializer([a for a in influencer_profiles if a.user is not None], many=True)

    response = generate_response("success", 200, serializer.data)

    return Response(
        response, 200
    )

@api_view(['GET'])
def get_a_brand(request, brand_id):
    try: 
        # influencer_profiles = UserProfile.objects.get(pk=brand_id)

        influencer_profiles = UserProfile.objects.filter(user_id=brand_id).first()

        if not influencer_profiles:
            return Response({
                "error": "profile not found"
            },404)

        serializer = UserProfileSerializer(influencer_profiles)

        # response = generate_response("success", 200, serializer.data)

        # brand = profile.profile.brand_profile
        if not influencer_profiles.brand_profile:
            return Response({
                "error": "user has no brand profile",
            }, 404)
        res = get_hires_and_campaigns(influencer_profiles.user_id, influencer_profiles.brand_profile.id)
        response = generate_response("success", 200, {"res": res, "data": serializer.data})

        return Response(response, status=200)
    except Exception as e:
        response = generate_response(
            "failure", 400, {}, "Brand profile not found."
        )
        return response


@api_view(['GET'])
def get_a_influencer(request, influencer_id):
    try:
        influencer_profiles = UserProfile.objects.filter(user_id=influencer_id).first()

        if not influencer_profiles:
            return Response({

            }, 404)
        serializer = UserProfileSerializer(influencer_profiles)

        response = generate_response("success", 200, serializer.data)

        return Response(
            response, 200
        )
    except Exception as e:
        raise e
        response = generate_response(
            "failure", 400, {}, "Brand profile not found."
        )



@api_view(['POST'])
def send_otp(request):
    try:
        email = request.data.get('email')
        user = User.objects.get(username=email)
        profile = UserProfile.objects.get(user=user)
        otp = profile.generate_otp()

        send_mail(
            subject='Here is your verification code for the Social Market',
            message = f"Hello,\n\n<br>Your one-time password (OTP) is {otp}. <br>Please enter this code to verify your account.\n\n<br><br>This code will expire shortly for security reasons. <br>If you did not request this verification, please ignore this email.\n\n<br><br>Best regards,\n<br>-The Social Market Team",
            html_message = f"Hello,\n\n<br>Your one-time password (OTP) is {otp}. <br>Please enter this code to verify your account.\n\n<br><br>This code will expire shortly for security reasons. <br>If you did not request this verification, please ignore this email.\n\n<br><br>Best regards,\n<br>-The Social Market Team",

            recipient_list=[email],
            from_email='noreply@thesocialmarket.ai'
        )
        response = generate_response("success", 200, "Successfully Sent Otp to user email")
        return Response(response, 200)

    except Exception as e:
        raise e
        response = generate_response("failure", 400, {}, str(e))
        return Response(response, 400)


@api_view(['POST'])
def verify_email(request):
    try:
        email = request.data.get('email')
        user = User.objects.get(username=email)
        profile = UserProfile.objects.get(user=user)
        otp = int(request.data.get('otp'))


        if profile.current_verification_code == otp:
            profile.is_verified = True
            profile.save()
            response = generate_response("success", 200, "Successfully Verified Your Email.")
            send_mail(
                subject="Email Verified",
                message=f"""
Dear {user.first_name},<br>
From The Social Market<br>
Your email has been successfully verified. visit https://thesocialmarket.ai to continue setting up your account.<br>
Best Regards,<br>
The Social Market Team
                """,
                html_message=f"""
Dear {user.first_name},
From The Social Market<br>
Your email has been successfully verified. Click <a href="https://thesocialmarket.ai">here</a> to continue setting up your account.<br>
Best Regards,<br>
The Social Market Team
                """,

                recipient_list=[email],
                from_email='noreply@thesocialmarket.ai'
            )
            return Response(response, 200)
        else:
            response = generate_response("failure", 400, {}, "Invalid Otp Code.")
            return Response(response, 400)

    except Exception as e:
        response = generate_response("failure", 400, {}, str(e))
        return Response(response, 400)


@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    otp = request.data.get('otp')

    if not all([email, new_password, otp]):
        return Response(generate_response("failure", 400, {}, "Email, OTP, and new password are required."), 400)

    try:
        otp = int(otp)
    except (ValueError, TypeError):
        return Response(generate_response("failure", 400, {}, "Invalid OTP format."), 400)

    try:
        user = User.objects.get(username=email)

        # FIX: OTP check MUST come before set_password — was checking after saving
        if otp != user.profile.current_verification_code:
            response = generate_response("failure", 400, {}, "Invalid or expired OTP code.")
            return Response(response, 400)

        # OTP valid — now reset the password and invalidate the OTP
        user.set_password(new_password)
        user.save()
        user.profile.current_verification_code = None
        user.profile.save()


        response = generate_response("success", 200, "Successfully reset your password.")
        send_mail(
            subject="Password Reset Successfully",
            message=f"""
Dear {user.first_name},<br>
Your password has been reset successfully. Log in https://thesocialmarket.ai to continue with your new password.<br>
Best Regards,<br>
The Social Market Team
            """,
            html_message=f"""
Dear {user.first_name},<br>
Your password has been reset successfully. Log in <a href="https://thesocialmarket.ai">here</a> with your new password.<br>
Best Regards,<br>
The Social Market Team
            """,

            recipient_list=[email],
            from_email='noreply@thesocialmarket.ai'
        )
        return Response(response, 200)

    except Exception as e:
        response = generate_response("failure", 400, {}, str(e))
        return Response(response, 400)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def filter_influencers(request):
    queryset = UserProfile.objects.all().annotate(net_follower=(
        F('influencer_profile__insta_follower') +
        F('influencer_profile__facebook_follower') +
        F('influencer_profile__tiktok_follower') +
        F('influencer_profile__linkedin_follower') +
        F('influencer_profile__youtube_follower') +
        F('influencer_profile__blog_follower') +
        F('influencer_profile__whatsapp_follower') +
        F('influencer_profile__podcast_follower') +
        F('influencer_profile__twitter_follower')
    )).filter(net_follower__gt=0)

    filter_by_self = request.data.get('filter_by_self', False)

    if not filter_by_self: # added by RONI_VAI
        search_query = request.data.get('search') or request.data.get('keyword')
        print(search_query)
        if search_query:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(user__username__icontains=search_query) |
                Q(influencer_profile__display_name__icontains=search_query) |
                Q(influencer_profile__short_bio__icontains=search_query) |
                Q(influencer_profile__content_niches__icontains=search_query)
            )
            print(f'total: {queryset.count()}')

    print(json.dumps(request.data, indent=2))
    niche = request.data.get('content niches') or request.data.get('niche')
        
    print(f"DEBUG NICHE: {niche}")

    # following line added by RONI_VAI
    niche = (
        request.user.profile.brand_profile.business_type
        if filter_by_self else niche
    )
    print(f"DEBUG NICHE FATER: {niche}")

    if niche and niche != "Content Niches":
        queryset = queryset.filter(influencer_profile__content_niches__icontains=niche)

    
    platform = (request.data.get('Platforms') or request.data.get('platform'))

    # following line added by RONI_VAI
    platform= (
        get_frequent_platforms(request.user.profile.brand_profile.id)
        if filter_by_self else platform
    )
    
    
    if platform and platform != "Platforms":
        platform = platform.lower()        
        if 'instagram' in platform:
            queryset = queryset.filter(influencer_profile__instagram_handle__gt='')
            
        elif 'tiktok' in platform:
            queryset = queryset.filter(influencer_profile__tiktok_handle__gt='')
            
        elif 'youtube' in platform:
            queryset = queryset.filter(influencer_profile__youtube_handle__gt='')
            
        elif 'twitter' in platform or 'x' in platform:
            queryset = queryset.filter(influencer_profile__twitter_handle__gt='')
            
        elif 'linkedin' in platform:
            queryset = queryset.filter(influencer_profile__linkedin_handle__gt='')
            
        elif 'whatsapp' in platform:
            queryset = queryset.filter(influencer_profile__whatsapp_handle__gt='')

        elif 'facebook' in platform:
            queryset = queryset.filter(influencer_profile__facebook_handle__gt='')

        elif 'blog' in platform:
            queryset = queryset.filter(influencer_profile__blog_handle__gt='')

        elif 'podcast' in platform:
            queryset = queryset.filter(influencer_profile__podcase_handle__gt='')


# facebook,blog,podcast filter not working
 


    
    budget = request.data.get('Budget Range') or request.data.get('budget')
    
    if budget and budget != "Budget Range":
        queryset = queryset.filter(influencer_profile__rate_range_for_social_post__icontains=budget)
    
    # following line added by RONI_VAI
    TIMEZONE_LIST = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Phoenix",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu"
    ]

    timezone = request.data.get('Time Zone')

    # following line added by RONI_VAI  
    timezone = (
        request.user.profile.brand_profile.timezone
        if filter_by_self else timezone
    )

    # # following line commented by RONI_VAI(ommiting timezone filter)
    # if timezone and timezone != "Time Zone":
    #     queryset = queryset.filter(influencer_profile__timezone__icontains=timezone)

    gender = request.data.get('Gender')
    if gender and gender != "Gender":
        queryset = queryset.filter(influencer_profile__gender__iexact=gender)

    # following line commented by RONI VIA

    budget_range = request.data.get('budget_range')
    if budget_range:
        (budget_min, budget_max) = reach.strip().split(sep='-', maxsplit=2)
        budget_min, budget_max = int(audience_count_min), int(audience_count_max)
        
        qs = queryset.annotate(
            repost_min=Cast(SplitPart('rate_range_for_repost', '-', 1), FloatField()),
            repost_max=Cast(SplitPart('rate_range_for_repost', '-', 2), FloatField()),

            instagram_story_min=Cast(
                SplitPart('rate_range_for_instagram_story', '-', 1),
                FloatField()
            ),
            instagram_story_max=Cast(
                SplitPart('rate_range_for_instagram_story', '-', 2),
                FloatField()
            ),
            instagram_reel_min=Cast(
                SplitPart('rate_range_for_instagram_reel', '-', 1),
                FloatField()
            ),
            instagram_reel_max=Cast(
                SplitPart('rate_range_for_instagram_reel', '-', 2),
                FloatField()
            ),
            tiktok_video_min=Cast(
                SplitPart('rate_range_for_tiktok_video', '-', 1),
                FloatField()
            ),
            tiktok_video_max=Cast(
                SplitPart('rate_range_for_tiktok_video', '-', 2),
                FloatField()
            ),
            podcast_mention_min=Cast(
                SplitPart('rate_range_for_podcast_mention', '-', 1),
                FloatField()
            ),
            podcast_mention_max=Cast(
                SplitPart('rate_range_for_podcast_mention', '-', 2),
                FloatField()
            ),
            live_stream_min=Cast(
                SplitPart('rate_range_for_live_stream', '-', 1),
                FloatField()
            ),
            live_stream_max=Cast(
                SplitPart('rate_range_for_live_stream', '-', 2),
                FloatField()
            ),
            ugc_creation_min=Cast(
                SplitPart('rate_range_for_ugc_creation', '-', 1),
                FloatField()
            ),
            ugc_creation_max=Cast(
                SplitPart('rate_range_for_ugc_creation', '-', 2),
                FloatField()
            ),
            whatsapp_status_min=Cast(
                SplitPart('rate_range_for_whatsapp_status_post', '-', 1),
                FloatField()
            ),
            whatsapp_status_max=Cast(
                SplitPart('rate_range_for_whatsapp_status_post', '-', 2),
                FloatField()
            ),
            affiliate_min=Cast(
                SplitPart('rate_range_for_affiliate_marketing_percent', '-', 1),
                FloatField()
            ),
            affiliate_max=Cast(
                SplitPart('rate_range_for_affiliate_marketing_percent', '-', 2),
                FloatField()
            ),
            facebook_post_min=Cast(
                SplitPart('rate_range_for_facebook_post', '-', 1),
                FloatField()
            ),
            facebook_post_max=Cast(
                SplitPart('rate_range_for_facebook_post', '-', 2),
                FloatField()
            ),
        ).annotate(
            budget_min=Least(
                Coalesce('repost_min', Value(1e18)),
                Coalesce('instagram_story_min', Value(1e18)),
                Coalesce('instagram_reel_min', Value(1e18)),
                Coalesce('tiktok_video_min', Value(1e18)),
                Coalesce('podcast_mention_min', Value(1e18)),
                Coalesce('live_stream_min', Value(1e18)),
                Coalesce('ugc_creation_min', Value(1e18)),
                Coalesce('whatsapp_status_min', Value(1e18)),
                Coalesce('affiliate_min', Value(1e18)),
                Coalesce('facebook_post_min', Value(1e18)),
            ),
            budget_max=Greatest(
                Coalesce('repost_max', Value(0)),
                Coalesce('instagram_story_max', Value(0)),
                Coalesce('instagram_reel_max', Value(0)),
                Coalesce('tiktok_video_max', Value(0)),
                Coalesce('podcast_mention_max', Value(0)),
                Coalesce('live_stream_max', Value(0)),
                Coalesce('ugc_creation_max', Value(0)),
                Coalesce('whatsapp_status_max', Value(0)),
                Coalesce('affiliate_max', Value(0)),
                Coalesce('facebook_post_max', Value(0)),
            )
        ).filter(budget_min__lte=budget_min, budget_max__gte=budget_max)




    reach = request.data.get('Audience Reach') or request.data.get('audience_reach')

    print(">> REACH:", reach, len(queryset))
    if reach and reach != "audience_reach":
        print("DEBUG")
        (audience_count_min, audience_count_max) = reach.strip().split(sep='-', maxsplit=2)
        audience_count_min, audience_count_max = int(audience_count_min), int(audience_count_max)
        
        queryset=queryset.annotate(net_follower=(
                    F('influencer_profile__insta_follower') +
                    F('influencer_profile__facebook_follower') +
                    F('influencer_profile__tiktok_follower') +
                    F('influencer_profile__linkedin_follower') +
                    F('influencer_profile__youtube_follower') +
                    F('influencer_profile__blog_follower') +
                    F('influencer_profile__whatsapp_follower') +
                    F('influencer_profile__podcast_follower') +
                    F('influencer_profile__twitter_follower')
            ))

        if audience_count_max:
            queryset=queryset.filter(net_follower__lt=audience_count_max)
        if audience_count_min:
            queryset=queryset.filter(net_follower__gte=audience_count_min)


        for u in queryset:
            print(u.net_follower)

        queryset = queryset.order_by('-is_verified', '-id')


    print(f"TOTAL RESULT IS: {queryset.count()}")

    serializer = UserProfileSerializer(queryset, many=True)

    response = generate_response(
        "success", 200, serializer.data
    )

    return Response(
        response, status=200
    )

# sd
@api_view(["GET"])
def get_featured_influencers(request):
    profiles = UserProfile.objects.filter(
        influencer_profile__is_featured=True,  # FIX: was commented out — showed everyone as featured
        influencer_profile__isnull=False
    ).select_related("user", "influencer_profile").order_by('-id')
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_featured_brands(request):
    profiles = UserProfile.objects.filter(
        brand_profile__is_featured=True,  # FIX: was commented out — showed everyone as featured
        signed_up_as__in=["brand", "both"],
        brand_profile__isnull=False,
        user_id__isnull=False,
    ).select_related("user", "brand_profile").order_by('-id')
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_feedback(request):
    subject = request.data['subject']
    email = request.data['email']
    feedback = request.data['feedback']
    Feedback.objects.create(subject=subject, email=email, text=feedback)

    return Response({
        "success": True
    })


from .models import LOG_TYPE_ALIASES, Log


@api_view(['POST'])
def create_log(request):
    type_alias = request.data['type_alias']
    if type_alias not in LOG_TYPE_ALIASES:
        raise ValidationError({"error": f"invalid type_alias: {type_alias}. must be one of {LOG_TYPE_ALIASES}"})
    
    if type_alias in ['PROPOSAL_SENT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED']:
        brand_id = request.data['brand_id']
        influencer_id = request.data['influencer_id']

        brand = UserProfile.objects.get(user_id=brand_id)
        brand_profile = brand.brand_profile

        influencer=UserProfile.objects.get(user_id=influencer_id)
        influencer_profile = influencer.influencer_profile

        Log.objects.create(
            type_alias=type_alias,
            text=(
                (
                    f"{type_alias.title()} - from: {dn if (dn:=brand_profile.display_name) else brand.user.first_name} "
                    f"to: {dn if (dn:=influencer_profile.display_name) else influencer.user.first_name}")
            )
        )
        

    elif type_alias == 'NEW_BRAND':
        brand_id = request.data['brand_id']

        brand_profile = UserProfile.objects.get(user_id=brand_id).brand_profile

        Log.objects.create(
            type_alias=type_alias,
            text=(
                f"{type_alias.title()} - user_name: {brand_profile.display_name}"
            )
        )
        
    elif type_alias == 'NEW_INFLUENCER':
        influencer_id = request.data['influencer_id']

        influencer = UserProfile.objects.get(user_id=influencer_id)
        influencer_profile = influencer.influencer_profile

        # FIX: was using brand_profile.display_name — NameError, brand_profile not defined here
        name = (influencer_profile.display_name if influencer_profile else None) or influencer.user.first_name

        Log.objects.create(
            type_alias=type_alias,
            text=(
                f"{type_alias.title()} - user_name: {name}"
            )
        )
    elif type_alias == 'FIRST_MESSAGE':
        sender_id = request.data['sender_id']
        receiver_id = request.data['receiver_id']
        msg = request.data['msg']

        sender_profile = UserProfile.objects.get(user_id=sender_id)
        # brand_profile = brand.brand_profile

        receiver_profile=UserProfile.objects.get(user_id=receiver_id)
        # influencer_profile = influencer.influencer_profile

        Log.objects.create(
            type_alias=type_alias,
            text=(
                f"{type_alias.title()} ----{msg}---- from: {sender_profile.user.username} to: {receiver_profile.user.username}"
            )
        )
    return Response({"success": True})
