import express from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';
import dns from 'node:dns/promises';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';

const PORT = Number(process.env.PORT) || 10000;
const MAIL_TM_API_BASE = (process.env.MAIL_TM_API_BASE || 'https://api.mail.tm').replace(/\/+$/, '');
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,https://tempmailpk.com,https://www.tempmailpk.com')
  .split(',').map((o) => o.trim()).filter(Boolean);

const app = express();
// Trust Render's first proxy so req.ip is the real client IP (from
// X-Forwarded-For) instead of Render's router IP. Without this, the
// per-IP rate limiters and the SSE per-IP cap are effectively global.
app.set('trust proxy', 1);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
// Global JSON parser (10kb), but skip the Postmark inbound webhook — it has
// its own larger (10mb) parser because inbound emails can be megabytes —
// and the Creem webhook, which needs the raw body to verify its HMAC
// signature (parsing it first would destroy the bytes the signature covers).
app.use((req: any, res: any, next: any) => {
  if (req.path && (req.path.startsWith('/api/inbound/postmark/') || req.path.startsWith('/api/webhooks/creem'))) return next();
  return express.json({ limit: '10kb' })(req, res, next);
});

// Minimal Helmet-like security headers for API responses (no new dependency).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});

// Simple in-memory per-IP rate limiting (no new dependency). This is a
// first layer only; Cloudflare rate limiting should be added as a second
// layer in production. Entries expire with their window; no IP is logged.
function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now >= entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests, please try again later.', code: 'RATE_LIMITED' });
    }
    return next();
  };
}
const createLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }); // create 10/hour/IP
const batchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 }); // batch 30/min/IP
const inboxLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 }); // inbox reads 60/min/IP
const fileLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 }); // attachment/download 30/min/IP
const deleteLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 }); // message delete 30/min/IP (tighter than inbox reads)
const accountDeleteLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30 }); // account delete 30/hour/IP (was 10: legitimate retry loops hit it)
const premiumLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 }); // premium key/domain/dns 30/min/IP

// Per-token limiter: same shape as rateLimit, but keyed by the inbox token
// in the URL so rotating IPs cannot dodge the cap for one inbox.
function rateLimitByToken({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: any, res: any, next: any) => {
    const token = String(req.params?.token || '');
    if (!token) return next();
    const now = Date.now();
    const entry = hits.get(token);
    if (!entry || now >= entry.resetAt) {
      hits.set(token, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests, please try again later.', code: 'RATE_LIMITED' });
    }
    return next();
  };
}
const messageDeleteTokenLimiter = rateLimitByToken({ windowMs: 60 * 60 * 1000, max: 100 }); // 100 message deletes/hour/token
const accountDeleteTokenLimiter = rateLimitByToken({ windowMs: 60 * 60 * 1000, max: 20 }); // 20 account deletes/hour/token (was 5: a user retrying a failing delete hit 429 on the 6th click)

// Maximum proxied file size. Known oversize (Content-Length header) is
// rejected with 413 before any body is read; unknown-length bodies are
// streamed and aborted once they pass this cap (headers are already sent
// by then, so a clean 413 is impossible mid-stream).
const MAX_PROXIED_BYTES = 25 * 1024 * 1024;

// Stream an upstream response to the client without buffering it whole in
// memory. Returns false if the stream was aborted for exceeding the cap.
async function streamUpstream(res: any, upstream: any): Promise<boolean> {
  if (!upstream.body) return false;
  const stream = Readable.fromWeb(upstream.body as any);
  let total = 0;
  try {
    for await (const chunk of stream as any) {
      total += chunk.length;
      if (total > MAX_PROXIED_BYTES) {
        res.destroy();
        return false;
      }
      if (!res.write(chunk)) {
        await new Promise((resolve) => res.once('drain', resolve));
      }
    }
    res.end();
    return true;
  } catch {
    if (!res.destroyed) res.destroy();
    return false;
  }
}
const sseByIp = new Map<string, number>();
const SSE_PER_IP_MAX = 20;
const SSE_GLOBAL_MAX = 200;

// Domain cache (Phase A, Nov 2026): Mail.tm's domain pool changes rarely,
// but every /domains, /ready and account-create call used to hit it live, so
// a transient upstream spike left the domain dropdown empty. Cache for
// 15 minutes and serve the stale list when a refresh fails, instead of [].
// In-memory only: on a free-Render spin-down/restart the cache simply
// rebuilds on the next request. Callers must treat the result as a copy.
const DOMAIN_CACHE_TTL_MS = 15 * 60 * 1000;
let domainCache: { domains: string[]; fetchedAt: number } = { domains: [], fetchedAt: 0 };

async function getLiveDomains(): Promise<string[]> {
  const now = Date.now();
  if (domainCache.domains.length > 0 && now - domainCache.fetchedAt < DOMAIN_CACHE_TTL_MS) {
    return [...domainCache.domains];
  }
  try {
    const res = await fetch(`${MAIL_TM_API_BASE}/domains`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      const members = data['hydra:member'] || data;
      if (Array.isArray(members) && members.length > 0) {
        const live = members
          .filter((d: any) => d.isActive !== false && d.domain)
          .map((d: any) => d.domain);
        if (live.length > 0) {
          domainCache = { domains: live, fetchedAt: now };
          return [...live];
        }
      }
    }
  } catch (err: any) {
    console.warn('[Backend] Could not fetch live Mail.tm domains:', err.message);
  }
  // Refresh failed: serve the stale cached list (if any) rather than an
  // empty dropdown, so the app keeps working through transient outages.
  return [...domainCache.domains];
}

// Health check endpoint (liveness only — does not check Mail.tm)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Temp Mail Pro Unified Backend'
  });
});

// Readiness endpoint: cheap Mail.tm /domains check. 503 when Mail.tm is down.
app.get('/ready', async (req, res) => {
  const domains = await getLiveDomains();
  if (domains.length === 0) {
    return res.status(503).json({ status: 'not_ready', error: 'Mail.tm domains unavailable' });
  }
  res.json({ status: 'ready', domains: domains.length, timestamp: new Date().toISOString() });
});

// Domain listing endpoint
app.get('/api/accounts/domains', async (req, res) => {
  const domains = await getLiveDomains();
  if (domains.length === 0) {
    return res.status(502).json({ success: false, error: 'Mail.tm domains unavailable, please try again.' });
  }
  res.json({ success: true, domains });
});

