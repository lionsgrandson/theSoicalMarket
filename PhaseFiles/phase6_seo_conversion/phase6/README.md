# Phase 6 — SEO & Conversion
# Deploy after Phase 5. Pure frontend — no backend work, no migrations.

## What this fixes
- Zero SEO: Google could not index any page. Now every public page
  has a proper title, description and Open Graph tags.
- sitemap.xml missing: Google did not know what pages existed.
- robots.txt missing: no crawl guidance for search engines.
- The public influencer/brand browse pages were behind a blur paywall —
  visitors could not evaluate the platform before signing up.
- FAQ was commented out on the homepage since launch.
- A debug plan log was writing plan data to the server on every page load.
- Pricing section had a debug log leaking user data.


## FILE NAMING CONVENTION

Files with __ in the name use double-underscore as a path separator.
Replace __ with / to find the destination.

  app__page.tsx                          →  app/page.tsx
  app__microinfluencers__page.tsx        →  app/microinfluencers/page.tsx
  app__brands__page.tsx                  →  app/brands/page.tsx

Files without __ go exactly where named:
  sitemap.ts  →  app/sitemap.ts       (NEW FILE)
  robots.ts   →  app/robots.ts        (NEW FILE)

Files starting with PATCH__ are instructions — read and apply, do not copy.


## FULL REPLACEMENT FILES (overwrite the existing file)

  sitemap.ts
    → app/sitemap.ts   ← NEW FILE — create this, it does not exist yet

  robots.ts
    → app/robots.ts    ← NEW FILE — create this, it does not exist yet

  app__page.tsx
    → app/page.tsx
    CHANGES: FAQ uncommented, metadata added, debug log removed

  app__microinfluencers__page.tsx
    → app/microinfluencers/page.tsx
    CHANGES: converted to server component (Google can now index it),
    paywall blur removed, metadata added, proper empty state

  app__brands__page.tsx
    → app/brands/page.tsx
    CHANGES: metadata added, debug log removed
    (data fetching logic is identical to before)


## PATCH FILES (find-and-replace instructions)

  PATCH__app__microinfluencers__id__page.tsx
    → Open app/microinfluencers/[id]/page.tsx
    → Copy the generateMetadata function shown in the file
    → Paste it at the TOP of your existing page, after the imports,
      before the component. Remove the /* */ comment markers.
    → That's the only change needed.

  PATCH__components__pricing_section.tsx
    → Two changes:
      1. Remove the debug logging line from the fetchUser function
         (find the line that logs `res.data` in the file)
      2. Add "Most Popular" badge to the middle plan — follow the
         instructions and code snippet in the PATCH file.


## NO MIGRATIONS. NO SERVICE RESTARTS.
Just rebuild the frontend:
  npm run build && npm start
  (or push to Vercel/Netlify and it deploys automatically)


## VERIFY
  □ Go to https://thesocialmarket.ai/sitemap.xml — should show a list of URLs
  □ Go to https://thesocialmarket.ai/robots.txt — should show allow/disallow rules
  □ Go to /microinfluencers — should load without any blur or login wall
  □ View source on the homepage — should see <title> and <meta description> tags
  □ Google the site name — the search result should now show the correct title
  □ Open browser console — no data logged from the homepage or pricing section
