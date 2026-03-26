from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Campaign, Files, Hire
from .serializers import CampaignSerializer, HireGetSerializer
from .utils import generate_response
from .permissions import IsJWTAuthenticated
from rest_framework.pagination import PageNumberPagination
import httpx
import os

from django.core.mail import send_mail


@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def create_campaign(request):
    user = int(request.token_payload.get('user_id'))

    data = request.data

    poster_file = request.FILES.get('campaign_poster')

    serializer = CampaignSerializer(data=data)

    if serializer.is_valid():
        serializer.save(campaign_owner=user)
        if poster_file:
            serializer._campaign_poster_file = poster_file
            serializer.save()
        response = generate_response("success", 201, serializer.data)
        return Response(response, 201)
    

    response = generate_response("failure", 400, {}, serializer.errors)
    return Response(response, 400)



@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_my_all_campaigns(request):
    user = int(request.token_payload.get('user_id'))

    serializer = CampaignSerializer(Campaign.objects.filter(campaign_owner=user), many=True).data

    response = generate_response("success", 200, serializer)

    return Response(
        response, 200
    )


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_a_campaign(request, campaign_id):

    try:
        serializer = CampaignSerializer(Campaign.objects.get(pk=campaign_id, campaign_owner=request.token_payload['user_id'])).data
    except:
        response = generate_response("failure", 400, {}, "Campaign Not Found")
        return Response(
            response, 400
        )

    response = generate_response("success", 200, serializer)

    return Response(
        response, 200
    )



@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def update_a_campaign(request, campaign_id):
    user = int(request.token_payload.get('user_id'))

    try:
        campaign_object = Campaign.objects.get(pk=campaign_id)
    except:
        response = generate_response("failure", 404, {}, "Campaign Not Found")
        return Response(response, 404)  # FIX: was missing return — caused UnboundLocalError

    if campaign_object.campaign_owner != user:
        response = generate_response("failure", 403, {}, "You are not allowed to update this campaign!")
        return Response(response, 403)



    serializer = CampaignSerializer(campaign_object, request.data, partial=True)

    # poster_file = request.FILES.get('campaign_poster')

    if serializer.is_valid():
        serializer.save()

        # if poster_file:
        #     campaign_object._campaign_poster_file = poster_file
        #     campaign_object.save()
        
        response = generate_response("success", 200, serializer.data)
        return Response(response, 200)
    

    response = generate_response("failure", 400, {}, serializer.errors)
    return Response(response, 400)



@api_view(['DELETE'])
@permission_classes([IsJWTAuthenticated])
def delete_a_campaign(request, campaign_id):
    user = int(request.token_payload.get('user_id'))

    try:
        campaign_object = Campaign.objects.get(pk=campaign_id)
    except:
        response = generate_response("failure", 400, {}, "Campaign Not Found")
        return Response(
            response, 400
        )

    
    if campaign_object.campaign_owner != user:
        response = generate_response("failure", 403, {}, "You are not allowed to delete this campaign!")
        return Response(response, 403)
    
    campaign_object.delete()




    response = generate_response("success", 200, {"Message": "Successfully Deleted Campaign."})
    return Response(
        response, 200
    )
    

@api_view(['GET'])
def get_all_camaign_of_all_users(request):
    c = Campaign.objects.filter(campaign_status="active")

    paginator = PageNumberPagination()
    paginator.page_size = 9

    paginated_campaigns = paginator.paginate_queryset(c, request)

    serializer = CampaignSerializer(paginated_campaigns, many=True)

    response = generate_response("success", 200, paginator.get_paginated_response(serializer.data).data)

    return Response(
        response, status=200
    )