// Mailbox creation endpoint
app.post('/api/accounts/create', createLimiter, async (req, res) => {
  const { username: rawUsername, domain: requestedDomain } = req.body || {};
  const liveDomains = await getLiveDomains();
  if (liveDomains.length === 0) {
    return res.status(502).json({ error: 'Mail.tm domains unavailable, please try again.' });
  }
  // Flexible domains: Mail.tm changes its domain list. Never silently switch
  // a user-chosen domain to another one — that would be misleading.
  // If the user chose a domain, use it exactly or fail honestly with the
  // current live list so the UI can update. Only when no domain was chosen
  // (auto-generate) may the backend pick the first live domain.
  let domain: string;
  if (requestedDomain) {
    if (!liveDomains.includes(requestedDomain)) {
      return res.status(400).json({
        error: 'Selected domain is no longer available on Mail.tm. Please choose a current domain.',
        availableDomains: liveDomains
      });
    }
    domain = requestedDomain;
  } else {
    domain = liveDomains[0];
  }

  const baseUsername = rawUsername
    ? String(rawUsername).toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24)
    : ('user' + Math.random().toString(36).slice(2, 8));

  // Try creating a real live Mail.tm account, retrying with unique suffix if name collision occurs
  for (let attempt = 0; attempt < 3; attempt++) {
    const username = attempt === 0
      ? baseUsername
      : `${baseUsername}${Math.random().toString(36).slice(2, 6)}`;
    const address = `${username}@${domain}`;
    const password = `Tmp_${Math.random().toString(36).slice(2, 10)}!1Aa`;

    try {
      const createRes = await fetch(`${MAIL_TM_API_BASE}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ address, password }),
        signal: AbortSignal.timeout(7000)
      });

      if (createRes.ok) {
        // Authenticate to get live JWT token
        const tokenRes = await fetch(`${MAIL_TM_API_BASE}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ address, password }),
          signal: AbortSignal.timeout(7000)
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();

          return res.json({
            address,
            email: address,
            token: tokenData.token,
            id: tokenData.id,
            domain,
            isLive: true,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.warn(`[Backend] Mail.tm attempt ${attempt + 1} failed:`, err.message);
    }
  }

  // Production rule: never issue a mock/fake mailbox. If Mail.tm did not create
  // a real account, fail honestly so the user retries instead of using an
  // address that can never receive mail.
  return res.status(502).json({ error: 'Could not create a real Mail.tm account, please try again.', isLive: false });
});

// Inbox message list endpoint
app.get('/api/inbox/:token', inboxLimiter, async (req, res) => {
  const token = req.params.token;

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(400).json({ error: 'Missing or invalid inbox token. Please create a new email address.', code: 'INVALID_TOKEN' });
  }

  // Old mock_ tokens from the upgrade period are not real Mail.tm accounts.
  if (token.startsWith('mock_')) {
    return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
  }

  try {
    const tmRes = await fetch(`${MAIL_TM_API_BASE}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (tmRes.ok) {
      const data = await tmRes.json();
      const rawMessages = data['hydra:member'] || data || [];
      const formatted = rawMessages.map((m: any) => ({
        id: m.id,
        token,
        from: m.from,
        to: m.to,
        subject: m.subject || '(No Subject)',
        intro: m.intro || '',
        text: m.text || '',
        html: m.html || '',
        hasAttachments: Boolean(m.hasAttachments),
        size: m.size || 0,
        createdAt: m.createdAt || m.updatedAt || new Date().toISOString()
      }));
      return res.json(formatted);
    }

    if (tmRes.status === 401 || tmRes.status === 403) {
      return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
    }
  } catch (err: any) {
    console.warn('[Backend] Inbox fetch error:', err.message);
  }

  // Honest error: a non-401 upstream failure is NOT an empty inbox.
  return res.status(502).json({ error: 'Mail.tm inbox unavailable, please try again.', code: 'UPSTREAM_ERROR' });
});

// High-concurrency Batch Processing Layer for multiple inboxes
app.post('/api/inbox/batch', batchLimiter, async (req, res) => {
  const { tokens } = req.body || {};
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'Tokens array is required' });
  }

  // Safety cap to prevent memory exhaustion
  const sanitizedTokens = tokens
    .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
    .slice(0, 20); // batch cap: 20 tokens, not 150

  const results: Record<string, any> = {};
  const CONCURRENCY_LIMIT = 8; // Process 8 inboxes concurrently in bounded chunks

  const fetchSingleInbox = async (token: string) => {
    // Old mock_ tokens are expired, not real Mail.tm accounts.
    if (token.startsWith('mock_')) {
      return { success: false, error: 'EXPIRED', count: 0, messages: [] };
    }

    // 2. Mail.tm check
    try {
      const tmRes = await fetch(`${MAIL_TM_API_BASE}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (tmRes.ok) {
        const data = await tmRes.json();
        const rawMessages = data['hydra:member'] || data || [];
        const formatted = rawMessages.map((m: any) => ({
          id: m.id,
          token,
          from: m.from,
          to: m.to,
          subject: m.subject || '(No Subject)',
          intro: m.intro || '',
          text: m.text || '',
          html: m.html || '',
          hasAttachments: Boolean(m.hasAttachments),
          size: m.size || 0,
          createdAt: m.createdAt || m.updatedAt || new Date().toISOString()
        }));

        return {
          success: true,
          count: formatted.length,
          messages: formatted.slice(-20),
          latestMessageAt: formatted[0]?.createdAt || null
        };
      }

      if (tmRes.status === 401 || tmRes.status === 403) {
        return { success: false, error: 'EXPIRED', count: 0, messages: [] };
      }

      return { success: false, error: `HTTP_${tmRes.status}`, count: 0, messages: [] };
    } catch (err: any) {
      return { success: false, error: err.message || 'TIMEOUT', count: 0, messages: [] };
    }
  };

  // Chunked execution through bounded concurrency worker pool
  for (let i = 0; i < sanitizedTokens.length; i += CONCURRENCY_LIMIT) {
    const chunk = sanitizedTokens.slice(i, i + CONCURRENCY_LIMIT);
    const chunkResults = await Promise.allSettled(
      chunk.map(async (token) => {
        const res = await fetchSingleInbox(token);
        return { token, res };
      })
    );

    for (const item of chunkResults) {
      if (item.status === 'fulfilled') {
        results[item.value.token] = item.value.res;
      }
    }
  }

  return res.json({
    success: true,
    totalChecked: sanitizedTokens.length,
    results,
    checkedAt: new Date().toISOString()
  });
});

