import DOMPurify from 'dompurify';

/**
 * In-memory cache for ultra-fast rendering performance.
 * Prevents redundant sanitization runs when user switches between messages or tabs.
 */
const SANITIZATION_CACHE = new Map();
const MAX_CACHE_SIZE = 60;

/** 1x1 transparent GIF used as a stand-in for a blocked remote image. */
const TRANSPARENT_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** True when a URL would fetch from a third-party server (tracking-pixel risk). */
const isRemoteUrl = (value) => {
  if (!value) return false;
  const v = String(value).trim().toLowerCase();
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('//');
};

// Per-call state read by the DOMPurify hook. sanitize() is synchronous, so a
// module-level slot is safe: it is set immediately before each sanitize run.
let currentAllowRemoteImages = false;
let currentBlockedRemoteImages = 0;

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

      // 2b. Remote-image blocking (tracking-pixel protection). A remote
      // <img src> phones home the moment the message is opened, revealing
      // the open and the reader's IP. Block it by default: swap the src for
      // a transparent placeholder and keep the original in data-remote-src.
      // The viewer offers an explicit "Load images" opt-in per message.
      if (!currentAllowRemoteImages) {
        const src = node.getAttribute('src');
        if (src && isRemoteUrl(src)) {
          node.setAttribute('data-remote-src', src);
          node.setAttribute('src', TRANSPARENT_PLACEHOLDER);
          currentBlockedRemoteImages += 1;
        }
        const srcset = node.getAttribute('srcset');
        if (srcset && /(?:https?:)?\/\//i.test(srcset)) {
          node.setAttribute('data-remote-srcset', srcset);
          node.removeAttribute('srcset');
          if (!src || !isRemoteUrl(src)) currentBlockedRemoteImages += 1;
        }
      }
    }

    // 2c. <source> inside <picture>/<video> can also fetch a remote image.
    if (node.tagName === 'SOURCE' && !currentAllowRemoteImages) {
      const src = node.getAttribute('src');
      if (src && isRemoteUrl(src)) {
        node.setAttribute('data-remote-src', src);
        node.removeAttribute('src');
        currentBlockedRemoteImages += 1;
      }
      const srcset = node.getAttribute('srcset');
      if (srcset && /(?:https?:)?\/\//i.test(srcset)) {
        node.setAttribute('data-remote-srcset', srcset);
        node.removeAttribute('srcset');
        if (!src || !isRemoteUrl(src)) currentBlockedRemoteImages += 1;
      }
    }

    // 2d. <video poster> can fetch a remote image on render.
    if (node.tagName === 'VIDEO' && !currentAllowRemoteImages) {
      const poster = node.getAttribute('poster');
      if (poster && isRemoteUrl(poster)) {
        node.setAttribute('data-remote-poster', poster);
        node.removeAttribute('poster');
        currentBlockedRemoteImages += 1;
      }
    }

    // 3. Strip malicious or intrusive CSS styles from inline style attributes
    if (node.hasAttribute('style')) {
      const rawStyle = node.getAttribute('style') || '';
      // Strip fixed/absolute viewport overlays, high z-indexes, and dangerous expressions
      let cleanStyle = rawStyle
        .replace(/position\s*:\s*(fixed|absolute)[^;]*;?/gi, '')
        .replace(/z-index\s*:\s*[^;]*;?/gi, '')
        .replace(/(?:top|left|right|bottom)\s*:\s*[^;]*;?/gi, '')
        .replace(/behavior\s*:[^;]*;?/gi, '')
        .replace(/expression\s*\([^)]*\);?/gi, '')
        .replace(/url\s*\(\s*['"]?javascript:[^)]*['"]?\);?/gi, '')
        .replace(/width\s*:\s*100vw[^;]*;?/gi, 'max-width: 100%;')
        .replace(/height\s*:\s*100vh[^;]*;?/gi, 'max-height: 80vh;');

      // 3b. A tracking pixel can also hide in background-image. When remote
      // images are blocked, drop any background/background-image declaration
      // whose url() points at a remote host. data: URIs are inline and safe,
      // so they are left alone. (Skipped once the user taps "Load images".)
      if (!currentAllowRemoteImages) {
        cleanStyle = cleanStyle.replace(
          /background(?:-image)?\s*:[^;]*?url\s*\(\s*['"]?(?:https?:)?\/\/[^)]*\)[^;]*;?/gi,
          ''
        );
      }

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
 * Sanitizes raw email HTML and returns safe HTML markup plus the number of
 * remote images that were blocked (tracking-pixel protection).
 * Uses caching for sub-millisecond INP and smooth mobile rendering.
 * The cache key includes the remote-images flag, so the blocked and the
 * explicitly-allowed renderings never collide.
 *
 * @param {string|string[]} rawHtml
 * @param {{ allowRemoteImages?: boolean }} [options] - when true, remote
 *   <img src> URLs are kept (the user tapped "Load images" for this message).
 *   Defaults to false: remote images are replaced by a transparent
 *   placeholder and counted in blockedRemoteImages.
 * @returns {{ html: string, blockedRemoteImages: number }}
 */
const sanitizeInternal = (rawHtml, options = {}) => {
  const normalized = normalizeHtmlInput(rawHtml);
  if (!normalized.trim()) return { html: '', blockedRemoteImages: 0 };

  const allowRemoteImages = Boolean(options.allowRemoteImages);
  const cacheKey = `${allowRemoteImages ? 'allow' : 'block'}:${normalized}`;

  // Fast path: cached sanitized result
  if (SANITIZATION_CACHE.has(cacheKey)) {
    return SANITIZATION_CACHE.get(cacheKey);
  }

  const purifier = getPurifier();
  if (!purifier || typeof purifier.sanitize !== 'function') {
    // Ultra-safe fallback if purifier instance cannot be loaded: refuse to
    // render partially-cleaned HTML at all.
    return { html: '', blockedRemoteImages: 0 };
  }

  configureSecurityHooks(purifier);

  // Hand the per-call option to the hook (sanitize is synchronous).
  currentAllowRemoteImages = allowRemoteImages;
  currentBlockedRemoteImages = 0;
  const clean = purifier.sanitize(normalized, PURIFY_SECURITY_CONFIG);
  const result = { html: clean, blockedRemoteImages: currentBlockedRemoteImages };

  // Maintain cache size to prevent memory bloat
  if (SANITIZATION_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = SANITIZATION_CACHE.keys().next().value;
    if (oldestKey) SANITIZATION_CACHE.delete(oldestKey);
  }
  SANITIZATION_CACHE.set(cacheKey, result);

  return result;
};

/**
 * Sanitizes raw email HTML and returns safe HTML markup (string).
 * Remote images are blocked by default; pass { allowRemoteImages: true }
 * once the user has tapped "Load images" for this message.
 */
export const sanitizeEmailHtml = (rawHtml, options = {}) =>
  sanitizeInternal(rawHtml, options).html;

/** Same as sanitizeEmailHtml, but also reports how many remote images were blocked. */
export const sanitizeEmailHtmlWithMeta = (rawHtml, options = {}) =>
  sanitizeInternal(rawHtml, options);

export default sanitizeEmailHtml;
