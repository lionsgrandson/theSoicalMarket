from django.core.mail import EmailMessage, send_mail

from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
import httpx
import os

from .models import Hire, Campaign

from .utils import send_notification_to_user
@receiver(post_save, sender=Hire)
def handle_hire_save(sender, instance, created, **kwargs):
    if created:
        send_notification_to_user(instance.hired_influencer_id, {
            "hire_id": instance.id,
            "message": "You have received a hiring proposal"
        })
        brand_info = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{instance.owner_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        )
        if brand_info.status_code != 200:
            raise Exception(brand_info.text)
        brand_name = brand_info.json()['data']['brand_profile']['business_name']
        influencer_info = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{instance.hired_influencer_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        )
        if influencer_info.status_code != 200:
            raise Exception(influencer_info.text)
        influencer_name = influencer_info.json()['data']['brand_profile']['display_name']

        temp_url = f"http://chat_service:8001/notification/{instance.owner_id}/"
        res = httpx.post(
            f"http://chat_service:8000/notification/{instance.hired_influencer_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
            json={
                "message_dict": {
                    "type_alias": "HIRING_PROPOSAL",
                    "hire_id": instance.id,
                    "brand_id": instance.owner_id,
                    "campaign_id": instance.campaign_id,
                    "message": f"""
Hello {influencer_name},
You have received a hire proposal from {brand_name}. Click <a href="https://thesocialmarket.ai">here</a> to view and respond.
Best Regards,
The Social Market Team
                    """
                }
            }
        )
    
    if created:
        res = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{instance.hired_influencer_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        )
        if res.status_code != 200:
            raise Exception(res.text)
        influencer_email = res.json()['data']['user']['email']
        influencer_name = res.json()['data']['influencer_profile']['display_name']
        send_mail(
            subject="New Hiring Proposal",
            message=f"""
Hello {influencer_name},
You have received a hire proposal from {brand_name}. visit https://thesocialmarket.ai to view and respond.
Best Regards,
The Social Market Team
             """,
             from_email=os.environ['EMAIL_HOST_USER'],
            html_message=f"""
Hello {influencer_name},
You have received a hire proposal from {brand_name}. Click <a href="https://thesocialmarket.ai">here</a> to view and respond.
Best Regards,
The Social Market Team
             """,

            recipient_list=[influencer_email]
        )
    instance: Hire = instance
    if (instance.is_accepted_by_influencer or (instance.is_rejected_by_influencer)) and not instance.is_completed_marked_by_brand:
        res = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{instance.owner_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        )
        if res.status_code !=200:
            raise Exception(res.text)
        email = res.json()['data']['user']['email']
        brand_name = res.json()['data']['brand_profile']['business_name']
        influencer_name = res.json()['data']['influencer_profile']['display_name']

        # sub = "accepted" if instance.is_accepted_by_influencer else "rejected"
        # subject = f'offer {sub}'
        # message = f'Your hiring offer was {sub} by the influencer'
        # from_email = 'pialzoad@gmail.com'
        # recipient_list = [email]
        sub = "accepted" if instance.is_accepted_by_influencer else "rejected"
        subject = f'Your hiring offer has been {sub}'
        message = f"""
Dear {brand_name},
From The Social Market
Your hire proposal  {f"for {influencer_name}" if influencer_name else ''} was {sub}. 
You can view the details here.
Best Regards,
The Social Market Team
    """
        # from_email = 'basyakovacs@thesocialmarket.ai'
        recipient_list = [email]

        temp_url = f"http://chat_service:8001/notification/{instance.owner_id}/"
        res = httpx.post(
            f"http://chat_service:8000/notification/{instance.owner_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
            json={
                "message_dict": {
                    "type_alias": f"PROPOSAL_{'ACCEPTED' if sub == 'accepted' else 'REJECTED'}",
                    "hire_id": instance.id,
                    "hired_influencer_id": instance.hired_influencer_id,
                    "campaign_id": instance.campaign_id,
                    "message": f"Your hiring offer was {sub} by the influencer"
                }
            }
        )

        email = EmailMessage(subject, message, None, recipient_list)
        email.send(fail_silently=False)
        # httpx.post(
        #     f"http://celery_service:8005/{email}/send_mail/",
        #     json={
        #         "message": "Your offer is accepted by the influencer"
        #     }
        # ).raise_for_status(True)
    elif instance.is_completed_marked_by_brand:
        res = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{instance.hired_influencer_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        )
        if res.status_code != 200:
            raise Exception(res.text)

        email = res.json()['data']['user']['email']
        
        subject = 'Your Campaign is Complete'
        message = f"""
        Hi there,\nWe wanted to let you know that your campaign is complete.\nIf you have any questions or want to start a new campaign, feel free to reach out.\nBest regards,\nThe Social Market AI Team\nWebsite: https://thesocialmarket.ai/
        """
        from_email = 'pialzoad@gmail.com'
        recipient_list = [email]

        email = EmailMessage(subject, message, None, recipient_list)
        email.send(fail_silently=False)

        res = httpx.post(
            f"http://chat_service:8000/notification/{instance.hired_influencer_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
            json={
                "message_dict": {
                    "type_alias": f"CAMPAIGN_COMPLETED",
                    "hire_id": instance.id,
                    "owner_id": instance.owner_id,
                    "campaign_id": instance.campaign_id,
                    "message": f"You campaign is marked complete."
                }
            }
        )
    else:
        res = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{instance.hired_influencer_id}/",
            headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
        )
        if res.status_code != 200:
            raise Exception(res.text)




@receiver(post_delete, sender=Campaign)
def delete_related_hire_proposal(sender, instance, **kwargs):
    Hire.objects.filter(campaign_id=instance.id).delete()