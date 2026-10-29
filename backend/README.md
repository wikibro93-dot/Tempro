# TempMail Pro backend

Long-lived Express service for TempMail Pro. It owns Mail.tm account creation,
inbox polling, SSE streaming, and token-based inbox tracking.

It does NOT serve the frontend. The frontend is a separate static service
(`frontend/`, deployed to Vercel).

## Run locally

```bash
npm install
npm run dev
```

Health check: `GET http://localhost:10000/health`

## Environment

See `.env.example`. `CORS_ORIGIN` is a comma-separated allowlist. Do not set it
to `*` in production.

## State

Main flows are stateless: inbox, batch, SSE, content, attachment, download
and delete all use the Mail.tm token supplied by the client, so a backend
restart or a second instance does not lose mail. The former
`GET /api/email/wait` endpoint and its in-memory `accountCredentials` Map
(which stored plaintext Mail.tm passwords) were removed because no frontend
code called it. Do not reintroduce server-side password storage.

## API error contract

| Case | Response |
| --- | --- |
| Mail.tm domains unavailable (domains / create) | `502 { error, }` |
| User-chosen domain no longer live | `400 { error, availableDomains }` — the backend never silently switches domains |
| Old `mock_` token | `401` on inbox/content/delete, `EXPIRED` on batch/SSE |
| Inbox upstream failure (non-401) | `502 { error, code: 'UPSTREAM_ERROR' }` — never an empty `[]` |
| Delete upstream failure | `502 { success: false, code: 'UPSTREAM_ERROR' }` — never `success: true` |
| CORS rejection | `403 { error, code: 'CORS_FORBIDDEN' }` as JSON, not an HTML 500 page |
| Rate limit exceeded | `429 { error, code: 'RATE_LIMITED' }` |

## Rate limits (per IP, in-memory, first layer only)

Create 10/hour, batch 30/minute, inbox reads 60/minute, SSE 20 concurrent
per IP (200 global). Batch is capped at 20 tokens. Add Cloudflare rate
limiting as a second layer in production. CORS is not an abuse control.

## Endpoints

`GET /health` is liveness only. `GET /ready` does a cheap Mail.tm `/domains`
check and returns 503 when Mail.tm is down — use `/ready` for uptime checks.

## Checks

```bash
npm run check      # runs the shared contract checks in ../frontend/scripts/check-contracts.js
```

## Known limitation

SSE tokens stay in the URL path because `EventSource` cannot send
`Authorization` headers. The frontend warns users to keep an inbox private.
Do not log token-bearing URLs.

## Deploy (later, not done yet)

Render, with root directory `backend/`, build `npm install`, start `npm start`.
A prepared `render.yaml` is at the repo root. Set `CORS_ORIGIN` to the real
frontend origin in Render, and set `VITE_API_BASE` in Vercel to the Render URL.
