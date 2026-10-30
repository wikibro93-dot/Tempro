#!/usr/bin/env node
// Performance guardrails (not a placeholder): fails with exit 1 on any violation.
// Budgets are based on the measured post-cleanup build, not invented targets:
// - src/index.css was 118,608 bytes before cleanup, 94,526 + promo guard after.
//   Budget 110,000 bytes leaves headroom for real new styles, but catches a
//   re-introduction of the dead blocks removed in the performance cleanup.
// - Bootstrap must have exactly one source: the CDN link in index.html.
//   The bootstrap / fontawesome-free / bootstrap-icons packages were removed
//   from package.json because no src file imports them (icons are rendered
//   via lucide-react in AppIcon.jsx, Bootstrap classes come from the CDN CSS).
// - Monetag must stay deferred: index.html loads it only after window load /
//   requestIdleCallback, with async=true. It is revenue code, not removed.
// - PromoCard must stay capped on small screens and must not show on first
//   paint: App.jsx shows it after a 7s timer only, and index.css caps it
//   at 40vh on <=576px screens.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fe = path.join(__dirname, '..');
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) console.log(`ok: ${name}`);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};
const read = (p) => fs.readFileSync(p, 'utf8');

const pkg = JSON.parse(read(path.join(fe, 'package.json')));
for (const dep of ['bootstrap', '@fortawesome/fontawesome-free', 'bootstrap-icons']) {
  check(`package.json has no dead dep ${dep}`, !(pkg.dependencies && pkg.dependencies[dep]));
}

const srcFiles = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules') walk(p);
    else if (p.endsWith('.jsx') || p.endsWith('.js')) srcFiles.push(p);
  }
};
walk(path.join(fe, 'src'));
const srcText = srcFiles.map((f) => read(f)).join('\n');
check('no src import of bootstrap/fontawesome/bootstrap-icons packages',
  !/from ['"]bootstrap['"]/.test(srcText) &&
  !/from ['"]@fortawesome/.test(srcText) &&
  !/from ['"]bootstrap-icons/.test(srcText));
check('icons still come from lucide-react (AppIcon)', srcText.includes('from "lucide-react"'));

const indexHtml = read(path.join(fe, 'index.html'));
const bootstrapLinks = (indexHtml.match(/bootstrap@5\.3\.0\/dist\/css\/bootstrap\.min\.css/g) || []).length;
check('exactly one Bootstrap CDN source (preload + noscript = 2 references to the same file)',
  bootstrapLinks === 2, `found ${bootstrapLinks}`);
check('Monetag loader is deferred (load listener + async)',
  indexHtml.includes("window.addEventListener('load'") && indexHtml.includes('s.async = true'));
check('Monetag script tag itself is not render-blocking (no direct <script src=quge5>)',
  !indexHtml.includes('<script src="https://quge5.com'));

const css = read(path.join(fe, 'src/index.css'));
check('src/index.css under 110,000-byte budget', css.length < 110000, `${css.length} bytes`);
check('no dead inbox-modal rules reintroduced', !css.includes('.inbox-modal-dialog'));
check('no dead toc-sidebar rules reintroduced', !css.includes('.toc-sidebar'));
check('no dead app-preview mockup rules reintroduced', !css.includes('.app-preview-shell'));
check('no dead am-card rules reintroduced', !css.includes('.am-card {'));
check('promo capped at 40vh on small screens', css.includes('max-height: 40vh'));
const appJsx = read(path.join(fe, 'src/App.jsx'));
check('PromoCard shows only after a timer, not on first paint',
  appJsx.includes('setTimeout(() => setShowPromoCard(true), 7000)'));

if (failures.length) {
  console.error('\nFAILED:');
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log('\nAll performance checks passed.');
