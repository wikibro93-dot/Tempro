#!/usr/bin/env node

/**
 * llms.txt generator for TempMail Pro (Nov 2026).
 *
 * Why this exists: the old hand-written public/llms.txt had no blog links
 * at all and still claimed Facebook/X profiles that do not exist (removed
 * from the footer and schema in 424d1d5). robots.txt points Google-Extended,
 * GPTBot, ClaudeBot, PerplexityBot and Applebot at /llms.txt, so a stale
 * file gives AI crawlers a wrong picture of the site.
 *
 * This generator rebuilds llms.txt from the same articlesData source the
 * sitemap and RSS feed use, so it can never drift from the real article
 * list again. It is wired into the `build` script, right after the
 * sitemap generator. No social profiles are listed: TempMail Pro has none.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesPath = path.join(__dirname, '../src/content/articlesData.js');
const llmsPath = path.join(__dirname, '../public/llms.txt');

const SITE_URL = 'https://tempmailpk.com';

const articlesModule = await import(articlesPath);
const articles = articlesModule.articles || [];

const corePages = [
  ['Web Application', '/app', 'Create and manage free temporary email inboxes, with multiple inboxes, custom names and custom expiry.'],
  ['Blog', '/blog', 'Guides on temporary email, OTP verification, privacy and free trials.'],
  ['Privacy Stack Guide', '/privacy-stack', 'Partner privacy tools and affiliate offers, clearly labelled as partners, not TempMail features.'],
  ['About TempMail Pro', '/about', 'What TempMail Pro is, what it is for, and what it is not for.'],
  ['Privacy Policy', '/privacy', 'What TempMail Pro records and what it does not.'],
  ['Contact Us', '/contact', 'Contact form for questions, feedback, and problems with the app; replies go to the email address the visitor gives.'],
];

const lines = [];
lines.push('# TempMail Pro');
lines.push('> Free disposable temporary email service with multi-inbox management, custom durations (10m to 7 days), custom usernames, and fast OTP verification delivery.');
lines.push('');
lines.push('## Overview');
lines.push('TempMail Pro (https://tempmailpk.com) is an anonymous, privacy-focused temporary email platform. Users can create disposable email addresses without registration, manage multiple inboxes simultaneously, choose from live domains offered by Mail.tm at the time of use, and auto-detect OTP verification codes with 1-click copy.');
lines.push('');
lines.push('## Core Features');
lines.push('- **Multi-Inbox Management**: Create and switch between up to 10 active disposable email accounts in parallel without paying subscription fees.');
lines.push('- **Custom Lifespan & Durations**: Choose email validity from 10 minutes, 1 hour, 24 hours, up to 7 days, or specify custom durations.');
lines.push('- **Custom Username Creation**: Set personalized email aliases or generate randomized secure usernames.');
lines.push('- **Live OTP Auto-Detection**: Verification codes and PINs sent by services are automatically extracted with a 1-click copy badge.');
lines.push('- **Privacy Policy**: TempMail Pro does not sell or store your inbox data for advertising. Infrastructure providers (Vercel, Cloudflare, Render) may see connection metadata at the network layer — see the Privacy Policy at https://tempmailpk.com/privacy for what the service itself records. All emails are wiped permanently upon mailbox expiry.');
lines.push('- **Progressive Web App (PWA)**: Works offline with local message caching and can be installed natively on Android, iOS, Windows, and macOS.');
lines.push('');
lines.push('## Key Links & Resources');
for (const [label, page, desc] of corePages) {
  lines.push(`- ${label}: ${SITE_URL}${page} — ${desc}`);
}
lines.push(`- XML Sitemap: ${SITE_URL}/sitemap.xml`);
lines.push(`- RSS Feed: ${SITE_URL}/rss.xml`);
lines.push('');
lines.push(`## Blog Articles (${articles.length})`);
for (const article of articles) {
  lines.push(`- [${article.title}](${SITE_URL}/blog/${article.slug})`);
}
lines.push('');
lines.push('## Contact & Organization');
lines.push('- Service Name: TempMail Pro');
lines.push(`- Official Website: ${SITE_URL}`);
lines.push('- Support Email: support@tempmailpk.com');
lines.push('');

fs.writeFileSync(llmsPath, lines.join('\n'));
console.log(`✓ llms.txt generated: ${llmsPath} (${articles.length} articles, ${corePages.length} core pages, no social profiles)`);
