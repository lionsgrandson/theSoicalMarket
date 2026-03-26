import logging
import os
from datetime import datetime, timedelta, timezone as dt_timezone

import httpx
from celery import shared_task

logger = logging.getLogger(__name__)

SITE_BASE_URL = os.environ.get("SITE_BASE_URL", "https://thesocialmarket.ai").rstrip("/")


def _shared_headers() -> dict:
    headers = {"Host": "localhost"}
    shared_secret = os.environ.get("SERVICES_SHARED_SECRET")
    if shared_secret:
        headers["services-shared-secret"] = shared_secret
    return headers


def _fetch_user(user_id: int) -> dict:
    try:
        response = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{user_id}/",
            headers=_shared_headers(),
            timeout=8,
        )
        if response.status_code == 200:
            return response.json().get("data", {})
    except Exception as exc:
        logger.warning("[automations] _fetch_user(%s): %s", user_id, exc)
    return {}


def _get_email(user_data: dict) -> str | None:
    return (user_data.get("user") or {}).get("email")


def _get_first_name(user_data: dict) -> str:
    return (user_data.get("user") or {}).get("first_name") or "there"


def _get_display_name(user_data: dict) -> str:
    influencer_profile = user_data.get("influencer_profile") or {}
    brand_profile = user_data.get("brand_profile") or {}
    user = user_data.get("user") or {}
    return (
        influencer_profile.get("display_name")
        or brand_profile.get("business_name")
        or brand_profile.get("display_name")
        or f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
        or "Unknown"
    )


def _send_email(email: str | None, template_key: str, context: dict):
    if not email:
        return
    from celery_s.tasks import send_email_task

    send_email_task.delay(email, template_key, context)


def _push_ws(user_id: int | None, payload: dict):
    if not user_id:
        return
    from celery_s.tasks import send_websocket_notification_task

    send_websocket_notification_task.delay(int(user_id), payload)


def _log(data: dict):
    try:
        httpx.post(
            "http://user_service:8000/create_log/",
            headers=_shared_headers(),
            json=data,
            timeout=5,
        )
    except Exception as exc:
        logger.warning("[automations] _log failed: %s", exc)


def handle_email_verified(payload: dict):
    user_data = _fetch_user(payload["user_id"])
    signed_up_as = user_data.get("signed_up_as", "influencer")
    dashboard_path = (
        "/influencer-dashboard"
        if signed_up_as in ("influencer", "both")
        else "/brand-dashboard"
    )
    _send_email(
        _get_email(user_data),
        "EMAIL_VERIFIED",
        {
            "first_name": _get_first_name(user_data),
            "dashboard_url": f"{SITE_BASE_URL}{dashboard_path}",
            "signed_up_as": signed_up_as,
        },
    )


def handle_profile_incomplete(payload: dict):
    user_data = _fetch_user(payload["user_id"])
    _send_email(
        _get_email(user_data),
        "PROFILE_INCOMPLETE",
        {
            "first_name": _get_first_name(user_data),
            "signed_up_as": user_data.get("signed_up_as", "influencer"),
        },
    )


def handle_password_reset(payload: dict):
    user_data = _fetch_user(payload["user_id"])
    _send_email(
        _get_email(user_data),
        "PASSWORD_RESET_SUCCESS",
        {"first_name": _get_first_name(user_data)},
    )


def handle_subscription_activated(payload: dict):
    user_data = _fetch_user(payload["user_id"])
    _send_email(
        _get_email(user_data),
        "SUBSCRIPTION_ACTIVATED",
        {
            "first_name": _get_first_name(user_data),
            "plan_name": payload.get("plan_name", "your plan"),
            "signed_up_as": user_data.get("signed_up_as", "influencer"),
        },
    )
    _log(
        {
            "type_alias": "SUBSCRIPTION_CREATED",
            "text": f"Subscription activated for user {payload['user_id']}: {payload.get('plan_name', '')}",
        }
    )


def handle_proposal_sent_brand_confirmation(payload: dict):
    brand = _fetch_user(payload["brand_id"])
    influencer = _fetch_user(payload["influencer_id"])
    _send_email(
        _get_email(brand),
        "PROPOSAL_SENT_BRAND",
        {
            "first_name": _get_first_name(brand),
            "influencer_name": _get_display_name(influencer),
        },
    )