// Real-time SSE (Server-Sent Events) live inbox stream
app.get('/api/inbox/stream/:token', async (req, res) => {
  const token = req.params.token;
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(400).end();
  }
  const sseIp = req.ip || req.socket?.remoteAddress || 'unknown';
  const sseCount = sseByIp.get(sseIp) || 0;
  let sseTotal = 0;
  sseByIp.forEach((n) => { sseTotal += n; });
  if (sseCount >= SSE_PER_IP_MAX || sseTotal >= SSE_GLOBAL_MAX) {
    return res.status(429).json({ error: 'Too many live streams, please try again later.', code: 'RATE_LIMITED' });
  }
  sseByIp.set(sseIp, sseCount + 1);
  const releaseSse = () => {
    const n = sseByIp.get(sseIp) || 0;
    if (n <= 1) sseByIp.delete(sseIp); else sseByIp.set(sseIp, n - 1);
  };

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let isClosed = false;
  let lastMessageCount = -1;

  const fetchCurrentInbox = async () => {
    if (isClosed) return;
    try {
      if (token.startsWith('mock_')) {
        res.write(`data: ${JSON.stringify({ type: 'error', code: 'EXPIRED' })}\n\n`);
        isClosed = true;
        res.end();
        return;
      }

      const tmRes = await fetch(`${MAIL_TM_API_BASE}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (tmRes.ok) {
        const data = await tmRes.json();
        const rawMessages = data['hydra:member'] || data || [];
        const formatted = rawMessages.map((m: any) => ({
          id: m.id,
          token,
          from: m.from,
          to: m.to,
          subject: m.subject || '(No Subject)',
          intro: m.intro || '',
          text: m.text || '',
          html: m.html || '',
          hasAttachments: Boolean(m.hasAttachments),
          size: m.size || 0,
          createdAt: m.createdAt || m.updatedAt || new Date().toISOString()
        }));

        if (formatted.length !== lastMessageCount) {
          lastMessageCount = formatted.length;
          res.write(`data: ${JSON.stringify({ type: 'inbox', count: formatted.length, messages: formatted })}\n\n`);
        }
      } else if (tmRes.status === 401 || tmRes.status === 403) {
        res.write(`data: ${JSON.stringify({ type: 'error', code: 'EXPIRED' })}\n\n`);
        isClosed = true;
        res.end();
      }
    } catch {
      // transient network timeout - ignore in streaming loop
    }
  };

  // Immediate initial push
  await fetchCurrentInbox();

  // Rapid push loop (every 3 seconds)
  const pollTimer = setInterval(fetchCurrentInbox, 3000);

  // Heartbeat ping every 15s to keep connection alive
  const keepAliveTimer = setInterval(() => {
    if (!isClosed) res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    isClosed = true;
    clearInterval(pollTimer);
    clearInterval(keepAliveTimer);
    releaseSse();
  });
});


// Delete a whole Mail.tm account (inbox). The frontend only holds a JWT
// token, not the Mail.tm account id, so resolve the id via /accounts/me
// with that token first, then delete by id with the same token. Token
// validation follows the same pattern as the other token routes.
app.delete('/api/accounts/:token', accountDeleteLimiter, accountDeleteTokenLimiter, async (req, res) => {
  const { token } = req.params;

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(400).json({ error: 'Missing or invalid inbox token. Please create a new email address.', code: 'INVALID_TOKEN' });
  }
  if (token.startsWith('mock_')) {
    return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
  }

  try {
    const meRes = await fetch(`${MAIL_TM_API_BASE}/accounts/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(20000)
    });
    if (meRes.status === 401 || meRes.status === 403) {
      return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
    }
    if (!meRes.ok) {
      console.warn('[Backend] Account delete: /accounts/me upstream status', meRes.status);
      return res.status(502).json({ success: false, error: 'Mail.tm account unavailable, please try again.', code: 'UPSTREAM_ERROR', upstreamStatus: meRes.status });
    }
    const meData: any = await meRes.json();
    const accountId = meData?.id;
    if (!accountId) {
      console.warn('[Backend] Account delete: /accounts/me returned no id');
      return res.status(502).json({ success: false, error: 'Mail.tm account unavailable, please try again.', code: 'UPSTREAM_ERROR', upstreamStatus: meRes.status });
    }

    const delRes = await fetch(`${MAIL_TM_API_BASE}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000)
    });
    if (delRes.ok || delRes.status === 204) {
      return res.json({ success: true });
    }
    if (delRes.status === 404) {
      // Already gone on Mail.tm: the local purge the frontend performs on
      // any 2xx is still the correct outcome.
      return res.json({ success: true, alreadyDeleted: true });
    }
    console.warn('[Backend] Account delete: upstream DELETE status', delRes.status);
    return res.status(502).json({ success: false, error: 'Could not delete account, please try again.', code: 'UPSTREAM_ERROR', upstreamStatus: delRes.status });
  } catch (err: any) {
    console.warn('[Backend] Account delete error:', err.message);
    return res.status(502).json({ success: false, error: 'Could not delete account, please try again.', code: 'UPSTREAM_ERROR' });
  }
});


// Message detail & full content endpoint
app.get('/api/inbox/content/:token/:messageId', inboxLimiter, async (req, res) => {
  const { token, messageId } = req.params;

  if (!token || !messageId) {
    return res.status(400).json({ error: 'Missing token or message ID' });
  }

  if (token.startsWith('mock_')) {
    return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
  }

  try {
    const tmRes = await fetch(`${MAIL_TM_API_BASE}/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (tmRes.ok) {
      const data = await tmRes.json();
      const htmlContent = Array.isArray(data.html)
        ? data.html.join('')
        : (data.html || (data.text ? `<p style="white-space: pre-wrap;">${data.text}</p>` : ''));

      return res.json({
        ...data,
        token,
        html: htmlContent
      });
    }

    if (tmRes.status === 401 || tmRes.status === 403) {
      return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
    }

    if (tmRes.status === 404) {
      return res.status(404).json({ error: 'Message not found' });
    }
  } catch (err: any) {
    console.warn('[Backend] Message content fetch error:', err.message);
  }

  // Upstream/timeout failure is not a "not found" message.
  return res.status(502).json({ error: 'Mail.tm message unavailable, please try again.', code: 'UPSTREAM_ERROR' });
});

