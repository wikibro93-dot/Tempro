/**
 * Dynamic SEO Generator for TempMail Pro
 * Produces prioritized XML Sitemaps and robots.txt tailored for search engines
 * (Google, Bing) and AI crawlers (Google Gemini, OpenAI GPTBot, ClaudeBot, PerplexityBot, Applebot).
 */

import { articles } from '../content/articlesData.js';

const SITE_URL = 'https://tempmailpk.com';

// Pillar articles that target high-intent search queries and rich snippets
const PILLAR_SLUGS = new Set([
  'best-free-temporary-email-for-days-and-weeks',
  'free-custom-name-temp-email',
  'free-temp-mail-multiple-inboxes-guide',
  'how-to-use-temp-email-for-free-trials',
  'temp-mail-for-qa-and-account-testing-teams',
  'ten-minute-mail-vs-long-duration-temp-mail',
  'temp-mail-without-login-safe-or-risky',
  'best-temp-email-for-free-trials-no-spam-2026',
  'temp-email-vs-email-alias',
  'receive-sms-otp-online',
  'private-domains-temp-email',
  'temp-email-for-discord'
]);

export function generateDynamicSitemap(siteUrl = SITE_URL) {
  const today = new Date().toISOString().split('T')[0];

  // Core application and section pages with prioritized weighting
  const priorityPages = [
    {
      url: `${siteUrl}/app`,
      lastmod: '2026-10-29',
      changefreq: 'weekly',
      priority: '0.90',
      description: 'TempMail Pro Web Application Workspace - Multi-Inbox and Live Domain Selector'
    },
    {
      url: `${siteUrl}/`,
      lastmod: '2026-10-29',
      changefreq: 'daily',
      priority: '1.0',
      description: 'TempMail Pro Homepage - Free Disposable Temporary Email'
    },
    {
      url: `${siteUrl}/blog`,
      lastmod: '2026-10-29',
      changefreq: 'daily',
      priority: '0.95',
      description: 'TempMail Pro Privacy & Email Security Blog Hub'
    },
    {
      url: `${siteUrl}/privacy-stack`,
      lastmod: '2026-04-18',
      changefreq: 'weekly',
      priority: '0.85',
      description: 'TempMail Pro Privacy Stack Architecture'
    },
    {
      url: `${siteUrl}/about`,
      lastmod: '2026-10-29',
      changefreq: 'monthly',
      priority: '0.75',
      description: 'About TempMail Pro'
    },
    {
      url: `${siteUrl}/privacy`,
      lastmod: '2026-04-18',
      changefreq: 'monthly',
      priority: '0.75',
      description: 'TempMail Pro Privacy Policy'
    }
  ];

  // Dynamic Blog Articles with tiered priorities
  const blogPages = (articles || []).map((art) => {
    const isPillar = PILLAR_SLUGS.has(art.slug);
    return {
      url: `${siteUrl}/blog/${art.slug}`,
      lastmod: art.date || today,
      changefreq: 'weekly',
      priority: isPillar ? '0.90' : '0.85',
      description: art.description || art.title
    };
  });

  const allPages = [...priorityPages, ...blogPages];

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  const xmlBody = allPages
    .map((page) => {
      return `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${page.url}" />
    <xhtml:link rel="alternate" hreflang="en" href="${page.url}" />
  </url>`;
    })
    .join('\n');

  const xmlFooter = '\n</urlset>';

  return xmlHeader + xmlBody + xmlFooter;
}

export function generateDynamicRobotsTxt(siteUrl = SITE_URL) {
  return `# ==============================================================================
# robots.txt for TempMail Pro (${siteUrl})
# Prioritizes /app and /blog for Search Indexing and AI Crawler Knowledge Retrieval
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Googlebot & Google Mobile Crawlers (Search & Core Web Vitals)
# ------------------------------------------------------------------------------
User-agent: Googlebot
User-agent: Googlebot-Mobile
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /privacy-stack
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /rss.xml
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 2. Google AI / Gemini Grounding & AI Overviews
# ------------------------------------------------------------------------------
User-agent: Google-Extended
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Allow: /privacy-stack
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 3. OpenAI GPTBot & SearchGPT (Model indexing & citation)
# ------------------------------------------------------------------------------
User-agent: GPTBot
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 4. OpenAI ChatGPT-User (Real-time live browser query tool)
# ------------------------------------------------------------------------------
User-agent: ChatGPT-User
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 5. Anthropic Claude Search & Model Retrieval
# ------------------------------------------------------------------------------
User-agent: ClaudeBot
User-agent: anthropic-ai
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 6. Perplexity AI Search Engine
# ------------------------------------------------------------------------------
User-agent: PerplexityBot
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 7. Apple Intelligence & Safari Siri Suggestions
# ------------------------------------------------------------------------------
User-agent: Applebot
User-agent: Applebot-Extended
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 8. Microsoft Bing & Copilot
# ------------------------------------------------------------------------------
User-agent: Bingbot
User-agent: msnbot
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 9. Additional Search & LLM Crawlers
# ------------------------------------------------------------------------------
User-agent: Bytespider
User-agent: cohere-ai
User-agent: DuckDuckBot
User-agent: YandexBot
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# ------------------------------------------------------------------------------
# 10. Default Directives for All Crawlers
# ------------------------------------------------------------------------------
User-agent: *
Allow: /
Allow: /app
Allow: /blog
Allow: /blog/*
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /rss.xml
# Privacy Quarantine: Never index disposable inbox message bodies or attachments
Disallow: /api/inbox/content/
Disallow: /api/inbox/stream/
Disallow: /api/inbox/attachment/

# Canonical Host Directive
Host: tempmailpk.com

# Machine-Readable AI Knowledge Index
# https://tempmailpk.com/llms.txt

# Dynamic Sitemaps & Feeds
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/rss.xml
`;
}
