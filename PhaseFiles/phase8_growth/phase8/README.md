# Phase 8 — Growth Automations
# Deploy after Phase 7. Backend only — no frontend changes.


## What this adds
- Weekly digest email for influencers (every Monday: new brands, pending proposals, earnings)
- Weekly digest email for brands (every Monday: new influencers, pending proposals, deadlines)
- Re-engagement email (users who haven't logged in for 30 days)
- Campaign deadline reminders (3 days before end_date — sent to both brand and influencer)
- Post-campaign review requests (24h after campaign marked complete)
- Subscription renewal reminders (7 days before renewal — different message if cancelled)
- All 7 new email templates to go with the above


## FILES — all additions (nothing gets replaced)

  celery_service__celery_s__email_templates_additions.py
    → Open this file. It contains 7 new template entries.
    → Open celery_service/celery_s/email_templates.py
    → Find the TEMPLATES = { ... } dictionary
    → Add all 7 entries from this file INSIDE the dictionary, before the closing }

  celery_service__celery_s__automations_additions.py
    → Open this file. It contains:
      FUNCTIONS_TO_ADD: 6 handler functions + 5 beat task functions
      REGISTRY_ADDITIONS: 6 new event types to add to AUTOMATION_REGISTRY
      BEAT_SCHEDULE_ADDITIONS: 5 new scheduled tasks

    → Step 1: Copy FUNCTIONS_TO_ADD to the BOTTOM of automations.py

    → Step 2: Find AUTOMATION_REGISTRY = { ... } in automations.py and
      add the 6 entries from REGISTRY_ADDITIONS inside it:
        "WEEKLY_DIGEST_BRAND":           [_weekly_digest_brand],
        "WEEKLY_DIGEST_INFLUENCER":      [_weekly_digest_influencer],
        "RE_ENGAGEMENT":                 [_re_engagement],
        "CAMPAIGN_DEADLINE":             [_campaign_deadline_reminder],
        "SUBSCRIPTION_RENEWAL":          [_subscription_renewal_reminder],
        "POST_CAMPAIGN_REVIEW_REQUEST":  [_post_campaign_review_request],

    → Step 3: Find CELERY_BEAT_SCHEDULE = { ... } in celery_service/src/settings.py
      and add the 5 entries from BEAT_SCHEDULE_ADDITIONS inside it.

  subscription_service__subscription__views_addition.py
    → Open this file. Copy the get_all_subscriptions function.
    → Paste it at the BOTTOM of subscription_service/subscription/views.py
    → Add this line to subscription_service/subscription/urls.py:
        path('get_all_subscriptions/', views.get_all_subscriptions),


## NO MIGRATIONS NEEDED.

## RESTART:
  docker compose restart celery_service subscription_service

## VERIFY
  □ Celery beat logs show new task names firing on schedule
  □ Manually trigger a weekly digest:
      docker compose exec celery_service python -c "
      from celery_s.automations import send_weekly_digests
      send_weekly_digests()
      "
    → Check a test user's inbox for the digest email
  □ GET /subscription_service/get_all_subscriptions/ returns active subscriptions
  □ In automations.py: AUTOMATION_REGISTRY has all 6 new event types


## BEAT SCHEDULE SUMMARY (after Phase 8)
All times UTC:

  Mon 7am    daily_match_scan
  Mon 8am    send_unread_notification_reminders
  Mon 9am    check_incomplete_profiles + send_weekly_digests
  Mon 9:30am subscription_renewal_reminders
  Mon 10am   send_pending_proposal_reminders
  Mon 11am   reengagement_emails
  Daily 8am  send_unread_notification_reminders
  Daily 8:30 campaign_deadline_reminders
  Daily 9am  check_incomplete_profiles
  Daily 9:30 subscription_renewal_reminders
  Daily 10am send_pending_proposal_reminders
  Daily noon post_campaign_review_requests
  Mon 3am    data_consistency_check
  Every 5min platform_health_check
