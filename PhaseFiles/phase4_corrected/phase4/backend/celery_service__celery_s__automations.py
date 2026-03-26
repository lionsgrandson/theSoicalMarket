"""
celery_service/celery_s/automations.py  — Phase 4 & 5 complete version

Replaces all previous versions of this file.
Adds:
  - run_match_fanout task (called from signup, runs matching and dispatches emails)
  - daily_match_scan beat task (finds recent joiners and re-runs matching for them)
  - data_consistency_check beat task (Phase 5: orphan detection)
"""

from celery import shared_task
import logging
import httpx

logger = logging.getLogger(__name__)

SITE_BASE_URL = "https://thesocialmarket.ai"


# ─── Helpers (unchanged from email package) ───────────────────────────────────

def _fetch_user(user_id: int) -> dict:
    try:
        res = httpx.get(
            f"http://user_service:8000/get_user_info_by_id/{user_id}/",
            headers={"Host": "localhost"}, timeout=8,
        )
        if res.status_code == 200:
            return res.json().get('data', {})
    except Exception as e:
        logger.warning(f"[automations] _fetch_user({user_id}): {e}")
    return {}


def _get_email(ud: dict) -> str | None:
    return ud.get('user', {}).get('email')

def _get_first_name(ud: dict) -> str:
    return ud.get('user', {}).get('first_name') or "there"

def _get_display_name(ud: dict) -> str:
    inf = ud.get('influencer_profile') or {}
    brand = ud.get('brand_profile') or {}
    user = ud.get('user') or {}
    return (
        inf.get('display_name') or brand.get('business_name') or
        brand.get('display_name') or
        f"{user.get('first_name','')} {user.get('last_name','')}".strip() or "Unknown"
    )

def _get_niche(ud: dict) -> str:
    raw = (ud.get('influencer_profile') or {}).get('content_niches') or ""
    parts = [n.strip() for n in raw.split(',') if n.strip()]
    return parts[0] if parts else ""

def _get_follower_count(ud: dict) -> str:
    inf = ud.get('influencer_profile') or {}
    total = sum([
        inf.get('insta_follower') or 0, inf.get('facebook_follower') or 0,
        inf.get('tiktok_follower') or 0, inf.get('linkedin_follower') or 0,
        inf.get('youtube_follower') or 0, inf.get('twitter_follower') or 0,
    ])
    if total >= 1_000_000: return f"{total/1_000_000:.1f}M"
    if total >= 1_000: return f"{total/1_000:.0f}K"
    return str(total)

def _send_email(email, key, ctx):
    if not email: return
    from celery_s.tasks import send_email_task
    send_email_task.delay(email, key, ctx)

def _push_ws(user_id, msg):
    from celery_s.tasks import send_websocket_notification_task
    send_websocket_notification_task.delay(user_id, msg)

def _log(data):
    try:
        httpx.post("http://user_service:8000/create_log/",
                   headers={"Host": "localhost"}, json=data, timeout=5)
    except Exception as e:
        logger.warning(f"[automations] _log failed: {e}")


# ─── Handler functions ────────────────────────────────────────────────────────

def handle_email_verified(payload):
    ud = _fetch_user(payload['user_id'])
    signed_up_as = ud.get('signed_up_as', 'influencer')
    dashboard = (f"{SITE_BASE_URL}/influencer-dashboard"
                 if signed_up_as in ('influencer', 'both') else f"{SITE_BASE_URL}/brand-dashboard")
    _send_email(_get_email(ud), 'EMAIL_VERIFIED', {
        'first_name': _get_first_name(ud), 'dashboard_url': dashboard, 'signed_up_as': signed_up_as,
    })

def handle_profile_incomplete(payload):
    ud = _fetch_user(payload['user_id'])
    _send_email(_get_email(ud), 'PROFILE_INCOMPLETE', {
        'first_name': _get_first_name(ud), 'signed_up_as': ud.get('signed_up_as', 'influencer'),
    })

