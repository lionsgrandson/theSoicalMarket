from django.db import models
import requests
import base64
import requests
from django.db import models
from django.core.exceptions import ValidationError



class Campaign(models.Model):
    campaign_owner = models.IntegerField()
    campaign_poster = models.TextField(blank=True, null=True)
    campaign_name = models.CharField(max_length=100, blank=True, null=True)
    campaign_objective = models.CharField(max_length=500, blank=True, null=True)
    campaign_description = models.CharField(max_length=500, blank=True, null=True)

    budget_type = models.CharField(max_length=500, blank=True, null=True)
    budget_range = models.CharField(max_length=500, blank=True, null=True)
    payment_preference = models.CharField(max_length=500, blank=True, null=True)
    content_deliverables = models.TextField(blank=True, null=True)

    campaign_timeline = models.CharField(max_length=500, blank=True, null=True)
    content_approval_required = models.BooleanField(default=False)
    auto_match_micro_influencers = models.BooleanField(default=False)
    target_audience = models.CharField(max_length=500, blank=True, null=True)
    keywords_and_hashtags = models.CharField(max_length=500, blank=True, null=True)


    campaign_status = models.CharField(max_length=500, blank=True, null=True)

    timestamp = models.DateTimeField(auto_now_add=True)


    # def save(self, *args, **kwargs):
    #     if hasattr(self, '_campaign_poster_file') and self._campaign_poster_file:
    #         try:
    #             from decouple import config
                
    #             IMGBB_API_KEY = config('imgbb_api_key')
                
    #             encoded_image = base64.b64encode(self._campaign_poster_file.read())
                
    #             response = requests.post(
    #                 "https://api.imgbb.com/1/upload",
    #                 data={'key': IMGBB_API_KEY, 'image': encoded_image}
    #             )
    #             response.raise_for_status()
                
    #             result = response.json()
    #             if result.get('data') and result.get('data').get('url'):
    #                 self.campaign_poster = result['data']['url']

    #         except requests.exceptions.RequestException as e:
    #             print(f"Error uploading campaign poster to ImgBB: {e}")
        
    #     super().save(*args, **kwargs)




class Files(models.Model):
    file_input = models.FileField(upload_to='temp/', blank=True, null=True)
    
    link = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.file_input:
            # FIX: was hardcoded API key — now reads from environment
            from decouple import config
            api_key = config('IMGBB_API_KEY') 
            url = "https://api.imgbb.com/1/upload"

            try:
                payload = {
                    "key": api_key,
                }
                files = {
                    "image": self.file_input.file.read()
                }

                response = requests.post(url, data=payload, files=files)
                
                if response.status_code == 200:
                    json_data = response.json()
                    self.link = json_data['data']['url']
                    
                    self.file_input = None 
                else:
                    print(f"ImgBB Error: {response.text}")
                    raise ValidationError("Failed to upload image to ImgBB")

            except Exception as e:
                print(f"Upload failed: {e}")
                pass

        super().save(*args, **kwargs)

    def __str__(self):
        return self.link if self.link else "No Link"


class Hire(models.Model):
    owner_id = models.IntegerField(blank=True, null=True)
    campaign_id = models.IntegerField(blank=True, null=True, default=0)
    hired_influencer_id = models.IntegerField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    proposal_message = models.TextField(blank=True, null=True)
    campaign_deliverables = models.TextField(blank=True, null=True)
    attachments = models.ManyToManyField(Files, blank=True, null=True)

    is_accepted_by_influencer = models.BooleanField(default=False)
    is_rejected_by_influencer = models.BooleanField(default=False)
    is_completed_marked_by_brand = models.BooleanField(default=False)
    budget = models.FloatField(default=0.0)
    rating = models.FloatField(default=0.0)
    brand_rating = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, null=True)
    budgetNegotiable = models.BooleanField(default=False)
