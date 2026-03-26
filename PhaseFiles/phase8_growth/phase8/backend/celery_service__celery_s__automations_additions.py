"""
ADDITIONS FILE: celery_service/celery_s/automations.py
=======================================================
Copy the functions and AUTOMATION_REGISTRY additions below to the BOTTOM
of your existing automations.py file (after the existing content).
Then add the new beat tasks to CELERY_BEAT_SCHEDULE in settings.py.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PASTE THESE FUNCTIONS at the bottom of automations.py
# ─────────────────────────────────────────────────────────────────────────────

FUNCTIONS_TO_ADD = '''

# ─── Phase 8: Growth automation handlers ─────────────────────────────────────

def _weekly_digest_brand(payload):
    ud = _fetch_user(payload["user_id"])
    _send_email(_get_email(ud), "WEEKLY_DIGEST_BRAND", {
        "first_name": _get_first_name(ud),
        "new_influencer_count": payload.get("new_influencer_count", 0),
        "pending_proposal_count": payload.get("pending_proposal_count", 0),
        "campaigns_ending_soon": payload.get("campaigns_ending_soon", 0),
    })


def _weekly_digest_influencer(payload):
    ud = _fetch_user(payload["user_id"])
    _send_email(_get_email(ud), "WEEKLY_DIGEST_INFLUENCER", {
        "first_name": _get_first_name(ud),
        "new_brand_count": payload.get("new_brand_count", 0),
        "pending_proposals": payload.get("pending_proposals", 0),
        "total_earned": payload.get("total_earned", 0),
    })


def _re_engagement(payload):
    ud = _fetch_user(payload["user_id"])
    signed_up_as = ud.get("signed_up_as", "influencer")
    _send_email(_get_email(ud), "RE_ENGAGEMENT", {
        "first_name": _get_first_name(ud),
        "signed_up_as": signed_up_as,
    })


def _campaign_deadline_reminder(payload):
    brand = _fetch_user(payload["brand_id"])
    inf = _fetch_user(payload["influencer_id"])
    days = payload.get("days_remaining", 3)
    _send_email(_get_email(brand), "CAMPAIGN_DEADLINE_BRAND", {
        "first_name": _get_first_name(brand),
        "campaign_name": payload.get("campaign_name", "your campaign"),
        "days_remaining": days,
        "influencer_name": _get_display_name(inf),
    })
    _send_email(_get_email(inf), "CAMPAIGN_DEADLINE_INFLUENCER", {
        "first_name": _get_first_name(inf),
        "campaign_name": payload.get("campaign_name", "your campaign"),
        "days_remaining": days,
        "brand_name": _get_display_name(brand),
    })


def _subscription_renewal_reminder(payload):
    ud = _fetch_user(payload["user_id"])
    _send_email(_get_email(ud), "SUBSCRIPTION_RENEWAL_REMINDER", {
        "first_name": _get_first_name(ud),
        "plan_name": payload.get("plan_name", "your plan"),
        "days_until_renewal": payload.get("days_until_renewal", 7),
        "cancel_at_period_end": payload.get("cancel_at_period_end", False),
    })


def _post_campaign_review_request(payload):
    brand = _fetch_user(payload["brand_id"])
    inf = _fetch_user(payload["influencer_id"])
    _send_email(_get_email(brand), "REVIEW_REQUEST_BRAND", {
        "first_name": _get_first_name(brand),
        "influencer_name": _get_display_name(inf),
        "campaign_name": payload.get("campaign_name", "your campaign"),
        "offer_id": payload.get("hire_id"),
    })
    _send_email(_get_email(inf), "REVIEW_REQUEST_INFLUENCER", {
        "first_name": _get_first_name(inf),
        "brand_name": _get_display_name(brand),
        "campaign_name": payload.get("campaign_name", "your campaign"),
        "offer_id": payload.get("hire_id"),
    })


# ─── Add these entries to AUTOMATION_REGISTRY ────────────────────────────────
# In automations.py, find AUTOMATION_REGISTRY = { ... } and add these lines:

REGISTRY_ADDITIONS = {
    "WEEKLY_DIGEST_BRAND":          [_weekly_digest_brand],
    "WEEKLY_DIGEST_INFLUENCER":     [_weekly_digest_influencer],
    "RE_ENGAGEMENT":                [_re_engagement],
    "CAMPAIGN_DEADLINE":            [_campaign_deadline_reminder],
    "SUBSCRIPTION_RENEWAL":         [_subscription_renewal_reminder],
    "POST_CAMPAIGN_REVIEW_REQUEST": [_post_campaign_review_request],
}


# ─── Phase 8: Beat tasks ──────────────────────────────────────────────────────

@shared_task(name="celery_s.automations.send_weekly_digests")
def send_weekly_digests():
    """Every Monday 9am UTC: send weekly digest to all active users."""
    from datetime import datetime, timedelta, timezone
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    try:
        res = httpx.get("http://user_service:8000/get_all_influencers/",
                        headers={"Host": "localhost"}, params={"page_size": 500}, timeout=20)
        if res.status_code != 200:
            return
        for profile in res.json().get("data", {}).get("results", []):
            user_id = profile.get("user", {}).get("id")
            if user_id:
                dispatch_automation_event.delay("WEEKLY_DIGEST_INFLUENCER", {
                    "user_id": user_id,
                    "new_brand_count": 0,  # TODO: calculate from Log events this week
                    "pending_proposals": 0,
                    "total_earned": 0,
                })
        logger.info("[beat] weekly digests queued for influencers")
    except Exception as e:
        logger.error(f"[beat] weekly_digests: {e}")


@shared_task(name="celery_s.automations.send_reengagement_emails")
def send_reengagement_emails():
    """Weekly: email users who haven't logged in for 30 days."""
    from datetime import datetime, timedelta, timezone
    # Note: requires User.last_login field — Django tracks this automatically
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    try:
        res = httpx.get("http://user_service:8000/get_all_influencers/",
                        headers={"Host": "localhost"}, params={"page_size": 500}, timeout=20)
        if res.status_code != 200:
            return
        sent = 0
        for profile in res.json().get("data", {}).get("results", []):
            user = profile.get("user", {})
            last_login_str = user.get("last_login")
            if not last_login_str:
                continue
            try:
                last_login = datetime.fromisoformat(last_login_str.replace("Z", "+00:00"))
            except ValueError:
                continue
            if last_login < cutoff:
                user_id = user.get("id")
                if user_id:
                    dispatch_automation_event.delay("RE_ENGAGEMENT", {"user_id": user_id})
                    sent += 1
        logger.info(f"[beat] re-engagement: {sent} queued")
    except Exception as e:
        logger.error(f"[beat] re-engagement: {e}")


