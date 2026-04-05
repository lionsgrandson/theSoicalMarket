## Phase 5: Auth Hardening and Security Cleanup

| Test item                | Expected result                                              | Result | Evidence | Notes |
| ------------------------ | ------------------------------------------------------------ | ------ | -------- | ----- |
| Admin page loads         | `/admin/` opens without errors                               |        |          |       |
| Console security check   | Browser console does not log tokens or sensitive auth values |        |          |       |
| Git cleanup verification | `gateway_service/db.sqlite3` no longer appears in git status |        |          |       |
| Frontend package rename  | Frontend `package.json` name is `the-social-market`          |        |          |       |

## Phase 6: SEO and Conversion

| Test item                | Expected result                                                | Result | Evidence | Notes |
| ------------------------ | -------------------------------------------------------------- | ------ | -------- | ----- |
| Sitemap works            | `https://thesocialmarket.ai/sitemap.xml` shows valid site URLs |        |          |       |
| Robots file works        | `https://thesocialmarket.ai/robots.txt` shows crawl rules      |        |          |       |
| Homepage metadata        | View source shows `<title>` and meta description tags          |        |          |       |
| Homepage console cleanup | No homepage data is logged in browser console                  |        |          |       |

## Phase 7: UX and Product Gaps

| Test item                     | Expected result                                              | Result | Evidence | Notes |
| ----------------------------- | ------------------------------------------------------------ | ------ | -------- | ----- |
| Dashboard header cleanup      | Dashboard header loads without console logs                  |        |          |       |
| Notification badge            | Bell shows unseen notification count                         |        |          |       |
| Notification dropdown         | Clicking the bell opens the dropdown and shows notifications |        |          |       |
| Mark all read                 | "Mark all read" clears the badge                             |        |          |       |
| Campaign performance endpoint | `GET /campaign_performance/1/` returns stats JSON            |        |          |       |
| Save influencer endpoint      | `POST /save_influencer/123/` returns `201`                   |        |          |       |
| Saved influencers endpoint    | `GET /get_saved_influencers/` returns saved influencers list |        |          |       |
| Brand rating support          | Brand can submit a rating for an influencer                  |        |          |       |
| Influencer rating support     | Influencer can submit a rating for a brand                   |        |          |       |