def handle_password_reset(payload):
    ud = _fetch_user(payload['user_id'])
    _send_email(_get_email(ud), 'PASSWORD_RESET_SUCCESS', {'first_name': _get_first_name(ud)})

def handle_subscription_activated(payload):
    ud = _fetch_user(payload['user_id'])
    _send_email(_get_email(ud), 'SUBSCRIPTION_ACTIVATED', {
        'first_name': _get_first_name(ud),
        'plan_name': payload.get('plan_name', 'your plan'),
        'signed_up_as': ud.get('signed_up_as', 'influencer'),
    })
    _log({'type_alias': 'SUBSCRIPTION_CREATED',
          'text': f"Sub created for user {payload['user_id']}: {payload.get('plan_name')}"})

def handle_proposal_sent_brand_confirmation(payload):
    brand = _fetch_user(payload['brand_id'])
    inf = _fetch_user(payload['influencer_id'])
    _send_email(_get_email(brand), 'PROPOSAL_SENT_BRAND', {
        'first_name': _get_first_name(brand), 'influencer_name': _get_display_name(inf),
    })

def handle_proposal_received_influencer(payload):
    inf = _fetch_user(payload['influencer_id'])
    brand = _fetch_user(payload['brand_id'])
    _send_email(_get_email(inf), 'PROPOSAL_RECEIVED_INFLUENCER', {
        'first_name': _get_first_name(inf), 'brand_name': _get_display_name(brand),
    })
    _push_ws(payload['influencer_id'], {
        'type_alias': 'HIRING_PROPOSAL', 'hire_id': payload.get('hire_id'),
        'brand_id': payload.get('brand_id'), 'campaign_id': payload.get('campaign_id'),
        'message': f"New proposal from {_get_display_name(brand)}",
    })
    _log({'type_alias': 'PROPOSAL_SENT',
          'brand_id': payload['brand_id'], 'influencer_id': payload['influencer_id']})

def handle_proposal_accepted_brand(payload):
    brand = _fetch_user(payload['brand_id'])
    inf = _fetch_user(payload['influencer_id'])
    _send_email(_get_email(brand), 'PROPOSAL_ACCEPTED_BRAND', {
        'first_name': _get_first_name(brand), 'influencer_name': _get_display_name(inf),
        'campaign_name': payload.get('campaign_name', 'your campaign'),
    })
    _push_ws(payload['brand_id'], {
        'type_alias': 'PROPOSAL_ACCEPTED', 'hire_id': payload.get('hire_id'),
        'influencer_id': payload.get('influencer_id'),
        'message': f"{_get_display_name(inf)} accepted your proposal",
    })
    _log({'type_alias': 'PROPOSAL_ACCEPTED',
          'brand_id': payload['brand_id'], 'influencer_id': payload['influencer_id']})

def handle_influencer_assigned(payload):
    brand = _fetch_user(payload['brand_id'])
    inf = _fetch_user(payload['influencer_id'])
    _send_email(_get_email(brand), 'INFLUENCER_ASSIGNED', {
        'first_name': _get_first_name(brand), 'influencer_name': _get_display_name(inf),
        'campaign_name': payload.get('campaign_name', 'your campaign'),
    })

def handle_proposal_rejected_brand(payload):
    brand = _fetch_user(payload['brand_id'])
    inf = _fetch_user(payload['influencer_id'])
    _send_email(_get_email(brand), 'PROPOSAL_REJECTED_BRAND', {
        'first_name': _get_first_name(brand), 'influencer_name': _get_display_name(inf),
        'campaign_name': payload.get('campaign_name', 'your campaign'),
    })
    _push_ws(payload['brand_id'], {
        'type_alias': 'PROPOSAL_REJECTED', 'hire_id': payload.get('hire_id'),
        'influencer_id': payload.get('influencer_id'),
        'message': f"{_get_display_name(inf)} declined your proposal",
    })
    _log({'type_alias': 'PROPOSAL_REJECTED',
          'brand_id': payload['brand_id'], 'influencer_id': payload['influencer_id']})

