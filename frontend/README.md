# TempMail Pro frontend

Static Vite + React frontend for TempMail Pro (https://tempmailpk.com).
It does NOT contain a backend: all mailbox calls go to the separate backend
service (Render) through `VITE_API_BASE`.

## Run locally

```bash
npm install
npm run dev        # Vite on http://localhost:5173, /api proxied to the backend
```

The backend runs separately on http://localhost:10000 by default
(see `../backend/README.md`).

## Build

```bash
npm run build      # generates PWA icons, static blog pages, sitemap/robots/RSS, then vite build
npm run preview    # vite preview on http://localhost:4173
```

## Environment

| Variable | Meaning |
| --- | --- |
| `VITE_API_BASE` | Backend origin, e.g. `http://localhost:10000` locally or the Render URL in production. No trailing slash, no `/api` suffix. |

In production on Vercel, `VITE_API_BASE` must be set to the Render backend URL.
If it is unset, the app falls back to same-origin `/api`, which does not exist
on a static Vercel deploy — the homepage hero will show a visible error instead
of silently failing.

## API contract

All frontend calls use the shared helper `src/utils/apiRoot.js` (`getApiRoot()`).
Do not hard-code `/api` in components: `npm run check` fails if a component
or util bypasses `apiRoot.js`.

## Privacy note (known limitation)

There is no sign-in. The Mail.tm inbox token is the only credential, and SSE
uses `EventSource`, which cannot send `Authorization` headers, so the token
stays in the SSE URL path. The app UI warns users to keep an inbox private
and never share it. `QRCodeModal` shares only the app address (`/app`), never
the token.

## Checks

```bash
npm run check      # contract checks: apiRoot usage, no dead /email/wait, error shapes
npm test           # node:test unit checks (apiRoot)
```

## Performance (cleanup, Oct 2026)

Measured on a fresh standalone build with `VITE_API_BASE=http://localhost:10000`
(not a live Lighthouse score — the new version is not live yet, so no CWV
claim is made here). Vite minify (esbuild) was already on; the savings below
come from removing dead code, not from adding minification.

| Metric | Before | After | Change |
| --- | --- | --- | --- |
| Total `dist` | 1,769,176 bytes | 1,751,374 bytes | −17,802 bytes (−1.0%) |
| Main CSS, raw | 86,222 bytes | 68,421 bytes | −17,801 bytes (−20.6%) |
| Main CSS, gzip | 16,427 bytes | 13,432 bytes | −2,995 bytes (−18.2%) |
| Main JS, raw / gzip | 88,351 / 27,449 bytes | 88,350 / 27,450 bytes | unchanged |
| Fonts (8 Poppins files) | 75,404 bytes | 75,404 bytes | unchanged, kept deliberately |
| Static blog pages / sitemap / RSS | 36 / 42 URLs / 36 items | 36 / 42 URLs / 36 items | unchanged |
| PWA precache | 79 entries | 79 entries | unchanged |

What changed:
- `src/index.css`: 118,608 → 94,849 bytes. Removed only rules whose selectors
  appear nowhere in JSX/JS/HTML: old inbox-modal and inbox-meta blocks, the
  TOC sidebar, the old blog-list/blog-link/blog-icon block, the app-preview
  mockup inner rules (the live `.app-preview-section` itself is kept), the old
  AccountManager `am-*` block (the live `am-compact-card` / `am-address-strip`
  in AccountManager.jsx are kept), old landing-hero actions/grid buttons,
  old Yesim banner/hero variants (the live `yesim-card` rules are kept),
  and duplicate/global-loading/text-expired/renew-button rules. Defensive
  rules were kept: `.email-html-content` (sanitised email HTML), Bootstrap
  utility overrides, and state classes that can be built dynamically.
- Dead dependencies removed from `package.json` (lock entries 704 → 700):
  `bootstrap`, `@fortawesome/fontawesome-free`, `bootstrap-icons`, plus
  transitive `@popperjs/core`. No src file imported any of them — Bootstrap
  classes come from the single CDN link in `index.html`, and icons are
  rendered via `lucide-react` in `AppIcon.jsx`. These packages were never
  bundled, so removing them saves install/lock size, not runtime download;
  the runtime saving is the CSS above. `src/components/BlogList.css` and
  `BlogPost.css` are likewise not imported by any component and are not in
  the build output; they are left in the repo in this pass because the
  batched push cannot delete files, and deleting them is a repo-only cleanup.
- Fonts kept: Poppins 400 / 400-italic / 600 / 700. The italic file is used
  by blog blockquotes (`font-style: italic` in index.css), so removing it
  would only trade true italics for synthesised obliques for ~20 KB.
- Monetag kept and already deferred: `index.html` loads it only after
  window load / `requestIdleCallback`, with `async=true`; no direct
  render-blocking `<script src>` for it exists. PromoCard shows only after
  a 7s timer (never on first paint), is dismissible with a 44px close
  button, and is now capped at 40vh on ≤576px screens so it cannot cover
  the whole viewport.

Guardrail: `npm run check:perf` (`scripts/check-performance.js`) fails if a
dead dependency or dead CSS block reappears, if Bootstrap gains a second
source, if Monetag stops being deferred, or if `src/index.css` exceeds
110,000 bytes.

Remaining for a later pass (not done here, would change UI/UX): a single
icon library instead of Lucide-mapped FA/BI names, dropping the Bootstrap
CDN in favour of Tailwind-only utilities, font `woff` (non-woff2) fallback
removal, and a live Lighthouse/Core Web Vitals run after deploy.
