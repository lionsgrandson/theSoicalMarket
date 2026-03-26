# Phase 3 — Admin Dashboard + Campaign Admin
# Deploy after Phase 1+2 is live and verified.

## BACKEND — copy these files

  campaign_service__campaign__admin.py
    → campaign_service/campaign/admin.py

  user_service__authentication__admin.py
    → user_service/authentication/admin.py

  admin_template__dashboard.html
    → user_service/templates/admin/dashboard.html
    *** Create the directory first if it doesn't exist:
        mkdir -p user_service/templates/admin


## AFTER COPYING — 2 steps required

### Step 1: Wire the custom admin site into user_service URLs

Open user_service/src/urls.py and replace:
  from django.contrib import admin
  urlpatterns = [path('admin/', admin.site.urls), ...]

With:
  from authentication.admin import admin_site
  urlpatterns = [path('admin/', admin_site.urls), ...]


### Step 2: Add templates dir to user_service settings (if not already there)

In user_service/src/settings.py, in the TEMPLATES list, change:
  'DIRS': [],
To:
  'DIRS': [BASE_DIR / 'templates'],


## NO MIGRATIONS NEEDED.

## RESTART:
  docker compose restart user_service campaign_service

## VERIFY:
  □ /admin/ shows "The Social Market Admin" in the header
  □ /admin/dashboard/ shows user counts, proposal funnel, activity log
  □ /admin/campaign/campaign/ lists all campaigns (was empty before)
  □ /admin/campaign/hire/ lists all proposals with status filters
  □ /admin/authentication/log/ shows activity feed
