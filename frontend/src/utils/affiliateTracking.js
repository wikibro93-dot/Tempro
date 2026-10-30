const STORAGE_KEY = 'affiliateClickEvents';
const MAX_EVENTS = 200;

function persistEvent(event) {
  try {
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const next = [...previous, event].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors to keep CTA links working.
  }
}

export function trackPlacementClick({ placement, href = '', source = '', label = '', partner = '' }) {
  const event = {
    type: 'placement_click',
    placement,
    href,
    source,
    label,
    partner,
    page: window.location.pathname,
    referrer: document.referrer || '',
    ts: new Date().toISOString(),
  };

  persistEvent(event);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('placement-click', { detail: event }));

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'placement_click', {
        placement,
        label,
        partner,
      });
    }

    if (typeof window.plausible === 'function') {
      window.plausible('Placement Click', {
        props: {
          placement,
          label,
          partner,
        },
      });
    }
  }
}

export function trackAffiliateClick({ partner, placement, href, articleSlug = '', source = '' }) {
  const event = {
    type: 'affiliate_click',
    partner,
    placement,
    href,
    articleSlug,
    source,
    page: window.location.pathname,
    referrer: document.referrer || '',
    ts: new Date().toISOString(),
  };

  persistEvent(event);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('affiliate-click', { detail: event }));

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        partner,
        placement,
        article_slug: articleSlug,
      });
    }

    if (typeof window.plausible === 'function') {
      window.plausible('Affiliate Click', {
        props: {
          partner,
          placement,
          article_slug: articleSlug,
        },
      });
    }
  }
}
