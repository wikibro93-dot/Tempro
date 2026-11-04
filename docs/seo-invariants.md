# TempMail Pro — SEO invariants

Rules for any human or AI edit to this repo. These exist because the SEO
elements below are load-bearing: changing them "to tidy up" has broken
rankings in the past. Do NOT change any of them without asking first, and
after any change, re-run `npm run build` in `frontend/` (which runs the
contract checks) and re-verify the live URLs below.

## 1. Canonical URLs — one per route, never self-referential on 404

- Canonicals are set per route in `frontend/src/components/RouteSeoManager.jsx`
  against the single base `https://tempmailpk.com`.
- Core routes: `/`, `/app`, `/blog`, `/about`, `/privacy`, `/privacy-stack`.
- Blog posts: `/blog/<slug>` — canonical built from the slug.
- **A 404 page must have NO canonical.** Never point a 404 at the homepage
  canonical; that turns a real 404 into a soft 404.
- Do not "fix" a canonical to point at the page itself when it deliberately
  points elsewhere (see the redirect rules).

## 2. Redirects — permanent, and only these

In `frontend/vercel.json` (verified by the contract checks):

- `/blog/pst-net-premium-virtual-cards-free-trials-ads` → `/privacy-stack`
  (permanent). The partner post no longer exists as its own page.
- `/blog/cashmaal-virtual-visa-cards-online-privacy` → `/privacy-stack`
  (permanent). Same reason.
- Host-based: `tempmailpk.vercel.app` → `https://tempmailpk.com/$1`
  (permanent), `www.tempmailpk.com` → apex (permanent).
- **HELD, NOT LIVE:** the `tempro-i1it.vercel.app` → `https://tempmailpk.com/$1`
  redirect must NOT be in `frontend/vercel.json` before switch day. It lives
  only in `docs/switch-day-redirect-snippet.txt` (repo root, never deployed).
  Add it to vercel.json ONLY on switch day, after `tempmailpk.com` is
  connected to the new Vercel project. WARNING from 4 Nov 2026: pushing
  vercel.json for an unrelated fix (the /contact rewrite, commit d769548)
  accidentally carried this redirect live, and every staging URL 308'd to
  the old live site until it was reverted the same day. Never push
  vercel.json without diffing its redirects list first.
- **Rewrites parity:** every React route in `App.jsx` MUST have a matching
  rewrite in `vercel.json` (to `/index.html`, except `/blog/:slug` which
  maps to its static page). The client route alone is not enough — without
  the rewrite, Vercel's catch-all sends the path to `/api/not-found` and
  the page 404s live even though it works in dev. This bit us with
  `/contact` in Nov 2026. The contract checks now enforce this parity.

## 3. Sitemap, RSS, llms.txt — generated, never hand-edited

- `frontend/scripts/generate-sitemap.js`, `generate-rss.js`, and
  `generate-llms.js` run during the build. The live counts are: sitemap 59
  URLs (9 core + 50 articles), RSS 50 items, llms.txt 50 blog links + 8 core
  pages.
- Never hand-edit `public/sitemap.xml`, `public/rss.xml`, or `public/llms.txt`
  — the next build overwrites them. Fix the generator or the article data
  (`frontend/src/data/articlesData.js`) instead.
- When a page is genuinely added, removed, or changed, update its `lastmod`
  only for that page. Do not refresh every lastmod on every deploy.

## 4. Schema — only facts that are true and visible on the page

- Organization schema: NO `sameAs` social profiles. The Facebook Page and
  `@tempmailpk` on X do not exist and were removed in commit 424d1d5. Add
  them back ONLY with exact real URLs if those pages are ever created.
- SoftwareApplication: free service, price 0. No paid tier exists.
- FAQPage schema (in `FAQSection.jsx`) must be built from the exact FAQs
  rendered on the page — never invent, reword, or add questions that are not
  visibly answered there.
- No business hours, no street address, no company location, no LocalBusiness
  type. TempMail Pro is an online-only free tool; inventing a location (for
  example a US address for targeting) is forbidden. US targeting is done
  through genuine content (US signup/trial examples, US English), never
  through a fake address or doorway page.

## 5. robots.txt — crawler access is deliberate

- Googlebot and Google-Extended / GPTBot / ClaudeBot / PerplexityBot /
  Applebot are explicitly allowed on `/`, `/app`, `/blog`, `/llms.txt`,
  `/sitemap.xml`, and `/rss.xml`.
- `/api/inbox/*` (content, stream, attachment) is disallowed — private inbox
  data must never be crawled or indexed.
- AI crawlers are pointed at `/llms.txt`. If llms.txt ever stops listing
  the articles, that is a bug, not a cleanup.

## 6. Rendering — what crawlers actually see

- The homepage and `/app` are client-rendered React: their content is NOT in
  the initial HTML (empty `<div id="root">`). Blog articles ARE in the
  initial HTML because the build generates static pages for them.
- Do not "fix" this by moving blog content into client rendering, and do not
  claim a page is crawler-visible because it looks right in Inspect — check
  View Page Source (or `curl`) instead.
- Build-time prerendering of `/`, `/app`, and the core pages is a planned
  post-launch improvement, not a pre-launch change.

## 7. Copy honesty — no unsourced claims, anywhere

- Never reintroduce: an unsourced phishing percentage, "impenetrable
  shield", "Total Privacy", "zero digital footprints", or "100% spam
  quarantine". These were softened to honest wording (a buffer, everyday
  privacy, messages gone after expiry) and the site's own guide says temp
  mail is NOT a complete anonymity system — sites can still collect IP,
  browser, and device signals. Keep marketing copy consistent with that.
- Keyword repetition is already noticeable ("temporary email" ~52× on the
  homepage). Do not add more keyword-dense paragraphs to chase a term.

## 8. Contact — form, not a mailbox

- The site has no working support mailbox. The old Hostinger professional
  email was never activated for tempmailpk.com, so `support@tempmailpk.com`
  must NOT be listed anywhere (footer, schema, or copy) — users writing to
  it would write into a void.
- Contact goes through `/contact`, which posts to Web3Forms (free
  form-to-email) and is delivered to wikibro93@gmail.com with the visitor's
  address as Reply-To. The Web3Forms access key is public by design and
  lives in `frontend/src/components/Contact.jsx` — it is an alias for the
  destination inbox, not a secret, so do not "protect" it by moving it
  somewhere the browser cannot read it (that would break the form).
- The sitemap count in section 3 already includes `/contact`, `/terms`, and `/dmca`.

## 9. After every change

1. `npm run build` in `frontend/` (contract checks included).
2. Confirm the sitemap still parses with 59 URLs (or the new correct count
   after a genuine article add/remove).
3. Spot-check one live route's canonical and one redirect after deploy.
4. After the domain switch, re-check Search Console's Page Indexing report
   for 5xx/403 errors and its Security Issues report.