def handle_proposal_received_influencer(payload: dict):
    influencer = _fetch_user(payload["influencer_id"])
    brand = _fetch_user(payload["brand_id"])
    _send_email(
        _get_email(influencer),
        "PROPOSAL_RECEIVED_INFLUENCER",
        {
            "first_name": _get_first_name(influencer),
            "brand_name": _get_display_name(brand),
        },
    )
    _push_ws(
        payload.get("influencer_id"),
        {
            "type_alias": "HIRING_PROPOSAL",
            "hire_id": payload.get("hire_id"),
            "brand_id": payload.get("brand_id"),
            "campaign_id": payload.get("campaign_id"),
            "message": f"New proposal from {_get_display_name(brand)}",
        },
    )
    _log(
        {
            "type_alias": "PROPOSAL_SENT",
            "brand_id": payload["brand_id"],
            "influencer_id": payload["influencer_id"],
        }
    )


def handle_proposal_accepted_brand(payload: dict):
    brand = _fetch_user(payload["brand_id"])
    influencer = _fetch_user(payload["influencer_id"])
    _send_email(
        _get_email(brand),
        "PROPOSAL_ACCEPTED_BRAND",
        {
            "first_name": _get_first_name(brand),
            "influencer_name": _get_display_name(influencer),
            "campaign_name": payload.get("campaign_name", "your campaign"),
        },
    )
    _push_ws(
        payload.get("brand_id"),
        {
            "type_alias": "PROPOSAL_ACCEPTED",
            "hire_id": payload.get("hire_id"),
            "influencer_id": payload.get("influencer_id"),
            "message": f"{_get_display_name(influencer)} accepted your proposal",
        },
    )
    _log(
        {
            "type_alias": "PROPOSAL_ACCEPTED",
            "brand_id": payload["brand_id"],
            "influencer_id": payload["influencer_id"],
        }
    )


def handle_influencer_assigned(payload: dict):
    brand = _fetch_user(payload["brand_id"])
    influencer = _fetch_user(payload["influencer_id"])
    _send_email(
        _get_email(brand),
        "INFLUENCER_ASSIGNED",
        {
            "first_name": _get_first_name(brand),
            "influencer_name": _get_display_name(influencer),
            "campaign_name": payload.get("campaign_name", "your campaign"),
        },
    )


def handle_proposal_rejected_brand(payload: dict):
    brand = _fetch_user(payload["brand_id"])
    influencer = _fetch_user(payload["influencer_id"])
    _send_email(
        _get_email(brand),
        "PROPOSAL_REJECTED_BRAND",
        {
            "first_name": _get_first_name(brand),
            "influencer_name": _get_display_name(influencer),
            "campaign_name": payload.get("campaign_name", "your campaign"),
        },
    )
    _push_ws(
        payload.get("brand_id"),
        {
            "type_alias": "PROPOSAL_REJECTED",
            "hire_id": payload.get("hire_id"),
            "influencer_id": payload.get("influencer_id"),
            "message": f"{_get_display_name(influencer)} declined your proposal",
        },
    )
    _log(
        {
            "type_alias": "PROPOSAL_REJECTED",
            "brand_id": payload["brand_id"],
            "influencer_id": payload["influencer_id"],
        }
    )


def handle_campaign_completed_influencer(payload: dict):
    influencer = _fetch_user(payload["influencer_id"])
    _send_email(
        _get_email(influencer),
        "CAMPAIGN_COMPLETED_INFLUENCER",
        {
            "first_name": _get_first_name(influencer),
            "campaign_name": payload.get("campaign_name", ""),
        },
    )
    _push_ws(
        payload.get("influencer_id"),
        {
            "type_alias": "CAMPAIGN_COMPLETED",
            "hire_id": payload.get("hire_id"),
            "message": "Your campaign has been marked complete",
        },
    )
    _log(
        {
            "type_alias": "CAMPAIGN_COMPLETED",
            "text": f"Campaign completed - inf {payload['influencer_id']}, brand {payload['brand_id']}",
        }
    )


def _match_found_brand(payload: dict):
    brand = _fetch_user(payload["brand_id"])
    _send_email(
        _get_email(brand),
        "MATCH_FOUND_BRAND",
        {
            "first_name": _get_first_name(brand),
            "influencer_name": payload.get("influencer_name"),
            "niche": payload.get("matched_niche", ""),
            "follower_count": payload.get("follower_count", ""),
            "influencer_user_id": payload.get("influencer_id"),
        },
    )