// Direct attachment stream proxy
app.get('/api/inbox/attachment/:token/:messageId/:attachmentId', fileLimiter, async (req, res) => {
  const { token, messageId, attachmentId } = req.params;

  if (!token || !messageId || !attachmentId) {
    return res.status(400).json({ error: 'Missing token, message ID or attachment ID' });
  }
  if (token.startsWith('mock_')) {
    return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
  }

  try {
    let fileRes = await fetch(`${MAIL_TM_API_BASE}/messages/${messageId}/attachment/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000)
    });

    if (!fileRes.ok) {
      fileRes = await fetch(`${MAIL_TM_API_BASE}/messages/${messageId}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(20000)
      });
    }

    if (fileRes.ok) {
      // Never forward upstream headers verbatim: force download and never
      // serve upstream HTML inline (that would be an XSS vector).
      // Professional download: the file MUST keep its original name and
      // extension. Previously the backend forced a name with no extension
      // (attachment-<id>-<id>), and browsers ignore the frontend's
      // cross-origin `download` attribute, so users received a .bin file
      // the OS could not open as PDF/Word — even though the bytes were
      // correct. The frontend passes ?filename=<original name>; fall back
      // to an extension inferred from the upstream content-type.
      const upstreamType = fileRes.headers.get('content-type') || 'application/octet-stream';
      const typeToExt: Record<string, string> = {
        'application/pdf': 'pdf', 'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp',
        'application/zip': 'zip', 'text/plain': 'txt', 'text/csv': 'csv'
      };
      const rawName = String((req.query as any)?.filename || '');
      const baseName = rawName.split(/[\\/]/).pop() || '';
      const cleanName = baseName.replace(/[^A-Za-z0-9._\- ]/g, '').replace(/^\.+/, '').slice(0, 120);
      const hasExt = /\.[A-Za-z0-9]{1,10}$/.test(cleanName);
      const inferredExt = typeToExt[upstreamType.split(';')[0].trim()];
      let safeName = cleanName;
      if (!safeName) {
        safeName = `attachment-${String(messageId).replace(/[^A-Za-z0-9._-]/g, '')}-${String(attachmentId).replace(/[^A-Za-z0-9._-]/g, '')}`;
      }
      if (!hasExt && inferredExt) safeName = `${safeName}.${inferredExt}`;
      if (!/\.[A-Za-z0-9]{1,10}$/.test(safeName)) safeName = `${safeName}.bin`;
      let safeType = upstreamType.startsWith('text/html') ? 'application/octet-stream' : upstreamType;
      if (safeType === 'application/octet-stream' && inferredExt) {
        const extToType = Object.fromEntries(Object.entries(typeToExt).map(([t, e]) => [e, t]));
        safeType = extToType[inferredExt] || safeType;
      }
      const upstreamLength = Number(fileRes.headers.get('content-length'));
      if (Number.isFinite(upstreamLength) && upstreamLength > MAX_PROXIED_BYTES) {
        return res.status(413).json({ error: 'Attachment too large to download.', code: 'FILE_TOO_LARGE' });
      }
      res.setHeader('Content-Type', safeType);
      if (Number.isFinite(upstreamLength) && upstreamLength > 0) {
        res.setHeader('Content-Length', String(upstreamLength));
      }
      const asciiName = safeName.replace(/"/g, '');
      res.setHeader('Content-Disposition', `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);

      await streamUpstream(res, fileRes);
      return;
    }

    return res.status(fileRes.status).json({ error: 'Could not retrieve attachment' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Download raw email (.eml) endpoint
app.get('/api/inbox/download/:token/:messageId', fileLimiter, async (req, res) => {
  const { token, messageId } = req.params;

  if (!token || !messageId) {
    return res.status(400).json({ error: 'Missing token or message ID' });
  }
  if (token.startsWith('mock_')) {
    return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
  }

  try {
    const emlRes = await fetch(`${MAIL_TM_API_BASE}/messages/${messageId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000)
    });

    if (emlRes.ok) {
      const upstreamLength = Number(emlRes.headers.get('content-length'));
      if (Number.isFinite(upstreamLength) && upstreamLength > MAX_PROXIED_BYTES) {
        return res.status(413).json({ error: 'Email too large to download.', code: 'FILE_TOO_LARGE' });
      }
      res.setHeader('Content-Type', 'message/rfc822');
      res.setHeader('Content-Disposition', `attachment; filename="email-${messageId}.eml"`);
      await streamUpstream(res, emlRes);
      return;
    }
  } catch (err: any) {
    console.warn('[Backend] Download EML error:', err.message);
  }

  return res.status(404).json({ error: 'Could not download email' });
});

