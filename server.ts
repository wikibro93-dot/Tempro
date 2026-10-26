import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// In-memory fallback mailboxes and credentials
const inMemoryInboxes = new Map();
const accountCredentials = new Map();

function createWelcomeMessage(token: string, address: string) {
  return [
    {
      id: 'welcome_msg_' + Date.now(),
      token,
      from: { address: 'support@tempmailpro.com', name: 'TempMail Pro Team' },
      to: [{ address, name: address }],
      subject: 'Welcome to your temporary disposable inbox!',
      intro: 'Your temporary email address is now ready to receive emails and verification codes.',
      text: `Welcome to TempMail Pro!\n\nYour temporary email address (${address}) is active.\n\nYou can use this address to sign up for services, test applications, or receive OTP codes while keeping your real inbox spam-free.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #4361ee; margin-top: 0;">Welcome to TempMail Pro!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Your temporary disposable email address <strong>${address}</strong> is active and ready to receive incoming messages.</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #4361ee; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px; color: #334155;">
              <strong>Spam-Free Protection:</strong> Never expose your real email to untrusted websites, marketing trackers, or one-off registrations.
            </p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Disposable Inbox Powered by TempMail Pro Unified Engine.</p>
        </div>
      `,
      createdAt: new Date().toISOString()
    }
  ];
}

async function getLiveDomains(): Promise<string[]> {
  try {
    const res = await fetch('https://api.mail.tm/domains', {
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
  return ['maxxspace.com'];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Temp Mail Pro Unified Backend'
  });
});

// Domain listing endpoint
app.get('/api/accounts/domains', async (req, res) => {
  try {
    const domains = await getLiveDomains();
    res.json({
      success: true,
      domains
    });
  } catch (err: any) {
    res.json({
      success: true,
      domains: ['maxxspace.com']
    });
  }
});