def _match_found_influencer(payload: dict):
    influencer = _fetch_user(payload["influencer_id"])
    _send_email(
        _get_email(influencer),
        "MATCH_FOUND_INFLUENCER",
        {
            "first_name": _get_first_name(influencer),
            "brand_name": payload.get("brand_name"),
            "niche": payload.get("matched_niche", ""),
            "brand_user_id": payload.get("brand_id"),
        },
    )


def _unread_reminder(payload: dict):
    user_data = _fetch_user(payload["user_id"])
    _send_email(
        _get_email(user_data),
        "UNREAD_NOTIFICATIONS",
        {
            "first_name": _get_first_name(user_data),
            "unread_count": payload.get("unread_count", 0),
            "signed_up_as": user_data.get("signed_up_as", "influencer"),
        },
    )


AUTOMATION_REGISTRY = {
    "EMAIL_VERIFIED": [handle_email_verified],
    "PROFILE_INCOMPLETE": [handle_profile_incomplete],
    "PASSWORD_RESET_SUCCESS": [handle_password_reset],
    "SUBSCRIPTION_ACTIVATED": [handle_subscription_activated],
    "PROPOSAL_SENT": [handle_proposal_received_influencer, handle_proposal_sent_brand_confirmation],
    "PROPOSAL_ACCEPTED": [handle_proposal_accepted_brand, handle_influencer_assigned],
    "PROPOSAL_REJECTED": [handle_proposal_rejected_brand],
    "CAMPAIGN_COMPLETED": [handle_campaign_completed_influencer],
    "MATCH_FOUND_BRAND": [_match_found_brand],
    "MATCH_FOUND_INFLUENCER": [_match_found_influencer],
    "UNREAD_NOTIFICATIONS": [_unread_reminder],
}


@shared_task(name="celery_s.automations.dispatch_automation_event")
def dispatch_automation_event(event_type: str, payload: dict):
    for handler in AUTOMATION_REGISTRY.get(event_type, []):
        try:
            handler(payload)
        except Exception as exc:
            logger.error("[automations] %s failed for %s: %s", handler.__name__, event_type, exc)


@shared_task(name="celery_s.automations.run_match_fanout")
def run_match_fanout(new_user_id: int, signed_up_as: str):
    try:
        response = httpx.post(
            "http://user_service:8000/run_matching/",
            headers=_shared_headers(),
            json={"user_id": new_user_id, "signed_up_as": signed_up_as},
            timeout=30,
        )
        if response.status_code != 200:
            return

        matches = response.json().get("data", {})
        brand_matches = matches.get("brand_matches", [])
        influencer_matches = matches.get("influencer_matches", [])

        for payload in brand_matches:
            dispatch_automation_event.delay("MATCH_FOUND_BRAND", payload)

        for payload in influencer_matches:
            dispatch_automation_event.delay("MATCH_FOUND_INFLUENCER", payload)

        logger.info(
            "[matching] user %s (%s): %s brand matches, %s influencer matches",
            new_user_id,
            signed_up_as,
            len(brand_matches),
            len(influencer_matches),
        )
    except Exception as exc:
        logger.error("[matching] run_match_fanout(%s) failed: %s", new_user_id, exc)


@shared_task(name="celery_s.automations.check_incomplete_profiles")
def check_incomplete_profiles():
    logger.info("[beat] check_incomplete_profiles heartbeat")


@shared_task(name="celery_s.automations.send_unread_notification_reminders")
def send_unread_notification_reminders():
    try:
        response = httpx.get(
            "http://chat_service:8000/unseen_notification_counts/",
            headers=_shared_headers(),
            timeout=10,
        )
        if response.status_code != 200:
            return

        sent = 0
        for entry in response.json().get("data", []):
            user_id = entry.get("user_id")
            unread_count = entry.get("count", 0)
            if user_id and unread_count >= 1:
                _unread_reminder({"user_id": user_id, "unread_count": unread_count})
                sent += 1
        logger.info("[beat] unread reminders: %s sent", sent)
    except Exception as exc:
        logger.error("[beat] unread reminders: %s", exc)


