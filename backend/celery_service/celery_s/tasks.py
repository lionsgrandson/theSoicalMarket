from celery import shared_task
import datetime
from django.core.mail import send_mail
import httpx
import os



@shared_task
def debug_task(email, message):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    # --- THIS IS THE NEW PRINT LOGIC ---
    print(f"========================================")
    print(f"[{timestamp}] WORKER LOG: {message}")
    print(f"========================================")
    return "Done"


@shared_task
def send_email_task(email, message):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")


@shared_task
def task_send_email_if_profile_not_complete(pk, message):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    res = httpx.get(
        f"http://user_service:8000/get_user_info_by_id/{pk}/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
    )
    print("stage 1")
    if res.status_code == 200:
        data = res.json()
        user_info = data["data"]
        print("stage 2")
        if user_info:
            print("stage 3")
            signed_up_as = user_info["signed_up_as"]
            is_profile_complete = user_info['is_brand_profile_complete'] if signed_up_as in ["brand", "both"] else user_info['is_influencer_profile_complete']
            if not is_profile_complete:
                email = user_info['user']['email']
                print("Profile not complete. Sending email to:", email)
                send_mail(
                    subject="Welcome! Your Account is Ready",
                    message=message,
                    html_message=message,
                    from_email="noreply@bkcoaching.com",
                    recipient_list=[email],
                    fail_silently=False,
                )
