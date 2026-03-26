# Phase 1 & 2 — Security Fixes + Login Loop + Chat Fix
# Deploy this first. Everything else depends on it.

## BEFORE YOU START — do these 3 things now

### 1. Rotate the ImgBB API key (it was in git)
Go to https://imgbb.com → Account → API → generate a new key.
Save it — you'll add it to .env in a moment.

### 2. Generate a new Django SECRET_KEY for user_service
Run this once:
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
Save the output.

### 3. Add to user_service/.env:
  SECRET_KEY=<paste the key you just generated>
  DEBUG=False
  IMGBB_API_KEY=<your new imgbb key>

### 4. Add to campaign_service/.env:
  IMGBB_API_KEY=<your new imgbb key>

### 5. Add to your frontend .env.local:
  NEXT_PUBLIC_WS_URL=wss://backend.thesocialmarket.ai
  (replace with your actual WebSocket domain — NOT a tunnel URL)


---

## BACKEND — copy these files

  gateway_service__config.json
    → gateway_service/config.json

  user_service__src__settings.py
    → user_service/src/settings.py

  user_service__authentication__serializers.py
    → user_service/authentication/serializers.py

  PATCH__subscription_service__subscription__models.py
    → OPEN subscription_service/subscription/models.py
    → Find FIND_1, replace with REPLACE_1 (one line change in __str__)

  PATCH__campaign_service__campaign__models.py
    → OPEN campaign_service/campaign/models.py
    → Find FIND_1, replace with REPLACE_1 (ImgBB key from env)

  PATCH__campaign_service__campaign__views.py
    → OPEN campaign_service/campaign/views.py
    → Apply all 4 patches in order (update_a_campaign, accept_offer, reject_offer, get_my_previous)

  PATCH__user_service__authentication__views.py
    → OPEN user_service/authentication/views.py
    → Apply all 4 patches in order (reset_password, featured filters x2, create_log NameError)

  PATCH__chat_service__chat__views.py
    → OPEN chat_service/chat/views.py
    → Apply the 1 patch (get_unread_message returns real counts)


## FRONTEND — copy these files

  middleware.ts
    → middleware.ts  ← PROJECT ROOT (same folder as package.json)
    *** This file must be at the root, NOT inside app/ ***

  apiClient.ts
    → lib/apiClient.ts

  useAuthStore.ts
    → stores/useAuthStore.ts

  useChatRoom.ts
    → hooks/useChatRoom.ts

  AuthSessionSync.tsx
    → components/AuthSessionSync.tsx

  nextauth__route.ts
    → app/api/auth/[...nextauth]/route.ts
    (rename from nextauth__route.ts to route.ts when copying)

  PATCH__login_and_dashboard.py
    → READ this file, then:
       a) In app/auth/login/LoginPage.tsx: delete the import line shown as FIND_A
       b) In app/home_dashboard/page.tsx: delete all 5 console.log lines listed


## NO MIGRATIONS NEEDED for Phase 1+2.

## RESTART after copying:
  docker compose restart user_service campaign_service chat_service subscription_service
  npm run build && npm start  (or redeploy frontend)

## VERIFY:
  □ Login works without bouncing between pages
  □ Browser console has no JWT token values printed
  □ Chat loads (not pointing at expired ngrok/Cloudflare URLs)
  □ Django admin /admin/subscription/subscription/ loads without crash
  □ Password reset: OTP must be correct BEFORE password changes
  □ /admin/authentication/userprofile/ — current_verification_code NOT in API response
