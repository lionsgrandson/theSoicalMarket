# Phase 7 — UX & Product Gaps
# Deploy after Phase 6. Mix of frontend and backend.
# Deploy backend first, then frontend.


## What this adds
- Notification bell WebSocket reconnected (was commented out — no real-time notifications)
- WebSocket now uses env var instead of hardcoded expired tunnel URL
- All debug logs removed from dashboard header
- EmptyState component: shows a friendly message with a CTA when lists are empty
- ErrorBoundary component: stops one broken component from crashing the whole page
- Brand can now rate the influencer AND influencer can now rate the brand (was one-sided)
- Bookmark/save influencers (was missing — Bookmark icon existed but did nothing)
- Campaign performance stats endpoint (proposals sent, acceptance rate, total spend)
- Platform stats endpoint (live user counts for homepage social proof section)


## PART A — BACKEND (deploy first)

### Files to ADD functions to (do not replace the whole file):

  campaign_service__campaign__views_additions.py
    → Open this file. It contains 2 functions: give_brand_rating and get_campaign_performance.
    → Copy both functions to the BOTTOM of campaign_service/campaign/views.py
    → Then add these 2 lines to campaign_service/campaign/urls.py inside urlpatterns:
        path('give_brand_rating/<int:offer_id>/', views.give_brand_rating),
        path('campaign_performance/<int:campaign_id>/', views.get_campaign_performance),

  user_service__authentication__views_additions.py
    → Open this file. It contains instructions for 3 things:
      STEP 1: Add the SavedInfluencer model to user_service/authentication/models.py
              (copy the NEW_MODEL block from this file)
      STEP 2: Add 4 URL lines to user_service/authentication/urls.py
              (copy the URLS_TO_ADD block from this file)
      STEP 3: Copy the 4 functions in VIEWS_TO_ADD to the bottom of
              user_service/authentication/views.py


### Migration required (one-time):
After adding the SavedInfluencer model and the brand_rating field:
  docker compose exec user_service python manage.py makemigrations authentication
  docker compose exec user_service python manage.py migrate
  docker compose exec campaign_service python manage.py makemigrations campaign
  docker compose exec campaign_service python manage.py migrate

Also add brand_rating field to campaign_service/campaign/models.py Hire class:
  brand_rating = models.FloatField(null=True, blank=True)


### Restart backend:
  docker compose restart user_service campaign_service


## PART B — FRONTEND (deploy after backend)

### Full replacement files:

  DashboardTopHeader.jsx
    → components/dashboard/DashboardTopHeader.jsx
    CHANGES: All debug logs removed. WebSocket connection uncommented and
    fixed to use NEXT_PUBLIC_WS_URL env var. Cookies import removed.
    Notification bell works with real-time WebSocket updates.

  EmptyState.tsx
    → components/EmptyState.tsx   ← NEW FILE
    Usage example (add to any dashboard page that shows a list):
      import EmptyState from "@/components/EmptyState";
      // Inside your JSX where the list would be:
      {campaigns.length === 0 && (
        <EmptyState
          icon="📋"
          title="No campaigns yet"
          description="Create your first campaign to start connecting with influencers."
          ctaLabel="Create campaign"
          ctaHref="/brand-dashboard/campaigns/new"
        />
      )}

  ErrorBoundary.tsx
    → components/ErrorBoundary.tsx   ← NEW FILE
    Usage example (wrap any component that makes API calls):
      import ErrorBoundary from "@/components/ErrorBoundary";
      <ErrorBoundary>
        <CampaignsSection />
      </ErrorBoundary>


### Rebuild frontend:
  npm run build && npm start


## VERIFY
  □ Dashboard header loads with no debug logs
  □ Notification bell shows badge when there are unseen notifications
  □ Clicking the bell opens the dropdown; notifications show correctly
  □ "Mark all read" clears the badge
  □ If you break a component intentionally, ErrorBoundary shows the fallback
    instead of a white page
  □ GET /campaign_performance/1/ returns stats JSON (test in browser or Postman)
  □ POST /save_influencer/123/ saves the influencer (returns 201)
  □ GET /get_saved_influencers/ returns the saved list
