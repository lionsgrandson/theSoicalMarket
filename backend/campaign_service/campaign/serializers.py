from rest_framework import serializers
from .models import Campaign, Hire, Files



class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['campaign_owner']


class FilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Files
        fields = ['id', 'link']

class HireGetSerializer(serializers.ModelSerializer):
    attachments = FilesSerializer(many=True, read_only=True)
    campaign = serializers.SerializerMethodField()

    class Meta:
        model = Hire
        fields = [
            'id',
            'owner_id',
            'campaign_id',
            'hired_influencer_id',
            'start_date', 
            'end_date',
            'proposal_message',
            'campaign_deliverables',
            'attachments',
            'is_accepted_by_influencer',
            'is_rejected_by_influencer',
            'is_completed_marked_by_brand',
            'budget',
            'rating',
            'campaign',
            'timestamp'
        ]
    
    def get_campaign(self, instance):
        campaign = Campaign.objects.filter(id=instance.campaign_id).first()
        if not campaign:
            return None

        return CampaignSerializer(campaign).data