// Mailbox creation endpoint
app.post('/api/accounts/create', async (req, res) => {
  const { username: rawUsername, domain: requestedDomain } = req.body || {};
  const liveDomains = await getLiveDomains();
  // Ensure the domain is strictly valid on live Mail.tm servers
  const domain = (requestedDomain && liveDomains.includes(requestedDomain))
    ? requestedDomain
    : (liveDomains[0] || 'maxxspace.com');

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
      const createRes = await fetch('https://api.mail.tm/accounts', {
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
        const tokenRes = await fetch('https://api.mail.tm/token', {
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
          accountCredentials.set(address, { password, token: tokenData.token });

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

  // Resilient fallback mailbox only if Mail.tm network is completely unreachable
  const fallbackToken = 'mock_' + Math.random().toString(36).slice(2, 14);
  const fallbackAddress = `${baseUsername}@${domain}`;
  const welcome = createWelcomeMessage(fallbackToken, fallbackAddress);
  inMemoryInboxes.set(fallbackToken, welcome);

  return res.json({
    address: fallbackAddress,
    email: fallbackAddress,
    token: fallbackToken,
    id: 'acc_' + fallbackToken,
    domain,
    isLive: false,
    createdAt: new Date().toISOString()
  });
});

// Inbox message list endpoint
app.get('/api/inbox/:token', async (req, res) => {
  const token = req.params.token;

  if (!token || token === 'undefined' || token === 'null') {
    return res.json([]);
  }

  // Handle in-memory fallback token
  if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
    const list = inMemoryInboxes.get(token) || [];
    return res.json(list);
  }

  try {
    const tmRes = await fetch('https://api.mail.tm/messages', {
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

  return res.json([]);
});

// High-concurrency Batch Processing Layer for multiple inboxes
app.post('/api/inbox/batch', async (req, res) => {
  const { tokens } = req.body || {};
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'Tokens array is required' });
  }

  // Safety cap to prevent memory exhaustion
  const sanitizedTokens = tokens
    .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
    .slice(0, 150);

  const results: Record<string, any> = {};
  const CONCURRENCY_LIMIT = 8; // Process 8 inboxes concurrently in bounded chunks

  const fetchSingleInbox = async (token: string) => {
    // 1. In-memory check
    if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
      const list = inMemoryInboxes.get(token) || [];
      return {
        success: true,
        count: list.length,
        messages: list.slice(-20),
        latestMessageAt: list[list.length - 1]?.createdAt || null
      };
    }

    // 2. Mail.tm check
    try {
      const tmRes = await fetch('https://api.mail.tm/messages', {
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
      if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
        const list = inMemoryInboxes.get(token) || [];
        if (list.length !== lastMessageCount) {
          lastMessageCount = list.length;
          res.write(`data: ${JSON.stringify({ type: 'inbox', count: list.length, messages: list })}\n\n`);
        }
        return;
      }

      const tmRes = await fetch('https://api.mail.tm/messages', {
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
  });
});


// Message detail & full content endpoint
app.get('/api/inbox/content/:token/:messageId', async (req, res) => {
  const { token, messageId } = req.params;

  if (!token || !messageId) {
    return res.status(400).json({ error: 'Missing token or message ID' });
  }

  // Fallback in-memory check
  if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
    const list = inMemoryInboxes.get(token) || [];
    const found = list.find((m: any) => m.id === messageId) || list[0];
    if (found) {
      return res.json(found);
    }
  }

  try {
    const tmRes = await fetch(`https://api.mail.tm/messages/${messageId}`, {
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
    let fileRes = await fetch(`https://api.mail.tm/messages/${messageId}/attachment/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000)
    });

    if (!fileRes.ok) {
      fileRes = await fetch(`https://api.mail.tm/messages/${messageId}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(20000)
      });
    }

    if (fileRes.ok) {
      const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
      const contentDisposition = fileRes.headers.get('content-disposition');

      res.setHeader('Content-Type', contentType);
      if (contentDisposition) {
        res.setHeader('Content-Disposition', contentDisposition);
      }

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
    const emlRes = await fetch(`https://api.mail.tm/messages/${messageId}/download`, {
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

  if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
    const list = inMemoryInboxes.get(token) || [];
    const filtered = list.filter((m: any) => m.id !== messageId);
    inMemoryInboxes.set(token, filtered);
    return res.json({ success: true, messageId });
  }

  try {
    const delRes = await fetch(`https://api.mail.tm/messages/${messageId}`, {
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

  return res.json({ success: true, messageId });
});

// Long polling wait endpoint
app.get('/api/email/wait', async (req, res) => {
  const { address, timeout = 30 } = req.query;
  const timeoutMs = Math.min(Number(timeout) || 30, 60) * 1000;
  const startTime = Date.now();

  const creds = accountCredentials.get(address as string);
  if (!creds?.token) {
    return res.json({ status: 'no_account_token', messages: [] });
  }

  while (Date.now() - startTime < timeoutMs) {
    try {
      const tmRes = await fetch('https://api.mail.tm/messages', {
        headers: {
          Authorization: `Bearer ${creds.token}`,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      if (tmRes.ok) {
        const data = await tmRes.json();
        const list = data['hydra:member'] || data || [];
        if (list.length > 0) {
          return res.json({ status: 'received', count: list.length, messages: list });
        }
      }
    } catch (_) {}

    await new Promise(r => setTimeout(r, 3000));
  }

  return res.json({ status: 'timeout', messages: [] });
});

// Dynamic SEO & AI Crawler Endpoints (Prioritizing /app and /blog with JSON-LD schema access)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { generateDynamicSitemap } = await import('./src/utils/dynamicSeo.js');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.send(generateDynamicSitemap('https://tempmailpk.com'));
  } catch (err: any) {
    console.warn('[Backend] Dynamic sitemap error:', err.message);
    const fallbackPath = path.resolve(__dirname, 'public/sitemap.xml');
    if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    }
    return res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', async (req, res) => {
  try {
    const { generateDynamicRobotsTxt } = await import('./src/utils/dynamicSeo.js');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.send(generateDynamicRobotsTxt('https://tempmailpk.com'));
  } catch (err: any) {
    console.warn('[Backend] Dynamic robots error:', err.message);
    const fallbackPath = path.resolve(__dirname, 'public/robots.txt');
    if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    }
    return res.status(500).send('User-agent: *\nAllow: /');
  }
});

app.get('/llms.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  const llmsPath = path.resolve(__dirname, 'public/llms.txt');
  if (fs.existsSync(llmsPath)) {
    return res.sendFile(llmsPath);
  }
  return res.status(404).send('# LLM index not found');
});

// Frontend Serving (Dev via Vite Middleware, Prod via static)
if (!isProd) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: false,
      host: '0.0.0.0',
      port: PORT,
      allowedHosts: true
    },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TempMail Pro Unified Server] Running on http://0.0.0.0:${PORT} (isProd: ${isProd})`);
});
