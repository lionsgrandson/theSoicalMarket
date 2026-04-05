import logging
import os

import httpx
from celery import shared_task

from celery_s.email_templates import EMAIL_TEMPLATES, render_email

logger = logging.getLogger(__name__)


def _shared_headers() -> dict:
    headers = {"Host": "localhost"}
    shared_secret = os.environ.get("SERVICES_SHARED_SECRET")
    if shared_secret:
        headers["services-shared-secret"] = shared_secret
    return headers


@shared_task(name="celery_s.tasks.send_email_task")
def send_email_task(recipient_email: str, template_key: str, context: dict | None = None):
    from django.conf import settings
    from django.core.mail import EmailMultiAlternatives

    context = context or {}
    if template_key not in EMAIL_TEMPLATES:
        logger.error("[email] unknown template key: %s", template_key)
        return

    try:
        subject, body_plain, body_html = render_email(template_key, context)
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body_plain,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "") or settings.EMAIL_HOST_USER,
            to=[recipient_email],
        )
        msg.attach_alternative(body_html, "text/html")
        msg.send(fail_silently=False)
        logger.info("[email] sent '%s' -> %s", template_key, recipient_email)
    except Exception as exc:
        logger.error("[email] failed '%s' -> %s: %s", template_key, recipient_email, exc)
        raise


@shared_task(name="celery_s.tasks.send_websocket_notification_task")
def send_websocket_notification_task(user_id: int, payload: dict):
    try:
        response = httpx.post(
            f"http://chat_service:8000/notification/{user_id}/",
            headers=_shared_headers(),
            json={"message_dict": payload},
            timeout=5,
        )
        if response.status_code >= 400:
            logger.warning(
                "[ws notify] chat_service returned %s for user %s",
                response.status_code,
                user_id,
            )
    except Exception as exc:
        logger.warning("[ws notify] failed for user %s: %s", user_id, exc)


@shared_task(name="celery_s.tasks.task_send_email_if_profile_not_complete")
def task_send_email_if_profile_not_complete(user_id: int):
    try:
        response = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{user_id}/",
            headers=_shared_headers(),
            timeout=8,
        )
        if response.status_code != 200:
            return

        user_data = response.json().get("data", {})
        if not user_data:
            return

        signed_up_as = user_data.get("signed_up_as", "influencer")
        is_complete = (
            user_data.get("is_brand_profile_complete")
            if signed_up_as in ["brand", "both"]
            else user_data.get("is_influencer_profile_complete")
        )
        if is_complete:
            return

        email = (user_data.get("user") or {}).get("email")
        if email:
            send_email_task.delay(
                email,
                "PROFILE_INCOMPLETE",
                {
                    "first_name": (user_data.get("user") or {}).get("first_name", "there"),
                    "signed_up_as": signed_up_as,
                },
            )
            logger.info("[profile nudge] queued for user %s", user_id)
    except Exception as exc:
        logger.error("[profile nudge] failed for user %s: %s", user_id, exc)


@shared_task(name="celery_s.tasks.debug_task")
def debug_task(email: str, message: str):
    logger.info("[debug_task] %s %s", email, message)
    return "Done"


# Import the automation module during Celery task discovery so the worker
# registers shared_task definitions from automations.py as well.
from celery_s import automations as _automations  # noqa: E402,F401
