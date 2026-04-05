# Phase 5 — Auth Hardening & Security Cleanup
# Deploy after Phase 4 is live and verified.

## IMMEDIATE — git cleanup (do this before anything else)

Run in your backend repo:
  git rm gateway_service/db.sqlite3
  echo "*.sqlite3" >> .gitignore
  git commit -m "security: remove committed database"
  git push

Run in your frontend repo:
  git rm "bkcoaching-main/--"
  git commit -m "cleanup: remove stray file"
  git push


## BACKEND — drop-in replacement

  (No full file replacements in Phase 5 — serializers already fixed in Phase 1+2)

Read these two guide files — they contain step-by-step instructions:

  phase5__bank_field_encryption_guide.py
    → Read this to encrypt bank account fields (account_number, routing_number, bank_name)
    → 4-step migration process, zero data loss
    → Do this AFTER everything else is stable

  phase5__cleanup_and_auth_unification.py
    → Read Section 1: list of dead code to delete
    → Read Section 4: budget_range variable bug fix in filter_influencers
    → Read Section 5: serializer double-check (already done in Phase 1+2)


## FRONTEND — drop-in replacements

The Phase 1+2 frontend package already contains the fully corrected:
  - useAuthStore.ts (no more duplicate Cookies.set)
  - AuthSessionSync.tsx (no more debug logs)
  - nextauth__route.ts (debug:false, field name fixed)
  - middleware.ts (correct catch block)

If you deployed Phase 1+2 correctly those are already in.

No additional frontend files needed for Phase 5.


## PACKAGE.JSON RENAME

Open package.json in the frontend repo.
Change line 2:
  "name": "bkcoaching",
To:
  "name": "the-social-market",

Save and commit.


## VERIFY:
  □ Visit /admin/ — confirm it loads without errors
  □ Make an API call to /user_service/get_user_info/ — confirm current_verification_code
    is NOT in the JSON response (was leaking OTP codes)
  □ Log in, open DevTools → Application → Cookies
    Confirm only next-auth.session-token cookie exists, NOT a manual access_token cookie
  □ Check browser console — no token values logged anywhere
  □ gateway db.sqlite3 no longer appears in git status
