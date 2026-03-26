"""
PATCH FILE: user_service/authentication/views.py
================================================
This file contains ONLY the exact text blocks to find and replace.
Do NOT copy this entire file into views.py.

For each section below:
  1. Open views.py in your editor
  2. Find the EXACT text under "FIND THIS:"
  3. Replace it with the text under "REPLACE WITH:"
  4. Save the file

There are 4 patches total.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH 1: reset_password — OTP check was AFTER password change (critical bug)
# ─────────────────────────────────────────────────────────────────────────────

FIND_1 = """def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    otp = int(request.data.get('otp'))


    try:
        user = User.objects.get(username=email)
        user.set_password(new_password)
        user.save()

        if otp!=user.profile.current_verification_code:
            response = generate_response("failure", 400, {}, "Invalid Otp Code.")
            return Response(response, 400)"""

REPLACE_1 = """def reset_password(request):
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
        user.profile.save()"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 2: get_featured_influencers — uncomment is_featured filter
# ─────────────────────────────────────────────────────────────────────────────

FIND_2 = """@api_view(["GET"])
def get_featured_influencers(request):
    profiles = UserProfile.objects.filter(
        # influencer_profile__is_featured=True,
        influencer_profile__isnull=False
    ).select_related("user", "influencer_profile").order_by('-id')

    profiles = profiles.filter(Q(is_brand_profile_complete=True) | Q(is_influencer_profile_complete=True))
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)"""

REPLACE_2 = """@api_view(["GET"])
def get_featured_influencers(request):
    profiles = UserProfile.objects.filter(
        influencer_profile__is_featured=True,  # FIX: was commented out — showed everyone as featured
        influencer_profile__isnull=False
    ).select_related("user", "influencer_profile").order_by('-id')
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 3: get_featured_brands — uncomment is_featured filter
# ─────────────────────────────────────────────────────────────────────────────

FIND_3 = """@api_view(["GET"])
def get_featured_brands(request):
    profiles = UserProfile.objects.filter(
        # brand_profile__is_featured=True,
        signed_up_as__in=["brand", "both"],
        brand_profile__isnull=False,
        user_id__isnull=False,
    ).select_related("user", "brand_profile").order_by('-id')

    profiles = profiles.filter(Q(is_brand_profile_complete=True) | Q(is_influencer_profile_complete=True))
    print("GETTING FEATURED BRANDS:", profiles.count())

    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)"""

REPLACE_3 = """@api_view(["GET"])
def get_featured_brands(request):
    profiles = UserProfile.objects.filter(
        brand_profile__is_featured=True,  # FIX: was commented out — showed everyone as featured
        signed_up_as__in=["brand", "both"],
        brand_profile__isnull=False,
        user_id__isnull=False,
    ).select_related("user", "brand_profile").order_by('-id')
    serializer = UserProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 4: create_log NEW_INFLUENCER — was using brand_profile (NameError)
# ─────────────────────────────────────────────────────────────────────────────

FIND_4 = """    elif type_alias == 'NEW_INFLUENCER':
        influencer_id = request.data['influencer_id']

        influencer_profile = UserProfile.objects.get(user_id=influencer_id).influencer_profile

        Log.objects.create(
            type_alias=type_alias,
            text=(
                f"{type_alias.title()} - user_name: {brand_profile.display_name}"
            )
        )"""

REPLACE_4 = """    elif type_alias == 'NEW_INFLUENCER':
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
        )"""