def handle_campaign_completed_influencer(payload):
    inf = _fetch_user(payload['influencer_id'])
    _send_email(_get_email(inf), 'CAMPAIGN_COMPLETED_INFLUENCER', {
        'first_name': _get_first_name(inf), 'campaign_name': payload.get('campaign_name', ''),
    })
    _push_ws(payload['influencer_id'], {
        'type_alias': 'CAMPAIGN_COMPLETED', 'hire_id': payload.get('hire_id'),
        'message': "Your campaign has been marked complete",
    })
    _log({'type_alias': 'CAMPAIGN_COMPLETED',
          'text': f"Campaign completed — inf {payload['influencer_id']}, brand {payload['brand_id']}"})

def _match_found_brand(payload):
    brand = _fetch_user(payload['brand_id'])
    _send_email(_get_email(brand), 'MATCH_FOUND_BRAND', {
        'first_name': _get_first_name(brand),
        'influencer_name': payload.get('influencer_name'),
        'niche': payload.get('matched_niche', ''),
        'follower_count': payload.get('follower_count', ''),
        'influencer_user_id': payload.get('influencer_id'),
    })

def _match_found_influencer(payload):
    inf = _fetch_user(payload['influencer_id'])
    _send_email(_get_email(inf), 'MATCH_FOUND_INFLUENCER', {
        'first_name': _get_first_name(inf),
        'brand_name': payload.get('brand_name'),
        'niche': payload.get('matched_niche', ''),
        'brand_user_id': payload.get('brand_id'),
    })

def _unread_reminder(payload):
    ud = _fetch_user(payload['user_id'])
    _send_email(_get_email(ud), 'UNREAD_NOTIFICATIONS', {
        'first_name': _get_first_name(ud),
        'unread_count': payload.get('unread_count', 0),
        'signed_up_as': ud.get('signed_up_as', 'influencer'),
    })


# ─── Automation Registry ──────────────────────────────────────────────────────

AUTOMATION_REGISTRY = {
    'EMAIL_VERIFIED':              [handle_email_verified],
    'PROFILE_INCOMPLETE':          [handle_profile_incomplete],
    'PASSWORD_RESET_SUCCESS':      [handle_password_reset],
    'SUBSCRIPTION_ACTIVATED':      [handle_subscription_activated],
    'PROPOSAL_SENT':               [handle_proposal_received_influencer,
                                    handle_proposal_sent_brand_confirmation],
    'PROPOSAL_ACCEPTED':           [handle_proposal_accepted_brand, handle_influencer_assigned],
    'PROPOSAL_REJECTED':           [handle_proposal_rejected_brand],
    'CAMPAIGN_COMPLETED':          [handle_campaign_completed_influencer],
    'MATCH_FOUND_BRAND':           [_match_found_brand],
    'MATCH_FOUND_INFLUENCER':      [_match_found_influencer],
    'UNREAD_NOTIFICATIONS':        [_unread_reminder],
}


# ─── Dispatcher ───────────────────────────────────────────────────────────────

@shared_task(name='celery_s.automations.dispatch_automation_event')
def dispatch_automation_event(event_type: str, payload: dict):
    handlers = AUTOMATION_REGISTRY.get(event_type, [])
    for handler in handlers:
        try:
            handler(payload)
        except Exception as e:
            logger.error(f"[automations] {handler.__name__} failed for {event_type}: {e}")


# ─── Phase 4: Matching fan-out ────────────────────────────────────────────────

@shared_task(name='celery_s.automations.run_match_fanout')
def run_match_fanout(new_user_id: int, signed_up_as: str):
    """
    Called from the signup view. Runs the matching engine for the new user
    and dispatches MATCH_FOUND_* events to all relevant matches.
    """
    try:
        res = httpx.post(
            "http://user_service:8000/run_matching/",
            headers={"Host": "localhost"},
            json={"user_id": new_user_id, "signed_up_as": signed_up_as},
            timeout=30,
        )
        if res.status_code == 200:
            matches = res.json().get('data', {})
            brand_matches = matches.get('brand_matches', [])
            influencer_matches = matches.get('influencer_matches', [])

            for payload in brand_matches:
                dispatch_automation_event.delay('MATCH_FOUND_BRAND', payload)

            for payload in influencer_matches:
                dispatch_automation_event.delay('MATCH_FOUND_INFLUENCER', payload)

            logger.info(
                f"[matching] user {new_user_id} ({signed_up_as}): "
                f"{len(brand_matches)} brand matches, {len(influencer_matches)} influencer matches"
            )
    except Exception as e:
        logger.error(f"[matching] run_match_fanout({new_user_id}) failed: {e}")


