# Phase 4 — Emails, Automations & Matching Engine
# Deploy after Phase 3 is live and verified.
# This is the largest phase. Read fully before starting.

## BACKEND — drop-in replacements (overwrite the existing file)

  campaign_service__campaign__signals.py
    → campaign_service/campaign/signals.py
    WHAT CHANGED: was synchronous httpx+email inside signal (blocked requests, caused timeouts).
    Now async via Celery. Also fixed wrong field: was reading brand_profile.display_name
    for influencer name. Kept the developer's cascade-delete signal for Campaign deletes.

  celery_service__celery_s__tasks.py
    → celery_service/celery_s/tasks.py
    WHAT CHANGED: send_email_task was an empty stub — now actually sends HTML emails.
    task_send_email_if_profile_not_complete fixed to use correct user_id parameter.

  celery_service__celery_s__email_templates.py   ← NEW FILE
    → celery_service/celery_s/email_templates.py
    All 11 email templates (welcome, verification, reset, proposal sent/accepted/rejected,
    campaign complete, match found, profile incomplete, unread reminder, subscription activated).

  celery_service__celery_s__automations.py
    → celery_service/celery_s/automations.py
    WHAT CHANGED: complete automation registry wiring all 11 events to their handlers.
    Includes matching fan-out task and all Celery beat tasks.

  celery_service__src__settings.py
    → celery_service/src/settings.py
    WHAT CHANGED: CELERY_BEAT_SCHEDULE was commented out — now enabled with all 6 beat tasks.

  base_email.html   ← NEW FILE
    → celery_service/templates/base_email.html
    Create the directory first: mkdir -p celery_service/templates

  user_service__authentication__matching.py   ← NEW FILE
    → user_service/authentication/matching.py
    The matching engine: niche/platform/follower scoring.

  user_service__authentication__matching_views.py   ← NEW FILE
    → user_service/authentication/matching_views.py
    Internal endpoint called by the Celery fan-out task.

  subscription_service__subscription__views.py
    → subscription_service/subscription/views.py
    WHAT CHANGED: Stripe webhook now dispatches SUBSCRIPTION_ACTIVATED automation event.

  user_service__authentication__views.py
    → user_service/authentication/views.py
    WHAT CHANGED: signup() now calls run_match_fanout.delay() after creating the user.


## BACKEND — manual additions (add lines to existing files, do NOT replace)

### 1. user_service/authentication/urls.py
Add these 2 lines inside urlpatterns = [...]:

    from . import matching_views
    # Add inside urlpatterns:
    path('run_matching/', matching_views.run_matching, name='run_matching'),
    path('platform_stats/', views.get_platform_stats, name='platform-stats'),


### 2. campaign_service/campaign/urls.py
Add this 1 line inside urlpatterns = [...]:

    path('pending_hires/', views.get_pending_hires, name='pending_hires'),

Then open campaign_service__pending_hires_addition.py from this folder.
Copy the get_pending_hires function at the bottom of campaign_service/campaign/views.py.


### 3. chat_service/chat/urls.py
Add this 1 line inside urlpatterns = [...]:

    path('unseen_notification_counts/', views.get_unseen_notification_counts),

Then open chat_service__unseen_counts_addition.py from this folder.
Copy the get_unseen_notification_counts function at the bottom of chat_service/chat/views.py.


## ENVIRONMENT — add to celery_service/.env

  # Email — use SendGrid, Postmark or AWS SES (NOT Gmail — it spam-filters)
  EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
  EMAIL_HOST=smtp.sendgrid.net
  EMAIL_PORT=587
  EMAIL_USE_TLS=True
  EMAIL_HOST_USER=apikey
  EMAIL_HOST_PASSWORD=<your SendGrid API key>
  SITE_BASE_URL=https://thesocialmarket.ai

  # Must match the JWT_SIGNING_KEY in user_service/.env
  JWT_SIGNING_KEY=<same value as user_service>

  REDIS_URL=redis://redis:6379/0
  SERVICES_SHARED_SECRET=<same value used by other services>


## NO NEW MIGRATIONS NEEDED.

## RESTART:
  docker compose restart user_service campaign_service subscription_service celery_service chat_service

## START CELERY BEAT (if not already in your docker-compose):
  docker compose exec celery_service celery -A src beat -l INFO

## VERIFY:
  □ Sign up a new user → welcome email arrives within 2 minutes
  □ Create a hire proposal → influencer receives proposal email
  □ Accept a proposal → brand receives acceptance email
  □ Check celery worker logs → should see "[email] sent 'PROPOSAL_RECEIVED_INFLUENCER' → user@email.com"
  □ Visit /admin/dashboard/ → activity log shows new events
  □ Beat schedule running: check celery beat logs show task names firing
