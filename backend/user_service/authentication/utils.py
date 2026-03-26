from datetime import datetime
from django.core.mail import EmailMessage
import httpx

import os


def generate_response(status="undefined", code=0, data={}, error={}):
    sample_response = {
        "status": status,
        "code": code,
        "data": data,
        "error": error,
        "meta": {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    }

    return sample_response



def send_otp_via_email(otp, email):
    subject = 'Here is your verification code for the Social Market'
    message = f"Hello,\n\n<br><br>Thank you for signing up for The Social Market.\n\n<br><br>Your one-time password (OTP) is {otp}. <br>Please enter this code to verify your account.\n\n<br><br>This code will expire shortly for security reasons. If you did not request this verification, please ignore this email.\n\n<br><br>Best regards,\n<br>-The Social Market Team"
    from_email = 'pialzoad@gmail.com'
    recipient_list = [email]

    email = EmailMessage(subject, message, from_email, recipient_list, html_message=message,)
    email.send()


def get_frequent_platforms(brand_id):
    # res = httpx.get(f"https://exhaust-minute-picked-reservations.trycloudflare.com/api/campaign_service/{brand_id}/get_frequent_platform/")
    res = httpx.get(
        f"http://campaign_service:8000/{brand_id}/get_frequent_platform/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
    )
    print("DEBUG >>>>>")
    print(res.status_code)
    print("DEBUG >>>>>")
    if res.status_code != 200:
        return None
    return res.json()['platforms']


def get_hires_and_campaigns(user_id,brand_id):
    res = httpx.get(
        f"http://campaign_service:8000/{user_id}/{brand_id}/hires_and_campaigns/",
        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']}
    )
    print("DEBUG >>>>>")
    print(res.status_code)
    print("DEBUG >>>>>")
    if res.status_code != 200:
        return None
    return res.json()