@shared_task(name="celery_s.automations.send_campaign_deadline_reminders")
def send_campaign_deadline_reminders():
    """Daily 8am: remind about campaigns ending in 3 days."""
    from datetime import datetime, timedelta, timezone
    target_date = (datetime.now(timezone.utc) + timedelta(days=3)).date()
    try:
        res = httpx.get("http://campaign_service:8000/proposals/",
                        headers={"Host": "localhost"}, timeout=15)
        if res.status_code != 200:
            return
        sent = 0
        for hire in res.json().get("data", {}).get("results", []):
            if not hire.get("is_accepted_by_influencer"):
                continue
            if hire.get("is_completed_marked_by_brand"):
                continue
            end_str = hire.get("end_date")
            if not end_str:
                continue
            try:
                end_date = datetime.fromisoformat(end_str.replace("Z", "+00:00")).date()
            except ValueError:
                continue
            if end_date == target_date:
                dispatch_automation_event.delay("CAMPAIGN_DEADLINE", {
                    "brand_id": hire.get("owner_id"),
                    "influencer_id": hire.get("hired_influencer_id"),
                    "hire_id": hire.get("id"),
                    "campaign_name": hire.get("campaign", {}).get("campaign_name", ""),
                    "days_remaining": 3,
                })
                sent += 1
        logger.info(f"[beat] deadline reminders: {sent} queued")
    except Exception as e:
        logger.error(f"[beat] deadline reminders: {e}")