@shared_task(name="celery_s.automations.send_pending_proposal_reminders")
def send_pending_proposal_reminders():
    cutoff = datetime.now(dt_timezone.utc) - timedelta(hours=48)
    try:
        response = httpx.get(
            "http://campaign_service:8000/pending_hires/",
            headers=_shared_headers(),
            timeout=10,
        )
        if response.status_code != 200:
            return

        sent = 0
        for hire in response.json().get("data", []):
            try:
                created = datetime.fromisoformat(hire["timestamp"].replace("Z", "+00:00"))
            except (KeyError, TypeError, ValueError):
                continue
            if created > cutoff:
                continue

            influencer_id = hire.get("hired_influencer_id")
            brand_id = hire.get("owner_id")
            if not influencer_id:
                continue

            influencer = _fetch_user(influencer_id)
            brand = _fetch_user(brand_id) if brand_id else {}
            _send_email(
                _get_email(influencer),
                "PROPOSAL_RECEIVED_INFLUENCER",
                {
                    "first_name": _get_first_name(influencer),
                    "brand_name": _get_display_name(brand),
                },
            )
            sent += 1
        logger.info("[beat] pending proposal reminders: %s sent", sent)
    except Exception as exc:
        logger.error("[beat] pending proposals: %s", exc)


@shared_task(name="celery_s.automations.daily_match_scan")
def daily_match_scan():
    week_ago = datetime.now(dt_timezone.utc) - timedelta(days=7)
    try:
        response = httpx.get(
            "http://user_service:8000/get_all_influencers/",
            headers=_shared_headers(),
            params={"page_size": 100},
            timeout=15,
        )
        if response.status_code != 200:
            return

        profiles = response.json().get("data", {}).get("results", [])
        scanned = 0
        for profile in profiles:
            user = profile.get("user", {})
            joined_str = user.get("date_joined")
            if not joined_str:
                continue
            try:
                joined = datetime.fromisoformat(joined_str.replace("Z", "+00:00"))
            except ValueError:
                continue
            if joined < week_ago:
                continue
            user_id = user.get("id")
            signed_up_as = profile.get("signed_up_as", "influencer")
            if user_id:
                run_match_fanout.delay(user_id, signed_up_as)
                scanned += 1
        logger.info("[beat] daily match scan: queued %s fanouts", scanned)
    except Exception as exc:
        logger.error("[beat] daily_match_scan: %s", exc)


@shared_task(name="celery_s.automations.data_consistency_check")
def data_consistency_check():
    issues = []
    try:
        hires_response = httpx.get(
            "http://campaign_service:8000/proposals/",
            headers=_shared_headers(),
            timeout=15,
        )
        campaigns_response = httpx.get(
            "http://campaign_service:8000/get_all_camaign_of_all_users/",
            headers=_shared_headers(),
            timeout=15,
        )
        if hires_response.status_code == 200 and campaigns_response.status_code == 200:
            hire_campaign_ids = {
                hire.get("campaign_id")
                for hire in hires_response.json().get("data", {}).get("results", [])
                if hire.get("campaign_id")
            }
            valid_campaign_ids = {
                campaign.get("id")
                for campaign in campaigns_response.json().get("data", {}).get("results", [])
            }
            orphaned = hire_campaign_ids - valid_campaign_ids
            if orphaned:
                issues.append(f"Hires referencing non-existent campaigns: {orphaned}")
    except Exception as exc:
        logger.error("[consistency] hire/campaign check failed: %s", exc)

    if not issues:
        logger.info("[consistency] weekly check passed - no issues found")
    else:
        for issue in issues:
            logger.warning("[consistency] %s", issue)


@shared_task(name="celery_s.automations.platform_health_check")
def platform_health_check():
    services = {
        "user_service": "http://user_service:8000/get_featured_influencers/",
        "campaign_service": "http://campaign_service:8000/",
        "chat_service": "http://chat_service:8000/",
        "subscription_service": "http://subscription_service:8000/",
    }
    for service_name, url in services.items():
        try:
            response = httpx.get(url, headers=_shared_headers(), timeout=5)
            if response.status_code >= 500:
                logger.error("[health] %s -> %s", service_name, response.status_code)
        except Exception as exc:
            logger.error("[health] %s unreachable: %s", service_name, exc)
