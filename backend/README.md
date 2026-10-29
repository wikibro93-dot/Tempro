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

## State warning

Inbox and account state is still held in in-memory Maps in `server.ts`. That is
fine for a single long-lived instance, but it is lost on restart or if the
service scales to more than one instance. The next production step is to move
that state to Redis (or a database) with expiry matching inbox expiry. Do not
claim this backend is restart-safe until that move is done.

## Deploy (later, not done yet)

Render, with root directory `backend/`, build `npm install`, start `npm start`.
A prepared `render.yaml` is at the repo root. Set `CORS_ORIGIN` to the real
frontend origin in Render, and set `VITE_API_BASE` in Vercel to the Render URL.
