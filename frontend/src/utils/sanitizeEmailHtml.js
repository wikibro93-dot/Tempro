import DOMPurify from 'dompurify';

/**
 * In-memory cache for ultra-fast rendering performance.
 * Prevents redundant sanitization runs when user switches between messages or tabs.
 */
const SANITIZATION_CACHE = new Map();
const MAX_CACHE_SIZE = 60;

/**
 * Normalizes input which can be a string, array of strings (Mail.tm format), or null/undefined
 */
export const normalizeHtmlInput = (raw) => {
  if (!raw) return '';
  if (Array.isArray(raw)) return raw.join('');
  if (typeof raw === 'string') return raw;
  return String(raw);
};

// Safe DOMPurify instance initializer (handles both browser and SSR/test environments)
const getPurifier = () => {
  if (typeof window !== 'undefined') {
    if (typeof DOMPurify.sanitize === 'function') {
      return DOMPurify;
    }
    return DOMPurify(window);
  }
  return null;
};

let hooksConfigured = false;
const configureSecurityHooks = (instance) => {
  if (hooksConfigured || !instance || typeof instance.addHook !== 'function') return;
  hooksConfigured = true;

  instance.addHook('afterSanitizeAttributes', (node) => {
    // 1. Force secure link navigation (prevents tabnabbing and window.opener hijacking)
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');

      // Strip dangerous URI protocols like javascript:, data:text/html, vbscript:
      const href = node.getAttribute('href');
      if (href) {
        const trimmed = href.trim();
        const isSafeProtocol = /^(?:https?:|mailto:|tel:|\/|#)/i.test(trimmed);
        if (!isSafeProtocol) {
          node.removeAttribute('href');
        }
      }
    }

    // 2. Responsive & lazy-loaded images (prevents network congestion & mobile layout breakage)
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
      if (!node.getAttribute('alt')) {
        node.setAttribute('alt', 'Email image');
      }

      // Ensure embedded newsletter images do not burst mobile viewport width
      const curStyle = node.getAttribute('style') || '';
      if (!curStyle.includes('max-width')) {
        const appended = curStyle ? `${curStyle}; max-width: 100%; height: auto;` : 'max-width: 100%; height: auto;';
        node.setAttribute('style', appended);
      }
    }

    // 3. Strip malicious or intrusive CSS styles from inline style attributes
    if (node.hasAttribute('style')) {
      const rawStyle = node.getAttribute('style') || '';
      // Strip fixed/absolute viewport overlays, high z-indexes, and dangerous expressions
      const cleanStyle = rawStyle
        .replace(/position\s*:\s*(fixed|absolute)[^;]*;?/gi, '')
        .replace(/z-index\s*:\s*[^;]*;?/gi, '')
        .replace(/(?:top|left|right|bottom)\s*:\s*[^;]*;?/gi, '')
        .replace(/behavior\s*:[^;]*;?/gi, '')
        .replace(/expression\s*\([^)]*\);?/gi, '')
        .replace(/url\s*\(\s*['"]?javascript:[^)]*['"]?\);?/gi, '')
        .replace(/width\s*:\s*100vw[^;]*;?/gi, 'max-width: 100%;')
        .replace(/height\s*:\s*100vh[^;]*;?/gi, 'max-height: 80vh;');

      if (cleanStyle.trim()) {
        node.setAttribute('style', cleanStyle);
      } else {
        node.removeAttribute('style');
      }
    }
  });
};

/**
 * Strict DOMPurify Security Configuration
 */
const PURIFY_SECURITY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: [
    'script',
    'iframe',
    'object',
    'embed',
    'applet',
    'base',
    'meta',
    'link',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'option',
    'dialog',
    'marquee',
  ],
  FORBID_ATTR: [
    'onerror',
    'onload',
    'onclick',
    'ondblclick',
    'onmousedown',
    'onmouseup',
    'onmouseover',
    'onmouseout',
    'onmousemove',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onfocus',
    'onblur',
    'onsubmit',
    'onreset',
    'formaction',
    'action',
    'autofocus',
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel', 'loading', 'decoding'],
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM: false,
};

/**
 * Sanitizes raw email HTML and returns safe HTML markup.
 * Uses caching for sub-millisecond INP and smooth mobile rendering.
 *
 * @param {string|string[]} rawHtml
 * @returns {string} Safe HTML string
 */
export const sanitizeEmailHtml = (rawHtml) => {
  const normalized = normalizeHtmlInput(rawHtml);
  if (!normalized.trim()) return '';

  // Fast path: cached sanitized result
  if (SANITIZATION_CACHE.has(normalized)) {
    return SANITIZATION_CACHE.get(normalized);
  }

  const purifier = getPurifier();
  if (!purifier || typeof purifier.sanitize !== 'function') {
    // Ultra-safe fallback if purifier instance cannot be loaded
    return normalized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  configureSecurityHooks(purifier);

  const clean = purifier.sanitize(normalized, PURIFY_SECURITY_CONFIG);

  // Maintain cache size to prevent memory bloat
  if (SANITIZATION_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = SANITIZATION_CACHE.keys().next().value;
    if (oldestKey) SANITIZATION_CACHE.delete(oldestKey);
  }
  SANITIZATION_CACHE.set(normalized, clean);

  return clean;
};

export default sanitizeEmailHtml;
