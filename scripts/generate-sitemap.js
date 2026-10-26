#!/usr/bin/env node

/**
 * Automated Sitemap & RSS Feed Generator for TempMail Pro
 * Generates public/sitemap.xml and public/rss.xml from src/content/articlesData.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesPath = path.join(__dirname, '../src/content/articlesData.js');
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const rssPath = path.join(__dirname, '../public/rss.xml');

// Import articles dynamically
const articlesModule = await import(articlesPath);
const articles = articlesModule.articles || [];

const today = new Date().toISOString().split('T')[0];

// Static primary pages
const staticPages = [
  { url: 'https://tempmailpk.com/', lastmod: today, changefreq: 'daily', priority: '1.0' },
  { url: 'https://tempmailpk.com/app', lastmod: today, changefreq: 'daily', priority: '0.95' },
  { url: 'https://tempmailpk.com/blog', lastmod: today, changefreq: 'daily', priority: '0.9' },
  { url: 'https://tempmailpk.com/privacy-stack', lastmod: today, changefreq: 'weekly', priority: '0.85' },
  { url: 'https://tempmailpk.com/about', lastmod: '2026-04-18', changefreq: 'monthly', priority: '0.8' },
  { url: 'https://tempmailpk.com/privacy', lastmod: '2026-04-18', changefreq: 'monthly', priority: '0.7' },
];

// Generate blog URLs from articles
const blogUrls = articles.map(article => ({
  url: `https://tempmailpk.com/blog/${article.slug}`,
  lastmod: article.date || today,
  changefreq: 'weekly',
  priority: '0.8',
}));

// Combine all URLs
const allUrls = [...staticPages, ...blogUrls];

// 1. Generate XML Sitemap
const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
const xmlFooter = '</urlset>';

const xmlContent = allUrls
  .map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${item.url}" />
    <xhtml:link rel="alternate" hreflang="en" href="${item.url}" />
  </url>`)
  .join('\n');

const sitemapXml = xmlHeader + xmlContent + '\n' + xmlFooter;
fs.writeFileSync(sitemapPath, sitemapXml);

console.log(`✓ Sitemap generated: ${sitemapPath}`);
console.log(`  Static pages: ${staticPages.length}`);
console.log(`  Blog posts: ${blogUrls.length}`);
console.log(`  Total URLs in sitemap: ${allUrls.length}`);

// 2. Generate RSS 2.0 Feed for News Readers, Google & AI Crawlers
const escapeXml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const rssItems = articles.slice(0, 30).map(article => {
  const pubDate = article.date ? new Date(article.date).toUTCString() : new Date().toUTCString();
  const link = `https://tempmailpk.com/blog/${article.slug}`;
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
    <link>https://tempmailpk.com/blog</link>
    <description>Latest guides, privacy tips, and disposable email strategies to protect your real inbox from spam and data breaches.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://tempmailpk.com/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`;

fs.writeFileSync(rssPath, rssXml);
console.log(`✓ RSS Feed generated: ${rssPath} (${articles.length} articles)`);
