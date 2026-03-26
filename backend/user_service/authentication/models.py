from django.db import models
from django.contrib.auth.models import User
import requests
import base64

from django.utils import timezone
import random
import string





class InfluencerInfo(models.Model):
    display_name = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    short_bio = models.CharField(max_length=200, blank=True, null=True)

    instagram_handle = models.CharField(max_length=100, blank=True, null=True)
    tiktok_handle = models.CharField(max_length=100, blank=True, null=True)
    youtube_handle = models.CharField(max_length=100, blank=True, null=True)
    twitter_handle = models.CharField(max_length=100, blank=True, null=True)
    linkedin_handle = models.CharField(max_length=100, blank=True, null=True)
    whatsapp_handle = models.CharField(max_length=100, blank=True, null=True)
    facebook_handle = models.CharField(max_length=100, blank=True, null=True)
    podcast_handle = models.CharField(max_length=100, blank=True, null=True)
    blog_handle = models.CharField(max_length=100, blank=True, null=True)

    content_niches = models.TextField(blank=True, null=True)
    audience_demographics = models.TextField(blank=True, null=True)
    keyword_and_tags = models.TextField(blank=True, null=True)
    content_formats = models.TextField(null=True, blank=True)
    payment_preferences = models.TextField(null=True, blank=True)

    rate_range_for_social_post = models.CharField(max_length=20, blank=True, null=True)
    rate_range_for_youtube_video = models.CharField(max_length=20, blank=True, null=True)
    rate_range_for_blog_post = models.CharField(max_length=20, blank=True, null=True)
    rate_range_for_youtube_short = models.CharField(max_length=20, blank=True, null=True)

    response_time = models.CharField(max_length=20, blank=True, null=True)

    # payment info
    payment_method = models.CharField(max_length=20, blank=True, null=True)
    account_holder_name = models.CharField(max_length=50, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    routing_number = models.CharField(max_length=50, blank=True, null=True)
    bank_name = models.CharField(max_length=50, blank=True, null=True)
    paypal_email = models.CharField(max_length=50, blank=True, null=True)

# 20 -500

# 5-10
# 7-1900
# 40-700
# 50-100

    rate_range_for_repost = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_instagram_story = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_instagram_reel = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_tiktok_video = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_podcast_mention = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_live_stream = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_ugc_creation = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_whatsapp_status_post = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_affiliate_marketing_percent = models.CharField(max_length=255, blank=True, null=True)
    rate_range_for_facebook_post = models.CharField(max_length=255, blank=True, null=True)

    notifications_email = models.BooleanField(default=False)
    notifications_push = models.BooleanField(default=False)

    stripe_connected = models.BooleanField(default=False)


    # extra fields
    timezone = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    audience_reach = models.CharField(max_length=50, blank=True, null=True)


    insta_follower = models.IntegerField(default=0)
    facebook_follower = models.IntegerField(default=0)
    tiktok_follower = models.IntegerField(default=0)
    linkedin_follower = models.IntegerField(default=0)
    youtube_follower = models.IntegerField(default=0)
    blog_follower = models.IntegerField(default=0)
    whatsapp_follower = models.IntegerField(default=0)
    podcast_follower = models.IntegerField(default=0)
    twitter_follower = models.IntegerField(default=0)

    is_featured = models.BooleanField(default=False)


    # def save(self, *args, **kwargs):
        
    #     if hasattr(self, '_profile_picture_file') and self._profile_picture_file:
    #         try:
    #             from decouple import config
                
    #             IMGBB_API_KEY = config('imgbb_api_key')
                
    #             encoded_image = base64.b64encode(self._profile_picture_file.read())
                
    #             response = requests.post(
    #                 "https://api.imgbb.com/1/upload",
    #                 data={'key': IMGBB_API_KEY, 'image': encoded_image}
    #             )
    #             response.raise_for_status()
                
    #             result = response.json()
    #             if result.get('data') and result.get('data').get('url'):
    #                 self.profile_picture = result['data']['url']

    #         except requests.exceptions.RequestException as e:
    #             print(f"Error uploading to ImgBB: {e}")
        
    #     super().save(*args, **kwargs)



class BrandInfo(models.Model):
    business_name = models.CharField(max_length=50, blank=True, null=True)
    website = models.CharField(max_length=250, blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)
    short_bio = models.CharField(max_length=250, blank=True, null=True)
    logo = models.TextField(blank=True, null=True)
    business_type = models.TextField(blank=True, null=True)
    targeted_audience = models.TextField(blank=True, null=True)
    keyword_hashtags = models.TextField(blank=True, null=True)
    audience_demographic = models.TextField(blank=True, null=True)
    brand_tone = models.TextField(blank=True, null=True)
    choosen_plan = models.CharField(max_length=50, blank=True, null=True)

    display_name = models.CharField(max_length=100, blank=True, null=True)
    mission = models.TextField(blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    instagram_handle = models.CharField(max_length=100, blank=True, null=True)
    tiktok_handle = models.CharField(max_length=100, blank=True, null=True)
    x_handle = models.CharField(max_length=100, blank=True, null=True)
    linkedin_profile = models.URLField(blank=True, null=True)
    whatsapp_business = models.CharField(max_length=200, blank=True, null=True)

    notifications_email = models.BooleanField(default=True)
    notifications_push = models.BooleanField(default=True)

    is_featured = models.BooleanField(default=False)


    # def save(self, *args, **kwargs):
    #     if hasattr(self, '_logo_file') and self._logo_file:
    #         try:
    #             from decouple import config
                
    #             IMGBB_API_KEY = config('imgbb_api_key')
                
    #             encoded_image = base64.b64encode(self._logo_file.read())
                
    #             response = requests.post(
    #                 "https://api.imgbb.com/1/upload",
    #                 data={'key': IMGBB_API_KEY, 'image': encoded_image}
    #             )
    #             response.raise_for_status()
                
    #             result = response.json()
    #             if result.get('data') and result.get('data').get('url'):
    #                 self.logo = result['data']['url']

    #         except requests.exceptions.RequestException as e:
    #             print(f"Error uploading to ImgBB: {e}")
        
    #     super().save(*args, **kwargs)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_verified = models.BooleanField(default=False)
    signup_method = models.CharField(max_length=20, blank=True, null=True)
    signed_up_as = models.CharField(max_length=20, default="influencer")
    current_verification_code = models.IntegerField(blank=True, null=True)
    
    is_brand_profile_complete = models.BooleanField(default=False)    
    is_influencer_profile_complete = models.BooleanField(default=False)
    
    # influencer info
    influencer_profile = models.ForeignKey(InfluencerInfo, blank=True, null=True, on_delete=models.CASCADE)
    
    # brand info
    brand_profile = models.ForeignKey(BrandInfo, blank=True, null=True, on_delete=models.CASCADE)

    def generate_otp(self):
        otp = ''.join(random.choices(string.digits, k=4))
        self.current_verification_code = otp
        self.save()
        return otp

    def __str__(self):
        return self.user.username


class Feedback(models.Model):
    email = models.CharField(max_length=50, null=True)
    subject = models.CharField(max_length=100, null=True)
    text = models.TextField()

    def __str__(self):
        return self.text[:20]

LOG_TYPE_ALIASES=(
    "PROPOSAL_SENT",
    "PROPOSAL_ACCEPTED",
    "PROPOSAL_REJECTED",
    "FIRST_MESSAGE",
    "NEW_INFLUENCER",
    "NEW_BRAND",
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_CANCELED",
    "CAMPAIGN_COMPLETED",
)

class Log(models.Model):
    type_alias = models.CharField(choices=tuple(zip(LOG_TYPE_ALIASES, LOG_TYPE_ALIASES)), max_length=20, null=True)

    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, null=True)


class SavedInfluencer(models.Model):
    brand_user_id = models.IntegerField()
    influencer_user_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['brand_user_id', 'influencer_user_id']]
        ordering = ['-created_at']

    def __str__(self):
        return f"Brand {self.brand_user_id} saved Influencer {self.influencer_user_id}"
