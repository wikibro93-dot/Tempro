#!/usr/bin/env node
// Real contract checks (not a placeholder): fails with exit 1 on any violation.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const fe = path.join(root, 'frontend');
const be = path.join(root, 'backend');
const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  else console.log(`ok: ${name}`);
};
const read = (p) => fs.readFileSync(p, 'utf8');
const walk = (dir, exts) => {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules') out.push(...walk(p, exts));
    else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
};

// 1. apiRoot exists and is used by the five call sites
check('apiRoot.js exists', fs.existsSync(path.join(fe, 'src/utils/apiRoot.js')));
const apiRoot = read(path.join(fe, 'src/utils/apiRoot.js'));
check('apiRoot derives from VITE_API_BASE', apiRoot.includes('VITE_API_BASE'));
for (const f of ['src/components/HomepageHeroConsole.jsx', 'src/components/EmailGenerator.jsx',
  'src/components/TempMailApp.jsx', 'src/components/Inbox.jsx', 'src/utils/batchInboxManager.js']) {
  check(`${f} uses getApiRoot`, read(path.join(fe, f)).includes('getApiRoot'));
}
// 2. No hard-coded '/api' fetches/axios calls outside apiRoot.js
const hardCoded = [];
for (const f of walk(path.join(fe, 'src'), ['.jsx', '.js'])) {
  if (f.endsWith('apiRoot.js')) continue;
  const s = read(f);
  if (/(fetch|axios\.(get|post|delete))\(['"`]\/api/.test(s) || /const API_ROOT = '\/api'/.test(s)) hardCoded.push(path.relative(fe, f));
}
check('no hard-coded /api call sites in src', hardCoded.length === 0, hardCoded.join(', '));
// 3. Backend: dead endpoint + credential map removed, caps and error shapes present
const server = read(path.join(be, 'server.ts'));
check('backend has no /email/wait', !server.includes('/email/wait'));
check('backend has no accountCredentials', !server.includes('accountCredentials'));
check('backend batch cap is 20', server.includes('.slice(0, 20)'));
check('backend inbox returns 502 UPSTREAM_ERROR', server.includes("code: 'UPSTREAM_ERROR'"));
check('backend delete does not lie on failure', server.includes("success: false, error: 'Could not delete message"));
check('backend CORS 403 JSON', server.includes("code: 'CORS_FORBIDDEN'"));
check('backend has /ready', server.includes("app.get('/ready'"));
check('backend has SIGTERM handling', server.includes("SIGTERM"));
check('backend json limit 10kb', server.includes("express.json({ limit: '10kb' })"));
check('backend security headers', server.includes('X-Content-Type-Options'));
check('backend rate limiters present', server.includes('createLimiter') && server.includes('batchLimiter') && server.includes('inboxLimiter'));
// 4. Sanitiser fallback refuses partially-cleaned HTML
const san = read(path.join(fe, 'src/utils/sanitizeEmailHtml.js'));
check('sanitiser fallback returns empty string', san.includes("return '';") && san.includes('Ultra-safe fallback'));
// 5. SEO: no stale domains in schema/llms, no 404 canonical, partner redirects
const idx = read(path.join(fe, 'index.html'));
check('index.html has no @maxxspace/@uberip domain claims', !idx.includes('@maxxspace.com') && !idx.includes('@uberip.com'));
const llms = read(path.join(fe, 'public/llms.txt'));
check('llms.txt has no @maxxspace domain claim', !llms.includes('@maxxspace.com'));
const seo = read(path.join(fe, 'src/components/RouteSeoManager.jsx'));
check('404 fallback has no homepage canonical', seo.includes('canonical: undefined'));
const vercel = read(path.join(fe, 'vercel.json'));
check('vercel.json redirects both partner URLs to /privacy-stack',
  vercel.includes('pst-net-premium-virtual-cards-free-trials-ads') && vercel.includes('cashmaal-virtual-visa-cards-online-privacy'));
check('vercel CSP has no unsafe-eval', !vercel.includes('unsafe-eval'));
check('vercel CSP has no api.mail.tm/mercure', !vercel.includes('api.mail.tm') && !vercel.includes('mercure.mail.tm'));
const sitemapGen = read(path.join(fe, 'src/utils/dynamicSeo.js'));
check('sitemap has no fake logo image entries', !sitemapGen.includes('pwa-512x512.png'));
const rssGen = read(path.join(fe, 'scripts/generate-sitemap.js'));
check('RSS is not sliced to 30', !rssGen.includes('slice(0, 30)'));

if (failures.length) {
  console.error('\nFAILED:');
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log('\nAll contract checks passed.');