@shared_task(name="celery_s.automations.send_post_campaign_review_requests")
def send_post_campaign_review_requests():
    """Daily: send review request 24h after campaign marked complete."""
    from datetime import datetime, timedelta, timezone
    cutoff_start = datetime.now(timezone.utc) - timedelta(hours=25)
    cutoff_end = datetime.now(timezone.utc) - timedelta(hours=23)
    try:
        res = httpx.get("http://campaign_service:8000/proposals/",
                        headers={"Host": "localhost"}, timeout=15)
        if res.status_code != 200:
            return
        sent = 0
        for hire in res.json().get("data", {}).get("results", []):
            if not hire.get("is_completed_marked_by_brand"):
                continue
            if hire.get("rating"):  # already rated
                continue
            ts_str = hire.get("timestamp")
            if not ts_str:
                continue
            try:
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            except ValueError:
                continue
            if cutoff_start <= ts <= cutoff_end:
                dispatch_automation_event.delay("POST_CAMPAIGN_REVIEW_REQUEST", {
                    "brand_id": hire.get("owner_id"),
                    "influencer_id": hire.get("hired_influencer_id"),
                    "hire_id": hire.get("id"),
                    "campaign_name": hire.get("campaign", {}).get("campaign_name", ""),
                })
                sent += 1
        logger.info(f"[beat] review requests: {sent} queued")
    except Exception as e:
        logger.error(f"[beat] review requests: {e}")


@shared_task(name="celery_s.automations.send_subscription_renewal_reminders")
def send_subscription_renewal_reminders():
    """Daily: remind users 7 days before subscription renews."""
    import httpx as _httpx
    from datetime import datetime, timedelta, timezone
    target = datetime.now(timezone.utc) + timedelta(days=7)
    try:
        # Subscription service exposes subscription info via its own endpoint
        res = _httpx.get("http://subscription_service:8000/get_all_subscriptions/",
                         headers={"Host": "localhost"}, timeout=15)
        if res.status_code != 200:
            return
        sent = 0
        for sub in res.json().get("data", []):
            if sub.get("status") not in ("active", "trialing"):
                continue
            period_end_str = sub.get("current_period_end")
            if not period_end_str:
                continue
            try:
                period_end = datetime.fromisoformat(period_end_str.replace("Z", "+00:00"))
            except ValueError:
                continue
            if abs((period_end - target).days) < 1:
                dispatch_automation_event.delay("SUBSCRIPTION_RENEWAL", {
                    "user_id": sub.get("user"),
                    "plan_name": sub.get("plan_name", "your plan"),
                    "days_until_renewal": 7,
                    "cancel_at_period_end": sub.get("cancel_at_period_end", False),
                })
                sent += 1
        logger.info(f"[beat] renewal reminders: {sent} queued")
    except Exception as e:
        logger.error(f"[beat] renewal reminders: {e}")
'''


# ─────────────────────────────────────────────────────────────────────────────
# ADD THESE to CELERY_BEAT_SCHEDULE in celery_service/src/settings.py
# ─────────────────────────────────────────────────────────────────────────────

BEAT_SCHEDULE_ADDITIONS = """
    # Phase 8: Growth automations
    'send-weekly-digests': {
        'task': 'celery_s.automations.send_weekly_digests',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),  # Monday 9am UTC
    },
    'reengagement-emails': {
        'task': 'celery_s.automations.send_reengagement_emails',
        'schedule': crontab(hour=11, minute=0, day_of_week=1),  # Monday 11am UTC
    },
    'campaign-deadline-reminders': {
        'task': 'celery_s.automations.send_campaign_deadline_reminders',
        'schedule': crontab(hour=8, minute=30),  # 8:30am UTC daily
    },
    'post-campaign-review-requests': {
        'task': 'celery_s.automations.send_post_campaign_review_requests',
        'schedule': crontab(hour=12, minute=0),  # noon UTC daily
    },
    'subscription-renewal-reminders': {
        'task': 'celery_s.automations.send_subscription_renewal_reminders',
        'schedule': crontab(hour=9, minute=30),  # 9:30am UTC daily
    },
"""
