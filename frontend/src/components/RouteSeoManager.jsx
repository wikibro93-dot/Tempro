import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../content/articlesData';

const SITE_URL = 'https://tempmailpk.com';
const DEFAULT_IMAGE = `${SITE_URL}/pwa-512x512.png`;
const SITE_NAME = 'TempMail Pro';

/**
 * Route-to-metadata registry with exact length discipline:
 * - Titles: 30 - 60 characters
 * - Meta descriptions: 120 - 160 characters
 * - Canonical URLs: Exact, trailing-slash consistent, absolute https URLs
 */
const ROUTE_SEO_REGISTRY = {
  '/': {
    title: 'TempMail Pro – Free Multi-Inbox Temp Email & Custom Expiry',
    description: 'Create free temporary email addresses with multiple inboxes, custom expiry, and instant OTP detection. Protect your real inbox with TempMail Pro.',
    canonical: `${SITE_URL}/`,
    ogType: 'website',
  },
  '/app': {
    title: 'TempMail Pro App – Free Disposable Multi-Inbox Workspace',
    description: 'Generate instant disposable email inboxes with custom domains, fast OTP auto-detection, and no sign-in required. Access your temp mailbox online.',
    canonical: `${SITE_URL}/app`,
    ogType: 'website',
    schema: {
      '@type': 'SoftwareApplication',
      name: 'TempMail Pro Web Application',
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'All Modern Web Browsers',
      url: `${SITE_URL}/app`,
      description: 'Free disposable temporary email application with multi-inbox management, custom durations, and instant OTP code detection.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },
  '/blog': {
    title: 'TempMail Pro Blog – Disposable Email Privacy & Security Guides',
    description: 'Explore expert guides on temporary disposable emails, spam protection, cybersecurity, and online privacy. Learn how to keep your personal email safe.',
    canonical: `${SITE_URL}/blog`,
    ogType: 'blog',
    schema: {
      '@type': 'Blog',
      name: 'TempMail Pro Blog',
      url: `${SITE_URL}/blog`,
      description: 'Expert guides on temporary emails, online privacy, and protecting your personal inbox from marketing spam.',
    },
  },
  '/privacy-stack': {
    title: 'Privacy Stack – No-Sign-In Disposable Email Security',
    description: 'Learn how TempMail Pro protects your inbox with auto-purging temporary mailboxes and token-isolated inboxes. No sign-in required.',
    canonical: `${SITE_URL}/privacy-stack`,
    ogType: 'article',
  },
  '/privacy': {
    title: 'Privacy Policy – TempMail Pro Email Protection',
    description: 'Read the official TempMail Pro privacy policy. It does not sell or store inbox data for advertising; infrastructure providers may see connection metadata.',
    canonical: `${SITE_URL}/privacy`,
    ogType: 'article',
  },
  '/about': {
    title: 'About TempMail Pro – Free Multi-Inbox Disposable Email',
    description: 'Discover TempMail Pro, the fast and free temporary email platform built to safeguard personal inboxes against marketing spam and trackers.',
    canonical: `${SITE_URL}/about`,
    ogType: 'website',
  },
};

/**
 * Format string to optimal 120 - 160 characters description
 */
function normalizeDescription(desc, fallback) {
  const text = (desc || fallback || '').trim();
  if (text.length >= 120 && text.length <= 160) {
    return text;
  }
  if (text.length > 160) {
    return text.slice(0, 157).trim() + '…';
  }
  // If shorter than 120, add value-reinforcing phrase
  const padded = `${text} Protect your real inbox with free multi-inbox disposable emails.`;
  return padded.length > 160 ? padded.slice(0, 157) + '…' : padded;
}

export default function RouteSeoManager() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/+$/, '') || '/';

  const seoData = useMemo(() => {
    // 1. Direct match in registry
    if (ROUTE_SEO_REGISTRY[pathname]) {
      return {
        ...ROUTE_SEO_REGISTRY[pathname],
        is404: false,
      };
    }

    // 2. Dynamic Blog Article match (/blog/:slug)
    if (pathname.startsWith('/blog/')) {
      const slug = pathname.replace('/blog/', '');
      const article = (articles || []).find((a) => a.slug === slug);

      if (article) {
        const articleTitle = article.title
          ? `${article.title} | TempMail Pro`
          : `${slug.replace(/-/g, ' ')} | TempMail Pro Blog`;

        const articleDesc = normalizeDescription(
          article.description,
          'Read this in-depth guide on temporary disposable email security, spam protection, and privacy practices.'
        );

        return {
          title: articleTitle,
          description: articleDesc,
          canonical: `${SITE_URL}/blog/${slug}`,
          ogType: 'article',
          isArticle: true,
          articleDate: article.date,
          articleTitle: article.title,
          is404: false,
          schema: {
            '@type': 'BlogPosting',
            '@id': `${SITE_URL}/blog/${slug}#article`,
            headline: article.title,
            description: articleDesc,
            datePublished: article.date,
            dateModified: article.date,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/blog/${slug}`,
            },
          },
        };
      }
    }

    // 3. Fallback / 404 Route — a 404 must have NO canonical (canonicalising
    // a 404 to the homepage confuses indexing).
    return {
      title: 'Page Not Found (404) | TempMail Pro',
      description: 'The requested page could not be found. Return to TempMail Pro for free disposable temporary email addresses and multi-inbox management.',
      canonical: undefined,
      ogType: 'website',
      is404: true,
    };
  }, [pathname]);

  const {
    title,
    description,
    canonical,
    ogType,
    isArticle,
    articleDate,
    is404,
    schema,
  } = seoData;

  // Build JSON-LD structured data payload
  const structuredData = useMemo(() => {
    const graph = [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        sameAs: [
          'https://facebook.com/tempmailpk',
          'https://x.com/tempmailpk',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@tempmailpk.com',
          contactType: 'customer service',
          availableLanguage: ['English'],
        },
      },
    ];

    if (schema) {
      graph.push(schema);
    }

    if (isArticle) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${SITE_URL}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: canonical,
          },
        ],
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  }, [schema, isArticle, title, canonical]);

  return (
    <Helmet prioritizeSeoTags>
      {/* Primary HTML Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots Directive */}
      {is404 ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* OpenGraph / Facebook */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType || 'website'} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_IMAGE} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@tempmailpk" />
      {canonical && <meta name="twitter:url" content={canonical} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      {/* Article Specific OpenGraph Metadata */}
      {isArticle && articleDate && (
        <meta property="article:published_time" content={articleDate} />
      )}

      {/* Structured Data Graph */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
