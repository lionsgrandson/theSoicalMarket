from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, InfluencerInfo, BrandInfo


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class InfluencerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfluencerInfo
        fields = "__all__"


class BrandInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandInfo
        fields = "__all__"


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    influencer_profile = InfluencerInfoSerializer(read_only=True)
    brand_profile = BrandInfoSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'is_verified',
            'signup_method',
            'signed_up_as',
            # FIX: current_verification_code REMOVED — was exposing OTP codes in every API response
            'influencer_profile',
            'brand_profile',
            'is_brand_profile_complete',
            'is_influencer_profile_complete',
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    influencer_profile = InfluencerInfoSerializer()
    brand_profile = BrandInfoSerializer()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'is_verified',
            'signup_method',
            'signed_up_as',
            # FIX: current_verification_code REMOVED from public serializer
            'influencer_profile',
            'brand_profile',
            'is_brand_profile_complete',
            'is_influencer_profile_complete',
        ]

    def update(self, instance, validated_data):
        influencer_data = validated_data.pop('influencer_profile', None)
        brand_data = validated_data.pop('brand_profile', None)
        user_data = validated_data.pop('user', None)

        if instance.influencer_profile:
            influencer_instance = instance.influencer_profile
        else:
            influencer_instance = InfluencerInfo.objects.create()

        if instance.brand_profile:
            brand_instance = instance.brand_profile
        else:
            brand_instance = BrandInfo.objects.create()

        user_instance = instance.user

        if influencer_data:
            for attr, value in influencer_data.items():
                setattr(influencer_instance, attr, value)
            influencer_instance.save()

        if brand_data:
            for attr, value in brand_data.items():
                setattr(brand_instance, attr, value)
            brand_instance.save()

        if user_data:
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

        super().update(instance, validated_data)
        return instance