@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def hire_influencer(request):
    user_id = int(request.token_payload.get('user_id'))
    influencer_id = request.data.get('influencer_id')

    budget = request.data.get('budget')

    start_date = request.data.get('start_date') 
    end_date = request.data.get('end_date') 
    proposal_message = request.data.get('proposal_message')
    campaign_deliverables = request.data.get('campaign_deliverables')
    campaign_id = request.data.get('campaign_id')

    hire_obj = Hire.objects.filter(
        owner_id=user_id,
        hired_influencer_id=int(influencer_id),
        campaign_id=int(campaign_id)
    ).first()

    if hire_obj:
        return Response({
            "error": "You've already sent a proposal to this influencer for this campaign"
        }, 409)

    
    hire_obj = Hire.objects.create(
        owner_id=user_id,
        hired_influencer_id=int(influencer_id),
        start_date=start_date,
        end_date=end_date,
        proposal_message=proposal_message,
        campaign_deliverables=campaign_deliverables,
        budget=budget,
        campaign_id=int(campaign_id)
    )

    uploaded_files = request.FILES.getlist('attachments') 
    if uploaded_files:
        for f in uploaded_files:
            new_file = Files(file_input=f)
            
            new_file.save() 
            hire_obj.attachments.add(new_file)
    
    serializer = HireGetSerializer(hire_obj)
    res = httpx.post(
        "http://user_service:8000/create_log/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
        json={
            "type_alias": "PROPOSAL_SENT",
            "brand_id": user_id,
            "influencer_id": hire_obj.hired_influencer_id
        }
    )
    print(res.json())
    res.raise_for_status()
    res = httpx.get(
        f"http://user_service:8000/get_user_info_by_id/{influencer_id}/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
    )
    res.raise_for_status()
    influencer_email = res.json()['data']['user']['email']
    influencer_name = res.json()['data']['influencer_profile']['display_name']
    res = httpx.get(
        f"http://user_service:8000/get_user_info_by_id/{user_id}/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
    )
    res.raise_for_status()
    brand_name = res.json()['data']['brand_profile']['business_name']
    brand_email=res.json()['data']['user']['email']
    send_mail(
        subject="New Hiring Proposal Received",
        message=f"""
Dear {influencer_name},
From The Social Market
You have received a hire proposal from {brand_name}. Click here to view and respond.
Best Regards,
The Social Market Team
        """,
        html_message=f"""
Dear {influencer_name},<br>
From The Social Market<br>
You have received a hire proposal from {brand_name}. Click <a href="https://thesocialmarket.ai">here</a> to view and respond.<br>
Best Regards,<br>
The Social Market Team
        """,

        from_email="noreply@thesocialmarket.com",
        recipient_list=[influencer_email]
    )
    send_mail(
        subject="New Hiring Proposal Sent",
        message=f"""
Dear {brand_name},
From The Social Market
Your hire proposal to {influencer_name} has been sent successfully. Track it here.
Best Regards,
The Social Market Team
        """,
        html_message=f"""
Dear {brand_name},<br>
From The Social Market<br>
Your hire proposal to {influencer_name} has been sent successfully. Track it here.<br>
Best Regards,<br>
The Social Market Team
        """,

        from_email="noreply@thesocialmarket.com",
        recipient_list=[brand_email]
    )
    response = generate_response("success", 201, serializer.data)
    return Response(response, status=201)


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_my_previous_hirings(request):
    user_id = int(request.token_payload.get('user_id'))

    h_set = Hire.objects.filter(owner_id=user_id, is_accepted_by_influencer=True)

    serializer = HireGetSerializer(h_set, many=True)

    response = generate_response("success", 200, serializer.data)

    return Response(
        response, status=200
    )


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_my_previous_where_i_was_hired(request):
    user_id = int(request.token_payload.get('user_id'))

    # FIX: was only filtering is_rejected=False — included pending proposals as "hirings"
    # Now requires is_accepted=True so only genuinely accepted hires appear
    h_set = Hire.objects.filter(
        hired_influencer_id=user_id,
        is_accepted_by_influencer=True,
        is_rejected_by_influencer=False,
    )

    serializer = HireGetSerializer(h_set, many=True)

    response = generate_response("success", 200, serializer.data)

    return Response(
        response, status=200
    )


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def accept_offer(request, offer_id):
    user_id = int(request.token_payload.get('user_id'))

    try:
        h = Hire.objects.get(pk=offer_id)
        if h.hired_influencer_id == user_id:
            h.is_accepted_by_influencer = True
            h.save()
            response = generate_response(
                "success", 200, {"message": "Successfully Acccepted the offer."}
            )
            res = httpx.post(
                "http://user_service:8000/create_log/",
                headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
                json={
                    "type_alias": "PROPOSAL_ACCEPTED",
                    "brand_id": h.owner_id,
                    "influencer_id": user_id
                }
            )
            print(res.json())
            res.raise_for_status()
            return Response(
                response, status=200
            )

        response = generate_response(
            "failure", 400, {}, "You are not allowed to do accept the offer."
        )
        return Response(
            response, status=400
        )
    except Hire.DoesNotExist:
        # FIX: was "raise e" before this — made error response unreachable, always 500
        response = generate_response("failure", 404, {}, "Offer not found.")
        return Response(response, status=404)
    except Exception as e:
        response = generate_response("failure", 500, {}, str(e))
        return Response(response, status=500)


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def reject_offer(request, offer_id):
    user_id = int(request.token_payload.get('user_id'))

    try:
        h = Hire.objects.get(pk=offer_id)
        if h.hired_influencer_id == user_id:
            h.is_rejected_by_influencer = True
            h.save()
            response = generate_response(
                "success", 200, {"message": "Successfully Rejected the offer."}
            )
            res = httpx.post(
                "http://user_service:8000/create_log/",
                headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
                json={
                    "type_alias": "PROPOSAL_REJECTED",
                    "brand_id": h.owner_id,
                    "influencer_id": user_id
                }
            )
            print(res.json())
            res.raise_for_status()
            return Response(
                response, status=200
            )

        response = generate_response(
            "failure", 400, {}, "You are not allowed to do accept the offer."
        )
        return Response(
            response, status=400
        )
    except Hire.DoesNotExist:
        # FIX: was bare "raise" before this — made error response unreachable
        response = generate_response("failure", 404, {}, "Offer not found.")
        return Response(response, status=404)
    except Exception as e:
        response = generate_response("failure", 500, {}, str(e))
        return Response(response, status=500)


