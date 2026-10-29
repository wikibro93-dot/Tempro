import express from 'express';
import cors from 'cors';

const PORT = Number(process.env.PORT) || 10000;
const MAIL_TM_API_BASE = (process.env.MAIL_TM_API_BASE || 'https://api.mail.tm').replace(/\/+$/, '');
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,https://tempmailpk.com,https://www.tempmailpk.com')
  .split(',').map((o) => o.trim()).filter(Boolean);

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '10kb' }));

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
const sseByIp = new Map<string, number>();
const SSE_PER_IP_MAX = 20;
const SSE_GLOBAL_MAX = 200;

async function getLiveDomains(): Promise<string[]> {
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
          return live;
        }
      }
    }
  } catch (err: any) {
    console.warn('[Backend] Could not fetch live Mail.tm domains:', err.message);
  }
  return [];
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
    return res.json([]);
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
  } catch (err: any) {
    console.warn('[Backend] Message content fetch error:', err.message);
  }

  return res.status(404).json({ error: 'Message not found' });
});

// Direct attachment stream proxy
app.get('/api/inbox/attachment/:token/:messageId/:attachmentId', async (req, res) => {
  const { token, messageId, attachmentId } = req.params;

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
      const upstreamType = fileRes.headers.get('content-type') || 'application/octet-stream';
      const safeType = upstreamType.startsWith('text/html') ? 'application/octet-stream' : upstreamType;
      const safeName = `attachment-${String(messageId).replace(/[^A-Za-z0-9._-]/g, '')}-${String(attachmentId).replace(/[^A-Za-z0-9._-]/g, '')}`;
      res.setHeader('Content-Type', safeType);
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

      const buffer = await fileRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    return res.status(fileRes.status).json({ error: 'Could not retrieve attachment' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Download raw email (.eml) endpoint
app.get('/api/inbox/download/:token/:messageId', async (req, res) => {
  const { token, messageId } = req.params;

  try {
    const emlRes = await fetch(`${MAIL_TM_API_BASE}/messages/${messageId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000)
    });

    if (emlRes.ok) {
      res.setHeader('Content-Type', 'message/rfc822');
      res.setHeader('Content-Disposition', `attachment; filename="email-${messageId}.eml"`);
      const buffer = await emlRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }
  } catch (err: any) {
    console.warn('[Backend] Download EML error:', err.message);
  }

  return res.status(404).json({ error: 'Could not download email' });
});

// Delete email message endpoint
app.delete('/api/inbox/:token/:messageId', async (req, res) => {
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
