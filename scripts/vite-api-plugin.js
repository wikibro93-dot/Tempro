/**
 * Vite Dev Server API Plugin for TempMail Pro
 * Handles /api/accounts/create, /api/inbox/:token, and /api/inbox/content/:token/:id
 * Integrates directly with Mail.tm and provides in-memory fallback if offline.
 */

const inMemoryInboxes = new Map();

function createWelcomeMessage(token, address) {
  return [
    {
      id: 'welcome_msg_' + Date.now(),
      token,
      from: { address: 'team@tempmailpk.com', name: 'TempMail Pro Team' },
      to: [{ address, name: address }],
      subject: 'Welcome to your temporary disposable inbox!',
      intro: 'Your temporary email address is now ready to receive emails and verification codes.',
      text: `Welcome to TempMail Pro!\n\nYour temporary email address (${address}) is active.\n\nYou can use this address to sign up for services, test applications, or receive OTP codes while keeping your real inbox spam-free.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
          <h2 style="color: #3b82f6; margin-top: 0;">Welcome to TempMail Pro!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Your temporary disposable email address <strong>${address}</strong> is active and ready to receive emails.</p>
          <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              <strong>Active Protection:</strong> Protect your personal mailbox from newsletters, phishing attempts, and unwanted promotional spam.
            </p>
          </div>
          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Thank you for using TempMail Pro.</p>
        </div>
      `,
      createdAt: new Date().toISOString()
    }
  ];
}

async function getMailTmDomain() {
  try {
    const res = await fetch('https://api.mail.tm/domains', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      const domains = data['hydra:member'] || data;
      if (Array.isArray(domains) && domains.length > 0) {
        return domains[0].domain || 'uberip.com';
      }
    }
  } catch (err) {
    console.warn('[Vite API] Could not fetch live domains, falling back to default domain:', err.message);
  }
  return 'uberip.com';
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export function tempMailApiPlugin() {
  return {
    name: 'temp-mail-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (!url.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Route: POST /api/accounts/create
        if (req.method === 'POST' && url === '/api/accounts/create') {
          const body = await parseJsonBody(req);
          const rawUser = body.username || ('user' + Math.random().toString(36).slice(2, 7));
          const username = rawUser.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24);

          try {
            const domain = await getMailTmDomain();
            const address = `${username}@${domain}`;
            const password = `Tmp_${Math.random().toString(36).slice(2, 10)}!1Aa`;

            // Try creating on mail.tm
            const accountRes = await fetch('https://api.mail.tm/accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ address, password }),
              signal: AbortSignal.timeout(5000)
            });

            if (accountRes.ok || accountRes.status === 422) {
              // Try obtaining token
              const tokenRes = await fetch('https://api.mail.tm/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ address, password }),
                signal: AbortSignal.timeout(5000)
              });

              if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                return res.end(JSON.stringify({
                  address,
                  email: address,
                  token: tokenData.token,
                  id: tokenData.id,
                  createdAt: new Date().toISOString()
                }));
              }
            }
          } catch (err) {
            console.warn('[Vite API] Mail.tm create error, using fallback in-memory account:', err.message);
          }

          // Fallback account creation
          const fallbackToken = 'mock_' + Math.random().toString(36).slice(2, 14);
          const fallbackAddress = `${username}@uberip.com`;
          const initialMessages = createWelcomeMessage(fallbackToken, fallbackAddress);
          inMemoryInboxes.set(fallbackToken, initialMessages);

          return res.end(JSON.stringify({
            address: fallbackAddress,
            email: fallbackAddress,
            token: fallbackToken,
            id: 'acc_' + fallbackToken,
            createdAt: new Date().toISOString()
          }));
        }

        // Route: GET /api/inbox/content/:token/:id
        if (req.method === 'GET' && url.startsWith('/api/inbox/content/')) {
          const parts = url.replace('/api/inbox/content/', '').split('/');
          const token = parts[0];
          const msgId = parts[1];

          if (!token || !msgId) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Missing token or message ID' }));
          }

          if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
            const list = inMemoryInboxes.get(token) || [];
            const msg = list.find(m => m.id === msgId) || list[0];
            if (msg) {
              return res.end(JSON.stringify(msg));
            }
          }

          // Try fetching from Mail.tm
          try {
            const tmRes = await fetch(`https://api.mail.tm/messages/${msgId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
              },
              signal: AbortSignal.timeout(6000)
            });

            if (tmRes.ok) {
              const data = await tmRes.json();
              const htmlContent = Array.isArray(data.html) ? data.html.join('') : (data.html || `<p>${data.text || ''}</p>`);
              return res.end(JSON.stringify({
                ...data,
                html: htmlContent
              }));
            }

            if (tmRes.status === 401 || tmRes.status === 403) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Session expired. Please create a new email address.' }));
            }
          } catch (err) {
            console.warn('[Vite API] Message content fetch error:', err.message);
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Message not found' }));
        }

        // Route: GET /api/inbox/:token
        if (req.method === 'GET' && url.startsWith('/api/inbox/')) {
          const token = url.replace('/api/inbox/', '').split('?')[0];

          if (!token) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Missing token' }));
          }

          if (token.startsWith('mock_') || inMemoryInboxes.has(token)) {
            const list = inMemoryInboxes.get(token) || [];
            return res.end(JSON.stringify(list));
          }

          // Try fetching from Mail.tm
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
              const messages = data['hydra:member'] || data || [];
              return res.end(JSON.stringify(messages));
            }

            if (tmRes.status === 401 || tmRes.status === 403) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Session expired. Please create a new email address.' }));
            }
          } catch (err) {
            console.warn('[Vite API] Inbox fetch error:', err.message);
          }

          return res.end(JSON.stringify([]));
        }

        // Route: GET /api/domains
        if (req.method === 'GET' && url.startsWith('/api/domains')) {
          try {
            const domain = await getMailTmDomain();
            return res.end(JSON.stringify([{ domain }]));
          } catch {
            return res.end(JSON.stringify([{ domain: 'uberip.com' }]));
          }
        }

        return next();
      });
    }
  };
}
