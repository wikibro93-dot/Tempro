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
