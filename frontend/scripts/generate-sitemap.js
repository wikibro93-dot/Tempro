#!/usr/bin/env node

/**
 * Automated Sitemap, Robots.txt & RSS Feed Generator for TempMail Pro
 * Prioritizes /app and /blog sections, with full indexing configuration for AI crawlers.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDynamicSitemap, generateDynamicRobotsTxt } from '../src/utils/dynamicSeo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesPath = path.join(__dirname, '../src/content/articlesData.js');
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const robotsPath = path.join(__dirname, '../public/robots.txt');
const rssPath = path.join(__dirname, '../public/rss.xml');

const SITE_URL = 'https://tempmailpk.com';

// 1. Generate Prioritized Sitemap.xml
const sitemapXml = generateDynamicSitemap(SITE_URL);
fs.writeFileSync(sitemapPath, sitemapXml);
console.log(`✓ Prioritized dynamic sitemap generated: ${sitemapPath}`);

// 2. Generate Optimized robots.txt with AI crawler directives
const robotsTxt = generateDynamicRobotsTxt(SITE_URL);
fs.writeFileSync(robotsPath, robotsTxt);
console.log(`✓ Prioritized robots.txt generated: ${robotsPath}`);

// 3. Generate RSS 2.0 Feed for News Readers, Google & AI Crawlers
const articlesModule = await import(articlesPath);
const articles = articlesModule.articles || [];

const escapeXml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const rssItems = articles.map((article) => {
  const pubDate = article.date ? new Date(article.date).toUTCString() : new Date().toUTCString();
  const link = `${SITE_URL}/blog/${article.slug}`;
  return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.category || 'Privacy')}</category>
    </item>`;
}).join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TempMail Pro – Free Disposable Temporary Email Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Latest guides, privacy tips, and disposable email strategies to protect your real inbox from spam and data breaches.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`;

fs.writeFileSync(rssPath, rssXml);
console.log(`✓ RSS Feed generated: ${rssPath} (${articles.length} articles)`);