@api_view(['PATCH'])
@permission_classes([IsJWTAuthenticated])
def complete_offer(request, offer_id):
    user_id = int(request.token_payload.get('user_id'))

    try:
        h = Hire.objects.get(pk=offer_id)
        if h.owner_id == user_id:
            h.is_completed_marked_by_brand = True
            h.save()
            response = generate_response(
                "success", 200, {"message": "Successfully Completed the offer."}
            )
            return Response(
                response, status=200
            )

        response = generate_response(
            "failure", 400, {}, "You are not allowed to do complete the offer."
        )
        return Response(
            response, status=400
        )
    except:
        response = generate_response(
            "failure", 400, {}, "Offer Not Found."
        )
        return Response(
            response, status=400
        )


@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def give_rating(request, offer_id):
    user_id = int(request.token_payload.get('user_id'))

    try:
        h = Hire.objects.get(pk=offer_id)
        if h.owner_id == user_id and h.is_completed_marked_by_brand:
            rating = float(request.data.get('rating'))
            h.rating = rating
            h.save()
            response = generate_response(
                "success", 200, {"message": "Successfully Rated The Brand."}
            )
            return Response(
                response, status=200
            )

        response = generate_response(
            "failure", 400, {}, "You are not allowed to do rate the offer, or offer might not been completed yet."
        )
        return Response(
            response, status=400
        )
    except:
        response = generate_response(
            "failure", 400, {}, "Offer Not Found."
        )
        return Response(
            response, status=400
        )


@api_view(['GET'])
def frequent_platform(request, brand_id):
    campaigns = Campaign.objects.filter(campaign_owner=brand_id)

    return Response({
        "platforms": ",".join({
            platform for campaign in campaigns for platforms in campaign.content_deliverables for platform in platforms.split(sep=',')
        })
    })