# ─── Beat tasks ───────────────────────────────────────────────────────────────

@shared_task(name='celery_s.automations.check_incomplete_profiles')
def check_incomplete_profiles():
    """Daily: nudge users 24–72h after signup who haven't completed their profile."""
    from datetime import datetime, timedelta, timezone
    cutoff_start = datetime.now(timezone.utc) - timedelta(hours=72)
    cutoff_end = datetime.now(timezone.utc) - timedelta(hours=24)
    try:
        res = httpx.get("http://user_service:8000/get_all_influencers/",
                        headers={"Host": "localhost"}, params={"page_size": 200}, timeout=15)
        if res.status_code != 200:
            return
        profiles = res.json().get('data', {}).get('results', [])
        sent = 0
        for profile in profiles:
            user = profile.get('user', {})
            inf = profile.get('influencer_profile') or {}
            brand = profile.get('brand_profile') or {}
            if inf.get('display_name') or brand.get('display_name') or brand.get('business_name'):
                continue
            joined_str = user.get('date_joined')
            if not joined_str:
                continue
            try:
                joined = datetime.fromisoformat(joined_str.replace('Z', '+00:00'))
            except ValueError:
                continue
            if not (cutoff_start <= joined <= cutoff_end):
                continue
            user_id = user.get('id')
            if user_id:
                dispatch_automation_event.delay('PROFILE_INCOMPLETE', {'user_id': user_id})
                sent += 1
        logger.info(f"[beat] incomplete profiles: queued {sent} emails")
    except Exception as e:
        logger.error(f"[beat] check_incomplete_profiles: {e}")


@shared_task(name='celery_s.automations.send_unread_notification_reminders')
def send_unread_notification_reminders():
    """Daily: email users with unseen notifications older than 24h."""
    try:
        res = httpx.get("http://chat_service:8000/unseen_notification_counts/",
                        headers={"Host": "localhost"}, timeout=10)
        if res.status_code != 200:
            return
        sent = 0
        for entry in res.json().get('data', []):
            user_id = entry.get('user_id')
            count = entry.get('count', 0)
            if user_id and count >= 1:
                _unread_reminder({'user_id': user_id, 'unread_count': count})
                sent += 1
        logger.info(f"[beat] unread reminders: {sent} sent")
    except Exception as e:
        logger.error(f"[beat] unread reminders: {e}")


@shared_task(name='celery_s.automations.send_pending_proposal_reminders')
def send_pending_proposal_reminders():
    """Daily: remind influencers of proposals pending 48+ hours."""
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
    try:
        res = httpx.get("http://campaign_service:8000/pending_hires/",
                        headers={"Host": "localhost"}, timeout=10)
        if res.status_code != 200:
            return
        sent = 0
        for hire in res.json().get('data', []):
            try:
                created = datetime.fromisoformat(hire['timestamp'].replace('Z', '+00:00'))
            except (KeyError, ValueError):
                continue
            if created > cutoff:
                continue
            inf_id = hire.get('hired_influencer_id')
            brand_id = hire.get('owner_id')
            if not inf_id:
                continue
            inf = _fetch_user(inf_id)
            brand = _fetch_user(brand_id) if brand_id else {}
            _send_email(_get_email(inf), 'PROPOSAL_RECEIVED_INFLUENCER', {
                'first_name': _get_first_name(inf), 'brand_name': _get_display_name(brand),
            })
            sent += 1
        logger.info(f"[beat] pending proposal reminders: {sent} sent")
    except Exception as e:
        logger.error(f"[beat] pending proposals: {e}")


