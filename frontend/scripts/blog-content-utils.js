import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getMarkdownArticlesDir() {
  return path.join(__dirname, '../src/content/articles');
}

export function getMarkdownFiles(dir = getMarkdownArticlesDir()) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => path.join(dir, file));
}

function stripWrappingQuotes(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function parseMarkdownFrontmatter(markdownText, slug) {
  const frontmatterMatch = markdownText.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n)?/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
  const body = frontmatterMatch ? markdownText.slice(frontmatterMatch[0].length) : markdownText;

  const metadata = {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    description: '',
    date: '',
    image: '',
  };

  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (!match) {
      continue;
    }

    const [, key, value] = match;
    metadata[key] = stripWrappingQuotes(value.trim());
  }

  return {
    ...metadata,
    slug,
    content: body.trim(),
  };
}

export function normalizeSlug(filePath) {
  return path.basename(filePath, '.md');
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSimpleMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const htmlParts = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines.join(' ').trim();
    htmlParts.push(`<p>${escapeHtml(text)}</p>`);
    paragraphLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${escapeHtml(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      htmlParts.push(`<p>• ${escapeHtml(line.replace(/^[-*]\s+/, ''))}</p>`);
      continue;
    }

    paragraphLines.push(line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1'));
  }

  flushParagraph();
  return htmlParts.join('\n');
}

export function buildStaticBlogPageHtml(article, siteUrl) {
  const canonicalUrl = `${siteUrl}/blog/${article.slug}`;
  const title = article.title || article.slug.replace(/-/g, ' ');
  const description = article.description || 'Learn how disposable temporary emails protect your privacy, security, and spam-free workflows.';
  const datePublished = article.date || new Date().toISOString().split('T')[0];
  const bodyHtml = renderSimpleMarkdown(article.content || '');
  const metaImage = `${siteUrl}/pwa-512x512.png`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}#article`,
        headline: title,
        description: description,
        image: metaImage,
        datePublished: datePublished,
        dateModified: datePublished,
        author: {
          '@type': 'Organization',
          name: 'TempMail Pro Team',
          url: siteUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'TempMail Pro',
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/pwa-192x192.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${siteUrl}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${escapeHtml(title)} | TempMail Pro Blog</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#4361ee" />

    <!-- OpenGraph Social Cards -->
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="TempMail Pro" />
    <meta property="og:image" content="${metaImage}" />
    <meta property="article:published_time" content="${datePublished}" />
    <meta property="article:author" content="TempMail Pro Team" />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${metaImage}" />
    <meta name="twitter:site" content="@tempmailpk" />

    <!-- Schema.org Structured Data (JSON-LD) for Google & AI Engines -->
    <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
    </script>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
      .container { max-width: 820px; margin: 0 auto; padding: 2rem 1.25rem; }
      .header-nav { display: flex; align-items: center; justify-content: space-between; padding-bottom: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; }
      .header-nav a { color: #4361ee; text-decoration: none; font-weight: 600; }
      h1 { font-size: 2.4rem; line-height: 1.25; color: #0f172a; margin-bottom: 1rem; }
      .lead { font-size: 1.2rem; color: #475569; margin-bottom: 1.5rem; }
      .meta-tag { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; }
      article h2 { font-size: 1.6rem; color: #0f172a; margin-top: 2rem; }
      article h3 { font-size: 1.3rem; color: #1e293b; margin-top: 1.5rem; }
      article p { margin-bottom: 1.2rem; }
      .cta-box { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 1.5rem; margin-top: 3rem; text-align: center; }
      .cta-btn { display: inline-block; background: #4361ee; color: #fff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; margin-top: 0.75rem; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header-nav">
        <a href="/">← TempMail Pro Home</a>
        <a href="/app">Open Disposable Mailbox →</a>
      </div>
      <main>
        <h1>${escapeHtml(title)}</h1>
        <p class="lead">${escapeHtml(description)}</p>
        <div class="meta-tag">Published on ${datePublished} by TempMail Pro Team</div>
        <article>${bodyHtml}</article>

        <div class="cta-box">
          <h3>Need a Free Temporary Email Address Right Now?</h3>
          <p>Protect your real inbox from spam, data breaches, and tracking. Create multi-inboxes in 1 click.</p>
          <a class="cta-btn" href="/app">Generate Instant Free Email</a>
        </div>
      </main>
    </div>
  </body>
</html>`;
}