// Delete email message endpoint
app.delete('/api/inbox/:token/:messageId', deleteLimiter, messageDeleteTokenLimiter, async (req, res) => {
  const { token, messageId } = req.params;

  if (token.startsWith('mock_')) {
    return res.status(401).json({ error: 'Session expired. Please create a new email address.' });
  }

  try {
    const delRes = await fetch(`${MAIL_TM_API_BASE}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(8000)
    });

    if (delRes.ok || delRes.status === 204) {
      return res.json({ success: true, messageId });
    }
  } catch (err: any) {
    console.warn('[Backend] Delete error:', err.message);
  }

  // Honest error: never report success when the Mail.tm delete did not succeed.
  return res.status(502).json({ success: false, error: 'Could not delete message, please try again.', code: 'UPSTREAM_ERROR', messageId });
});

// ---------------------------------------------------------------------------
// Postmark inbound (custom-domain mail).
// Postmark POSTs received mail for inbound.tempmailpk.com to the webhook
// below. Messages are stored in Firestore (collection "inbound_messages")
// so they survive backend restarts, and the frontend pulls them into
// localStorage. If FIREBASE_SERVICE_ACCOUNT_JSON is not set, the store
// falls back to in-memory (messages lost on restart) so the webhook still
// works for testing.
// ---------------------------------------------------------------------------
const POSTMARK_INBOUND_DOMAIN = 'inbound.tempmailpk.com';
const POSTMARK_WEBHOOK_SECRET = process.env.POSTMARK_WEBHOOK_SECRET || '';

type InboundAttachment = {
  name: string;
  contentType: string;
  contentLength: number;
  contentId: string;
  // base64 content; omitted when the attachment is too large to hold.
  content?: string;
  tooLarge?: boolean;
};
type InboundMessage = {
  id: string;
  to: string;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  textBody: string;
  htmlBody: string;
  receivedAt: number;
  attachments: InboundAttachment[];
};

const INBOUND_MAX_PER_ADDRESS = 50;
const INBOUND_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const INBOUND_MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB per attachment
const INBOUND_MAX_BODY_CHARS = 400 * 1024; // 400KB per body field (Firestore doc limit is 1 MiB)

// --- Firestore init (optional; falls back to in-memory) ---
let inboundDb: any = null;
try {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';
  if (svcJson) {
    if (!getApps().length) {
      initializeApp({ credential: cert(JSON.parse(svcJson)) });
    }
    inboundDb = getFirestore();
    console.log('[Postmark inbound] Firestore store enabled.');
  } else {
    console.log('[Postmark inbound] FIREBASE_SERVICE_ACCOUNT_JSON not set — using in-memory store (messages lost on restart).');
  }
} catch (err: any) {
  console.warn('[Postmark inbound] Firestore init failed, using in-memory store:', err?.message);
  inboundDb = null;
}

// --- In-memory fallback store ---
const inboundMemory = new Map<string, InboundMessage[]>();
const INBOUND_MEMORY_MAX_TOTAL = 500;

function memoryPrune() {
  const now = Date.now();
  for (const [addr, list] of inboundMemory) {
    const kept = list.filter((m) => now - m.receivedAt < INBOUND_TTL_MS);
    if (kept.length === 0) inboundMemory.delete(addr);
    else if (kept.length !== list.length) inboundMemory.set(addr, kept);
  }
}

function truncateBody(s: string): string {
  return s.length > INBOUND_MAX_BODY_CHARS ? s.slice(0, INBOUND_MAX_BODY_CHARS) : s;
}

// Save a message. Returns 'saved' | 'duplicate'.
async function saveInboundMessage(msg: InboundMessage): Promise<'saved' | 'duplicate'> {
  if (inboundDb) {
    const docRef = inboundDb.collection('inbound_messages').doc(msg.id);
    const existing = await docRef.get();
    if (existing.exists) return 'duplicate';
    const stored: InboundMessage = {
      ...msg,
      textBody: truncateBody(msg.textBody),
      htmlBody: truncateBody(msg.htmlBody),
    };
    await docRef.set(stored);
    return 'saved';
  }
  memoryPrune();
  const list = inboundMemory.get(msg.to) || [];
  if (list.some((m) => m.id === msg.id)) return 'duplicate';
  list.unshift(msg);
  if (list.length > INBOUND_MAX_PER_ADDRESS) list.length = INBOUND_MAX_PER_ADDRESS;
  inboundMemory.set(msg.to, list);
  let total = 0;
  for (const l of inboundMemory.values()) total += l.length;
  while (total > INBOUND_MEMORY_MAX_TOTAL) {
    let oldestAddr = '';
    let oldestAt = Infinity;
    for (const [addr, l] of inboundMemory) {
      const last = l[l.length - 1];
      if (last && last.receivedAt < oldestAt) { oldestAt = last.receivedAt; oldestAddr = addr; }
    }
    if (!oldestAddr) break;
    const l = inboundMemory.get(oldestAddr)!;
    l.pop();
    if (l.length === 0) inboundMemory.delete(oldestAddr);
    total -= 1;
  }
  return 'saved';
}

// Fetch messages for an address (newest first, last 7 days, max 50).
async function getInboundMessages(address: string): Promise<InboundMessage[]> {
  const cutoff = Date.now() - INBOUND_TTL_MS;
  if (inboundDb) {
    const snap = await inboundDb
      .collection('inbound_messages')
      .where('to', '==', address)
      .limit(100)
      .get();
    const messages: InboundMessage[] = [];
    snap.forEach((doc: any) => {
      const d = doc.data() as InboundMessage;
      if (d && d.receivedAt > cutoff) messages.push(d);
    });
    messages.sort((a, b) => b.receivedAt - a.receivedAt);
    return messages.slice(0, INBOUND_MAX_PER_ADDRESS);
  }
  memoryPrune();
  return (inboundMemory.get(address) || []).slice(0, INBOUND_MAX_PER_ADDRESS);
}

// Extract the recipient address from a Postmark inbound payload.
function postmarkRecipient(body: any): string {
  const raw =
    (typeof body?.OriginalRecipient === 'string' && body.OriginalRecipient) ||
    (Array.isArray(body?.ToFull) && body.ToFull[0]?.Email) ||
    (typeof body?.To === 'string' && body.To) ||
    '';
  // "Name" <addr@domain> -> addr@domain
  const m = raw.match(/<([^>]+)>/);
  const addr = (m ? m[1] : raw).trim().toLowerCase();
  return addr;
}

// POST /api/inbound/postmark/:secret — Postmark inbound webhook.
// The secret is a path segment so only Postmark (which holds the URL) can
// post here. It must match POSTMARK_WEBHOOK_SECRET (Render env var).
// Returns 2xx fast; Postmark retries 5xx.
app.post(
  '/api/inbound/postmark/:secret',
  express.json({ limit: '10mb' }),
  async (req: any, res: any) => {
    if (!POSTMARK_WEBHOOK_SECRET || req.params.secret !== POSTMARK_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const body = req.body || {};
    const to = postmarkRecipient(body);
    // Accept the plumbing domain (inbound.tempmailpk.com) and any customer
    // domain that is registered AND DNS-verified (see isAcceptedInboundDomain
    // in the Premium section below). Anything else is not ours to store.
    if (!to || !(await isAcceptedInboundDomain(to))) {
      return res.status(400).json({ error: 'Recipient is not on a registered inbound domain' });
    }
    const attachments: InboundAttachment[] = Array.isArray(body.Attachments)
      ? body.Attachments.map((a: any) => {
          const content = typeof a?.Content === 'string' ? a.Content : '';
          const tooLarge = content.length > INBOUND_MAX_ATTACHMENT_BYTES * 1.4; // base64 overhead
          return {
            name: String(a?.Name || 'attachment'),
            contentType: String(a?.ContentType || 'application/octet-stream'),
            contentLength: Number(a?.ContentLength) || 0,
            contentId: String(a?.ContentID || ''),
            ...(tooLarge ? { tooLarge: true } : { content }),
          };
        })
      : [];
    const msg: InboundMessage = {
      id: String(body.MessageID || `pm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
      to,
      from: String(body.From || ''),
      fromName: String(body.FromName || ''),
      subject: String(body.Subject || '(no subject)'),
      date: String(body.Date || new Date().toISOString()),
      textBody: String(body.TextBody || ''),
      htmlBody: String(body.HtmlBody || ''),
      receivedAt: Date.now(),
      attachments,
    };
    try {
      const result = await saveInboundMessage(msg);
      if (result === 'duplicate') return res.json({ ok: true, duplicate: true });
    } catch (err: any) {
      console.warn('[Postmark inbound] Save failed:', err?.message);
      return res.status(500).json({ error: 'Could not store message' });
    }
    console.log(`[Postmark inbound] ${msg.from} -> ${to} (${msg.subject})`);
    return res.json({ ok: true, id: msg.id });
  }
);

// GET /api/inbound/messages/:address — the frontend polls this for a
// custom-domain inbox. Returns stored messages (newest first). Accepts the
// plumbing domain and any registered + DNS-verified customer domain.
app.get('/api/inbound/messages/:address', inboxLimiter, async (req: any, res: any) => {
  const address = String(req.params.address || '').trim().toLowerCase();
  if (!address || !address.includes('@') || !(await isAcceptedInboundDomain(address))) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  try {
    const messages = await getInboundMessages(address);
    return res.json({ address, messages, count: messages.length });
  } catch (err: any) {
    console.warn('[Postmark inbound] Fetch failed:', err?.message);
    return res.status(500).json({ error: 'Could not fetch messages' });
  }
});

// ---------------------------------------------------------------------------
// TempMail Pro Premium — bring-your-own-domain (BYOD), license-key gated.
// No login, no account. A customer pays on Creem ($5/month or $48/year),
// Creem issues a license key (email receipt + customer portal + the
// checkout.completed webhook), and the customer pastes that key into /app
// to unlock the custom-domain section. One key = one domain.
//
// How the pieces fit:
//  * Creem webhook (below) receives checkout.completed (with license_keys[])
//    and subscription lifecycle events, and upserts Firestore collection
//    "premium_subscriptions" (doc id = normalized license key).
//  * POST /api/premium/verify-key checks that record — the browser flag
//    (?subscribed=1) is never trusted on its own.
//  * POST /api/premium/register-domain stores the domain in Firestore
//    collection "custom_domains" and creates a dedicated Postmark server
//    for it (one inbound stream per server, one domain per stream), so
//    mail for that domain is POSTed to our inbound webhook.
//  * GET /api/premium/verify-dns/:domain checks the domain's MX records
//    and marks it verified when an MX points at inbound.postmarkapp.com.
//  * The inbound webhook + fetch above accept mail for the plumbing domain
//    and for any registered + verified customer domain.
//
// Env vars this section reads (all optional except as noted):
//  * POSTMARK_API_TOKEN — Postmark ACCOUNT token (API Tokens tab, account
//    owner only). Required to create a Postmark server per customer domain.
//    Without it, domains are stored as "pending" and the app says plainly
//    that Postmark is not connected yet. Obtain it in the Postmark
//    dashboard and set it in Render — see the verification note.
//  * CREEM_WEBHOOK_SECRET — from Creem dashboard (Developers > Webhooks)
//    when the webhook URL is registered. Required to verify the HMAC-SHA256
//    signature on incoming Creem events. Without it the webhook rejects
//    everything with a 500 (unsigned webhooks are never trusted).
//  * BACKEND_PUBLIC_URL — public base URL of this backend, used to build
//    the Postmark webhook URL for new customer servers. Defaults to the
//    Render URL.
// ---------------------------------------------------------------------------
const PREMIUM_PRODUCT_IDS = new Set([
  'prod_5rlysHo03p4e5czTOZFe02', // TempMail Pro Premium — Monthly ($5)
  'prod_7LDR5lYmCrzoHqjIDtO2K', // TempMail Pro Premium — Yearly ($48)
]);
const PREMIUM_DOMAINS_PER_KEY = 1;
const POSTMARK_MX_HOST = 'inbound.postmarkapp.com';
const POSTMARK_API_TOKEN = process.env.POSTMARK_API_TOKEN || '';
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || '';
const BACKEND_PUBLIC_URL = (process.env.BACKEND_PUBLIC_URL || 'https://tempro.onrender.com').replace(/\/+$/, '');
const POSTMARK_WEBHOOK_URL = `${BACKEND_PUBLIC_URL}/api/inbound/postmark/${POSTMARK_WEBHOOK_SECRET}`;

// The MX record every customer adds (same for everyone).
const PREMIUM_MX_RECORDS = [
  { type: 'MX', host: '@', priority: 10, value: POSTMARK_MX_HOST },
];
const PREMIUM_MX_NOTE =
  'Add this MX record at your domain registrar (wherever your domain DNS lives). ' +
  'If your root domain already receives business mail elsewhere, use a subdomain instead ' +
  '(for example, mail.yourdomain.com) and enter that subdomain as your domain here.';

// --- Premium stores: Firestore when available, in-memory otherwise ---
// (Same pattern as the inbound store above.)
const premiumSubsMemory = new Map<string, any>();
const customDomainsMemory = new Map<string, any>();
const creemEventsMemory = new Set<string>();

async function getSubscription(key: string): Promise<any | null> {
  if (inboundDb) {
    const snap = await inboundDb.collection('premium_subscriptions').doc(key).get();
    return snap.exists ? snap.data() : null;
  }
  return premiumSubsMemory.get(key) || null;
}

async function upsertSubscription(key: string, data: any): Promise<void> {
  const record = { ...data, key, updatedAt: new Date().toISOString() };
  if (inboundDb) {
    await inboundDb.collection('premium_subscriptions').doc(key).set(record, { merge: true });
    return;
  }
  premiumSubsMemory.set(key, { ...(premiumSubsMemory.get(key) || {}), ...record });
}

async function getCustomDomain(domain: string): Promise<any | null> {
  if (inboundDb) {
    const snap = await inboundDb.collection('custom_domains').doc(domain).get();
    return snap.exists ? snap.data() : null;
  }
  return customDomainsMemory.get(domain) || null;
}

async function upsertCustomDomain(domain: string, data: any): Promise<void> {
  const record = { ...data, domain, updatedAt: new Date().toISOString() };
  if (inboundDb) {
    await inboundDb.collection('custom_domains').doc(domain).set(record, { merge: true });
    return;
  }
  customDomainsMemory.set(domain, { ...(customDomainsMemory.get(domain) || {}), ...record });
}

async function isCreemEventProcessed(eventId: string): Promise<boolean> {
  if (inboundDb) {
    const snap = await inboundDb.collection('creem_webhook_events').doc(eventId).get();
    return snap.exists;
  }
  return creemEventsMemory.has(eventId);
}

async function markCreemEventProcessed(eventId: string): Promise<void> {
  if (inboundDb) {
    await inboundDb.collection('creem_webhook_events').doc(eventId).set({
      eventId,
      processedAt: new Date().toISOString(),
    });
    return;
  }
  creemEventsMemory.add(eventId);
}

// Is this recipient address on a domain we accept inbound mail for? The
// plumbing domain always counts; a customer domain counts only once it is
// registered AND DNS-verified. (Function declaration so it is hoisted and
// usable by the inbound webhook defined above this section.)
async function isAcceptedInboundDomain(address: string): Promise<boolean> {
  const at = address.lastIndexOf('@');
  if (at < 0) return false;
  const domain = address.slice(at + 1).toLowerCase();
  if (domain === POSTMARK_INBOUND_DOMAIN) return true;
  try {
    const rec = await getCustomDomain(domain);
    return Boolean(rec && rec.status === 'verified');
  } catch {
    return false;
  }
}

function normalizeLicenseKey(raw: any): string {
  return String(raw || '').trim().toUpperCase().replace(/[\s-]/g, (m) => (m === '-' ? '-' : ''));
}

// A key is usable while its subscription is active, or while a cancelled
// subscription is still inside the period the customer paid for.
function subscriptionIsUsable(sub: any): boolean {
  if (!sub) return false;
  if (sub.status === 'active') return true;
  if (sub.status === 'cancelled' && sub.expiresAt) {
    return new Date(sub.expiresAt).getTime() > Date.now();
  }
  return false;
}

function isValidDomainName(domain: string): boolean {
  // Labels of letters/digits/hyphens (not leading/trailing hyphen), dots
  // between, a TLD of at least 2 letters. No scheme, path, port, or @.
  if (!domain || domain.length > 253) return false;
  if (domain.includes('/') || domain.includes(':') || domain.includes('@') || domain.includes('_')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return false;
  return labels.every((l) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(l));
}

// POST /api/premium/verify-key {key} — server-side license check. The
// browser never decides on its own; only a record written by the verified
// Creem webhook counts.
app.post('/api/premium/verify-key', premiumLimiter, async (req: any, res: any) => {
  const key = normalizeLicenseKey(req.body?.key);
  if (!key) return res.status(400).json({ error: 'Enter your license key.' });
  try {
    const sub = await getSubscription(key);
    if (!sub) {
      return res.status(404).json({
        ok: false,
        error: 'This license key was not found. Check the key from your Creem receipt email — it is five groups of five characters.',
      });
    }
    if (!subscriptionIsUsable(sub)) {
      return res.status(403).json({
        ok: false,
        error:
          sub.status === 'cancelled'
            ? 'This subscription has ended. Renew it in Creem to use your custom domain again.'
            : 'This license key is not active right now. If you just paid, give the payment a minute to register, then try again.',
      });
    }
    return res.json({
      ok: true,
      active: true,
      productId: sub.productId || null,
      domainsUsed: Number(sub.domainsUsed) || 0,
      domainsLimit: Number(sub.domainsLimit) || PREMIUM_DOMAINS_PER_KEY,
      expiresAt: sub.expiresAt || null,
    });
  } catch (err: any) {
    console.warn('[Premium] verify-key failed:', err?.message);
    return res.status(500).json({ error: 'Could not check the license key, please try again.' });
  }
});

// Create a dedicated Postmark server for one customer domain (one inbound
// stream per server, one domain per stream). Returns the Postmark server id
// on success; throws on API failure.
async function createPostmarkServerForDomain(domain: string): Promise<number> {
  const res = await fetch('https://api.postmarkapp.com/servers', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Account-Token': POSTMARK_API_TOKEN,
    },
    body: JSON.stringify({
      Name: `TempMail Pro — ${domain}`,
      DeliveryType: 'Live',
      InboundDomain: domain,
      InboundHookUrl: POSTMARK_WEBHOOK_URL,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Postmark create server failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  const data: any = await res.json();
  if (!data || typeof data.ID !== 'number') throw new Error('Postmark create server returned no server id.');
  return data.ID;
}

// POST /api/premium/register-domain {key, domain} — claim a domain for a
// license key, store it, and (when the Postmark account token is set)
// create its dedicated Postmark server. Without the token the domain is
// stored as pending and the response says so plainly instead of failing.
app.post('/api/premium/register-domain', premiumLimiter, async (req: any, res: any) => {
  const key = normalizeLicenseKey(req.body?.key);
  const domain = String(req.body?.domain || '').trim().toLowerCase();
  if (!key) return res.status(400).json({ error: 'Enter your license key first.' });
  if (!domain) return res.status(400).json({ error: 'Enter your domain, for example londonstore.com.' });
  if (!isValidDomainName(domain)) {
    return res.status(400).json({ error: 'That does not look like a domain. Enter just the domain, for example londonstore.com — no https://, no @, no path.' });
  }
  if (domain === 'tempmailpk.com' || domain.endsWith('.tempmailpk.com') || domain === POSTMARK_INBOUND_DOMAIN) {
    return res.status(400).json({ error: 'That domain belongs to TempMail Pro. Connect a domain you own instead.' });
  }
  try {
    const sub = await getSubscription(key);
    if (!sub || !subscriptionIsUsable(sub)) {
      return res.status(403).json({ error: 'This license key is not active. Verify your key first, then register your domain.' });
    }
    const domainsUsed = Number(sub.domainsUsed) || 0;
    const domainsLimit = Number(sub.domainsLimit) || PREMIUM_DOMAINS_PER_KEY;
    const existing = await getCustomDomain(domain);
    if (existing) {
      if (existing.key === key) {
        // Idempotent re-register: return the current state instead of
        // erroring, so a retry after a network hiccup is harmless.
        return res.json({
          ok: true,
          domain,
          status: existing.status,
          postmarkServerId: existing.postmarkServerId || null,
          postmarkConfigured: Boolean(POSTMARK_API_TOKEN),
          mxRecords: PREMIUM_MX_RECORDS,
          mxNote: PREMIUM_MX_NOTE,
        });
      }
      return res.status(409).json({ error: 'This domain is already registered to another license key.' });
    }
    if (domainsUsed >= domainsLimit) {
      return res.status(403).json({ error: 'This license key already has its domain. One key covers one domain.' });
    }

    await upsertCustomDomain(domain, {
      key,
      status: 'pending',
      postmarkServerId: null,
      postmarkError: null,
      mxVerifiedAt: null,
      createdAt: new Date().toISOString(),
    });
    await upsertSubscription(key, { domainsUsed: domainsUsed + 1 });

    let postmarkServerId: number | null = null;
    let postmarkError: string | null = null;
    let status = 'pending';
    if (!POSTMARK_API_TOKEN) {
      postmarkError = 'Postmark is not connected on the server yet. Your domain is saved — it will be connected once the Postmark account token is set.';
    } else {
      try {
        postmarkServerId = await createPostmarkServerForDomain(domain);
        status = 'pending_dns';
        await upsertCustomDomain(domain, { status, postmarkServerId, postmarkError: null });
      } catch (err: any) {
        postmarkError = err?.message || 'Could not create the Postmark server.';
        console.warn('[Premium] Postmark server create failed for', domain, ':', postmarkError);
        await upsertCustomDomain(domain, { status: 'pending', postmarkError });
      }
    }

    return res.json({
      ok: true,
      domain,
      status,
      postmarkServerId,
      postmarkConfigured: Boolean(POSTMARK_API_TOKEN),
      postmarkError,
      mxRecords: PREMIUM_MX_RECORDS,
      mxNote: PREMIUM_MX_NOTE,
    });
  } catch (err: any) {
    console.warn('[Premium] register-domain failed:', err?.message);
    return res.status(500).json({ error: 'Could not register the domain, please try again.' });
  }
});

// GET /api/premium/verify-dns/:domain?key=XXX — check the domain's MX
// records for one pointing at inbound.postmarkapp.com. When the owning
// license key is supplied and matches, a passing check marks the domain
// verified in Firestore; without a matching key it only reports the MX
// status (so nobody can mark a domain they do not own as verified).
app.get('/api/premium/verify-dns/:domain', premiumLimiter, async (req: any, res: any) => {
  const domain = String(req.params.domain || '').trim().toLowerCase();
  const key = normalizeLicenseKey(req.query?.key);
  if (!domain || !isValidDomainName(domain)) {
    return res.status(400).json({ error: 'Enter a valid domain to check.' });
  }
  let mx: Array<{ exchange: string; priority: number }> = [];
  let lookupError: string | null = null;
  try {
    const records = await dns.resolveMx(domain);
    mx = (records || []).map((r: any) => ({ exchange: String(r.exchange || '').toLowerCase().replace(/\.$/, ''), priority: Number(r.priority) || 0 }));
  } catch (err: any) {
    lookupError = err?.code === 'ENOTFOUND' ? 'No DNS records found for this domain yet.' : `DNS lookup failed (${err?.code || 'error'}).`;
  }
  const verified = mx.some((r) => r.exchange === POSTMARK_MX_HOST || r.exchange.endsWith('.' + POSTMARK_MX_HOST));
  let stored: any = null;
  try {
    stored = await getCustomDomain(domain);
    if (verified && stored && key && stored.key === key && stored.status !== 'verified') {
      await upsertCustomDomain(domain, { status: 'verified', mxVerifiedAt: new Date().toISOString() });
      stored = await getCustomDomain(domain);
    }
  } catch (err: any) {
    console.warn('[Premium] verify-dns store read failed:', err?.message);
  }
  return res.json({
    ok: true,
    domain,
    verified,
    mx,
    lookupError,
    status: stored?.status || null,
    hint: verified
      ? 'MX is pointing at Postmark. Mail to this domain will now arrive in your custom-domain inbox.'
      : 'Add the MX record shown in the app at your domain registrar, then check again. DNS changes can take a few minutes to appear.',
    checkedAt: new Date().toISOString(),
  });
});

// --- Creem webhook -------------------------------------------------------
// POST /api/webhooks/creem — receives checkout.completed (which carries the
// license_keys[] array) and subscription lifecycle events, and upserts the
// premium_subscriptions records that verify-key reads. Signature: HMAC-
// SHA256 of the raw request body, keyed with CREEM_WEBHOOK_SECRET, sent in
// the `creem-signature` header. The raw body is read here (the global JSON
// parser skips this path) because parsing it first would destroy the bytes
// the signature covers. Events are deduplicated by event id — Creem
// retries a non-200 delivery, so the same event can arrive twice.
// Dashboard setup (user step): Creem dashboard > Developers > Webhooks,
// add URL https://tempro.onrender.com/api/webhooks/creem, copy the secret
// into Render as CREEM_WEBHOOK_SECRET.
function creemSignatureIsValid(rawBody: Buffer, signatureHeader: any, secret: string): boolean {
  if (!secret || typeof signatureHeader !== 'string' || !signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

app.post(
  '/api/webhooks/creem',
  express.raw({ type: 'application/json', limit: '100kb' }),
  async (req: any, res: any) => {
    if (!CREEM_WEBHOOK_SECRET) {
      console.warn('[Premium] Creem webhook called but CREEM_WEBHOOK_SECRET is not set.');
      return res.status(500).json({ error: 'Creem webhook is not configured on this server.' });
    }
    const rawBody: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body || ''), 'utf8');
    if (!creemSignatureIsValid(rawBody, req.headers['creem-signature'], CREEM_WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }
    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
    const eventId = String(event?.id || '');
    const eventType = String(event?.eventType || event?.type || '');
    const obj = event?.object || {};
    if (!eventId || !eventType) {
      return res.status(400).json({ error: 'Webhook event is missing an id or type.' });
    }
    try {
      if (await isCreemEventProcessed(eventId)) {
        return res.json({ ok: true, duplicate: true });
      }
      await markCreemEventProcessed(eventId);
    } catch (err: any) {
      console.warn('[Premium] Creem event dedupe failed:', err?.message);
    }

    try {
      if (eventType === 'checkout.completed') {
        // The checkout object carries license_keys[] — one entry per
        // license-key feature on the product. Each key becomes a
        // subscription record the app verifies against.
        const productId = String(obj?.product_id || obj?.productId || '');
        if (PREMIUM_PRODUCT_IDS.has(productId)) {
          const subId = String(obj?.subscription?.id || obj?.subscription_id || obj?.subscriptionId || '');
          const customerEmail = String(obj?.customer?.email || obj?.customer_email || '');
          const expiresAt = obj?.subscription?.current_period_end || obj?.current_period_end || null;
          const keys: any[] = Array.isArray(obj?.license_keys) ? obj.license_keys : [];
          for (const lic of keys) {
            const key = normalizeLicenseKey(lic?.key);
            if (!key) continue;
            const prev = await getSubscription(key).catch(() => null);
            await upsertSubscription(key, {
              productId,
              subscriptionId: subId || prev?.subscriptionId || null,
              customerEmail: customerEmail || prev?.customerEmail || null,
              status: 'active',
              domainsUsed: Number(prev?.domainsUsed) || 0,
              domainsLimit: PREMIUM_DOMAINS_PER_KEY,
              expiresAt: expiresAt || prev?.expiresAt || null,
              createdAt: prev?.createdAt || new Date().toISOString(),
            });
            console.log(`[Premium] License key recorded for ${productId} (subscription ${subId || 'n/a'}).`);
          }
          if (keys.length === 0) {
            console.warn('[Premium] checkout.completed for a Premium product carried no license_keys — is the license-key feature enabled on the product in the Creem dashboard?');
          }
        }
      } else if (eventType.startsWith('subscription.')) {
        // Lifecycle events carry the subscription object; update every
        // subscription record that belongs to it.
        const subId = String(obj?.id || '');
        const productId = String(obj?.product_id || obj?.productId || '');
        const nextStatus =
          eventType === 'subscription.active' || eventType === 'subscription.paid' ? 'active'
          : eventType === 'subscription.canceled' ? 'cancelled'
          : eventType === 'subscription.expired' ? 'expired'
          : eventType === 'subscription.past_due' ? 'past_due'
          : eventType === 'subscription.unpaid' ? 'unpaid'
          : eventType === 'subscription.paused' ? 'paused'
          : null; // subscription.scheduled_cancel and others: leave status alone
        if (subId && nextStatus) {
          // Find keys by subscription id: scan is bounded because the
          // table only holds Premium keys. (Firestore has no query-by-
          // field helper in the in-memory fallback, so scan both stores.)
          const updateFor = async (rec: any) => {
            if (rec && rec.subscriptionId === subId) {
              await upsertSubscription(rec.key, {
                status: nextStatus,
                expiresAt: obj?.current_period_end || rec.expiresAt || null,
              });
            }
          };
          if (inboundDb) {
            const snap = await inboundDb.collection('premium_subscriptions').where('subscriptionId', '==', subId).get();
            for (const doc of snap.docs) await updateFor(doc.data());
          } else {
            for (const rec of premiumSubsMemory.values()) await updateFor(rec);
          }
          console.log(`[Premium] Subscription ${subId} (${productId || 'unknown product'}) -> ${nextStatus}.`);
        }
      } else {
        console.log(`[Premium] Ignored Creem event ${eventType}.`);
      }
    } catch (err: any) {
      console.warn('[Premium] Creem webhook handling failed:', err?.message);
      return res.status(500).json({ error: 'Webhook handling failed.' });
    }
    return res.json({ ok: true });
  }
);

// CORS rejections (and other errors) must be JSON, not Express HTML 500 pages.
app.use((err: any, req: any, res: any, next: any) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS.', code: 'CORS_FORBIDDEN' });
  }
  return res.status(500).json({ error: 'Internal server error.', code: 'INTERNAL' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TempMail Pro Backend] Running on http://0.0.0.0:${PORT}`);
});

function shutdown(signal: string) {
  console.log(`[TempMail Pro Backend] ${signal} received, shutting down.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