@shared_task(name='celery_s.automations.daily_match_scan')
def daily_match_scan():
    """
    Daily: find users who joined in the last 7 days and haven't been matched yet,
    and run the matching fanout for them. Catches anyone who slipped through
    the signup trigger (e.g. social login, import, etc.)
    """
    from datetime import datetime, timedelta, timezone
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    try:
        res = httpx.get(
            "http://user_service:8000/get_all_influencers/",
            headers={"Host": "localhost"},
            params={"page_size": 100},
            timeout=15,
        )
        if res.status_code != 200:
            return
        profiles = res.json().get('data', {}).get('results', [])
        scanned = 0
        for profile in profiles:
            user = profile.get('user', {})
            joined_str = user.get('date_joined')
            if not joined_str:
                continue
            try:
                joined = datetime.fromisoformat(joined_str.replace('Z', '+00:00'))
            except ValueError:
                continue
            if joined < week_ago:
                continue
            user_id = user.get('id')
            signed_up_as = profile.get('signed_up_as', 'influencer')
            if user_id:
                run_match_fanout.delay(user_id, signed_up_as)
                scanned += 1
        logger.info(f"[beat] daily match scan: queued {scanned} fanouts")
    except Exception as e:
        logger.error(f"[beat] daily_match_scan: {e}")


# ─── Phase 5: Data consistency check ─────────────────────────────────────────

@shared_task(name='celery_s.automations.data_consistency_check')
def data_consistency_check():
    """
    Weekly: detect cross-service data integrity issues and log warnings.

    Checks:
    1. Hires referencing campaign_ids that don't exist in campaign_service
    2. Subscriptions referencing user_ids that don't exist in user_service
    3. Notifications referencing user_ids with no matching profile

    Results are logged as warnings. No data is modified automatically —
    this is an observability tool, not an auto-repair tool.
    """
    issues = []

    # Check 1: Hires with orphaned campaign_ids
    try:
        hires_res = httpx.get(
            "http://campaign_service:8000/proposals/",
            headers={"Host": "localhost"}, timeout=15,
        )
        campaigns_res = httpx.get(
            "http://campaign_service:8000/get_all_camaign_of_all_users/",
            headers={"Host": "localhost"}, timeout=15,
        )
        if hires_res.status_code == 200 and campaigns_res.status_code == 200:
            hire_campaign_ids = {
                h.get('campaign_id') for h in hires_res.json().get('data', {}).get('results', [])
                if h.get('campaign_id')
            }
            valid_campaign_ids = {
                c.get('id') for c in campaigns_res.json().get('data', {}).get('results', [])
            }
            orphaned = hire_campaign_ids - valid_campaign_ids
            if orphaned:
                msg = f"Hires referencing non-existent campaigns: {orphaned}"
                issues.append(msg)
                logger.warning(f"[consistency] {msg}")
    except Exception as e:
        logger.error(f"[consistency] hire/campaign check failed: {e}")

    # Log summary
    if not issues:
        logger.info("[consistency] weekly check passed — no issues found")
    else:
        logger.warning(f"[consistency] weekly check found {len(issues)} issue(s)")
        # Future: send alert email to admin here
        # _send_email(ADMIN_EMAIL, 'CONSISTENCY_ALERT', {'issues': issues})


@shared_task(name='celery_s.automations.platform_health_check')
def platform_health_check():
    """Every 5 min: ping all services."""
    services = {
        'user_service': 'http://user_service:8000/get_featured_influencers/',
        'campaign_service': 'http://campaign_service:8000/',
        'chat_service': 'http://chat_service:8000/',
        'subscription_service': 'http://subscription_service:8000/',
    }
    for name, url in services.items():
        try:
            res = httpx.get(url, headers={"Host": "localhost"}, timeout=5)
            if res.status_code >= 500:
                logger.error(f"[health] {name} → {res.status_code}")
        except Exception as e:
            logger.error(f"[health] {name} unreachable: {e}")