from django.db.models import Sum
@api_view(['GET'])
def get_hires_and_campaigns(request, user_id, brand_id):
    hires = Hire.objects.filter(owner_id=user_id, is_completed_marked_by_brand=True)
    total_invested = hires.aggregate(total_invested=Sum('budget'))['total_invested']
 
    # hires_data = HireGetSerializer(hires, many=True).data

    campaings = Campaign.objects.filter(campaign_owner=user_id)

    campaigns_data = CampaignSerializer(campaings, many=True).data

    total_hired_influencers = Hire.objects.filter(owner_id=user_id).aggregate(
        total_count=Count('hired_influencer_id', distinct=True)
    )['total_count']

    return Response({
        "campaigns": len(campaigns_data),
        "campaigns_data": CampaignSerializer(campaings.filter(campaign_status='active'), many=True).data,
        # "hires_data": len(hires_data),
        "hires_data": total_hired_influencers if total_hired_influencers else 0,
        "total_invested": total_invested
    })


from django.db.models import Sum, Count
@api_view(['GET'])
def get_hires_and_campaigns_for_influencer(request, user_id):
    hires = Hire.objects.filter(hired_influencer_id=user_id, is_accepted_by_influencer=True)

    total_hired = hires.aggregate(total_count=Count('id'))['total_count']
    campaign_ids = hires.values_list('campaign_id', flat=True)

    campaigns = Campaign.objects.filter(id__in=campaign_ids)

    hires_completed = Hire.objects.filter(hired_influencer_id=user_id, is_completed_marked_by_brand=True)
    total_earned = hires_completed.aggregate(total_earned=Sum('budget'))['total_earned']
    total_rating = hires_completed.aggregate(total_rating=Sum('rating'))['total_rating']



    # hires_data = HireGetSerializer(hires, many=True).data

    # campaings = Campaign.objects.filter(campaign_owner=user_id)

    # campaigns_data = CampaignSerializer(campaings, many=True).data

    return Response({
        "hires": total_hired,
        "total_earned": total_earned if total_earned else 0,
        "total_rating": total_rating/hires_completed.count() if total_earned else 0,
        "campaigns_data": CampaignSerializer(campaigns, many=True).data
    })


@api_view(['POST'])
def search_campaign(request):
    campaign_name = request.data['campaign_name']

    campaigns = Campaign.objects.filter(campaign_name__icontains=campaign_name)
    return Response({
        "data": CampaignSerializer(campaigns, many=True).data
    })


    pass


from rest_framework.generics import ListAPIView

class ListHireView(ListAPIView):
    serializer_class = HireGetSerializer
    permission_classes = [IsJWTAuthenticated]

    def get_queryset(self):
        return Hire.objects.filter(owner_id=self.request.token_payload['user_id'])









# delete utility
from django.shortcuts import render, redirect, get_object_or_404
from .models import Campaign

# def campaign_list(request):
#     campaigns = Campaign.objects.all().order_by('-timestamp')
#     for camp in campaigns:
#         camp['brand_name'] = 
#     return render(request, 'campaign_list.html', {'campaigns': campaigns})
import requests
def campaign_list(request):
    campaigns = Campaign.objects.filter(campaign_status="active").order_by('-timestamp')
    base_url = "https://backend.thesocialmarket.ai/api/" 
    for camp in campaigns:
        brand_name = "" 
        try:
            api_url = f"{base_url}user_service/get_user_info_by_id/{camp.campaign_owner}/"
            response = requests.get(api_url, timeout=5)
            print(response)
            
            if response.status_code == 200:
                json_data = response.json()
                data = json_data.get('data')
                if data:
                    brand_profile = data.get('brand_profile')
                    if brand_profile:
                        brand_name = brand_profile.get('business_name') or ""           
        except Exception:
            brand_name = ""

        camp.brand_name = brand_name
    return render(request, 'campaign_list.html', {'campaigns': campaigns})

def delete_campaign(request, campaign_id):
    campaign = get_object_or_404(Campaign, id=campaign_id)
    campaign.delete()
    return redirect('https://backend.thesocialmarket.ai/api/campaign_service/campaigns')
    