from celery import shared_task
import logging
import httpx
import os

logger = logging.getLogger(__name__)


@shared_task(name="celery_s.tasks.send_email_task")
def send_email_task(recipient_email: str, template_key: str, context: dict):
    """
    Send a templated HTML email.

    FIX: was an empty stub — task was registered but never actually sent anything.
    Now renders the template from email_templates.py and sends via Django's mail backend.
    """
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings

    try:
        from celery_s.email_templates import TEMPLATES
        template = TEMPLATES.get(template_key)
        if not template:
            logger.error(f"[email] unknown template key: {template_key}")
            return

        subject = template["subject"](context)
        body_html = template["body_html"](context)
        body_plain = template.get("body_plain", lambda c: body_html)(context)
        from_email = settings.DEFAULT_FROM_EMAIL

        msg = EmailMultiAlternatives(
            subject=subject,
            body=body_plain,
            from_email=from_email,
            to=[recipient_email],
        )
        msg.attach_alternative(body_html, "text/html")
        msg.send(fail_silently=False)

        logger.info(f"[email] sent '{template_key}' → {recipient_email}")

    except Exception as e:
        logger.error(f"[email] failed to send '{template_key}' → {recipient_email}: {e}")
        raise


@shared_task(name="celery_s.tasks.send_websocket_notification_task")
def send_websocket_notification_task(user_id: int, payload: dict):
    """Push a notification to a user's WebSocket channel via chat_service."""
    try:
        res = httpx.post(
            f"http://chat_service:8000/notification/{user_id}/",
            headers={
                "Host": "localhost",
                "services-shared-secret": os.environ.get("SERVICES_SHARED_SECRET", ""),
            },
            json={"message_dict": payload},
            timeout=5,
        )
        if res.status_code >= 400:
            logger.warning(f"[ws notify] chat_service returned {res.status_code} for user {user_id}")
    except Exception as e:
        logger.warning(f"[ws notify] failed for user {user_id}: {e}")


@shared_task(name="celery_s.tasks.task_send_email_if_profile_not_complete")
def task_send_email_if_profile_not_complete(user_id: int):
    """
    Check if a user has completed their profile; if not, send a nudge email.

    FIX: original version read is_brand_profile_complete / is_influencer_profile_complete
    from the API response — those fields exist on UserProfile, so the API call is correct.
    But the original code used 'pk' (a Celery task arg name clash) instead of 'user_id'.
    Now uses explicit user_id parameter.
    """
    try:
        res = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{user_id}/",
            headers={
                "Host": "localhost",
                "services-shared-secret": os.environ.get("SERVICES_SHARED_SECRET", ""),
            },
            timeout=8,
        )
        if res.status_code != 200:
            return

        data = res.json().get("data", {})
        if not data:
            return

        signed_up_as = data.get("signed_up_as", "influencer")
        is_complete = (
            data.get("is_brand_profile_complete")
            if signed_up_as in ["brand", "both"]
            else data.get("is_influencer_profile_complete")
        )

        if not is_complete:
            email = data.get("user", {}).get("email")
            if email:
                send_email_task.delay(email, "PROFILE_INCOMPLETE", {
                    "first_name": data.get("user", {}).get("first_name", "there"),
                    "signed_up_as": signed_up_as,
                })
                logger.info(f"[profile nudge] queued for user {user_id}")

    except Exception as e:
        logger.error(f"[profile nudge] failed for user {user_id}: {e}")


@shared_task
def debug_task(email: str, message: str):
    """Debug task — logs to worker console. Safe to keep."""
    import datetime
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"========================================")
    print(f"[{timestamp}] WORKER LOG: {message}")
    print(f"========================================")
    return "Done"
