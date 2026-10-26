import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageNavbar from './PageNavbar';
import Footer from './Footer';
import AppIcon from './AppIcon';
import { AFFILIATE_REL, getAffiliateLink } from '../utils/affiliateLinks';
import { trackAffiliateClick, trackPlacementClick } from '../utils/affiliateTracking';

const STORAGE_KEY = 'affiliateClickEvents';
const PROGRESS_KEY = 'privacyStackProgressByIntent';

const INTENT_OPTIONS = [
  { key: 'signup', label: 'Signup and Trials', description: 'Start with inbox protection first.' },
  { key: 'otp', label: 'OTP or WhatsApp', description: 'Phone layer first, then inbox.' },
  { key: 'security', label: 'Privacy and Security', description: 'Network layer first, then identity layers.' },
];

const SHIELD_MAP = {
  email: {
    key: 'email',
    iconClass: 'fas fa-envelope-open-text',
    eyebrow: 'Email Shield',
    title: 'TempMail Pro',
    description: 'Stop spam before it reaches your real inbox and separate risky signups from accounts you care about.',
    bullets: ['Temporary inboxes', 'Multiple addresses', 'Custom aliases', 'Zero registration'],
    accentClass: 'privacy-stack__panel--email',
  },
  phone: {
    key: 'phone',
    iconClass: 'fas fa-mobile-screen-button',
    eyebrow: 'Phone Shield',
    title: 'Yesim',
    description: 'Add a separate number or travel data line when signups, OTPs, or marketplace deals should not touch your real phone.',
    bullets: ['Virtual numbers', 'Travel eSIM', 'Separate identity', '200+ destinations'],
    accentClass: 'privacy-stack__panel--phone',
  },
  network: {
    key: 'network',
    iconClass: 'fas fa-shield-halved',
    eyebrow: 'Network Shield',
    title: 'NordVPN + NordPass',
    description: 'Keep browsing private, lock down passwords, and reduce account takeover risk when you move beyond disposable email.',
    bullets: ['Encrypted browsing', 'Public Wi-Fi protection', 'Password vault', 'Threat protection'],
    accentClass: 'privacy-stack__panel--network',
  },
};

const FLOW_BY_INTENT = {
  signup: ['email', 'phone', 'network'],
  otp: ['phone', 'email', 'network'],
  security: ['network', 'email', 'phone'],
};

const exposurePoints = [
  'Email address reuse across low-trust signups',
  'Phone number exposure during OTP verification',
  'IP address leakage on public or shared networks',
  'Weak password habits across throwaway accounts',
];

const protectionPoints = [
  'Disposable inboxes isolate spam and tracking',
  'Virtual numbers reduce personal phone exposure',
  'VPN protection hides IP and encrypts sessions',
  'Password management improves account hygiene',
];

function detectIntent(searchValue) {
  const params = new URLSearchParams(searchValue);
  const fromParam = (params.get('intent') || '').toLowerCase();
  const ref = document.referrer.toLowerCase();
  const queryText = [
    params.get('q') || '',
    params.get('query') || '',
    params.get('source') || '',
    fromParam,
    ref,
  ].join(' ').toLowerCase();

  if (fromParam === 'otp' || queryText.includes('otp') || queryText.includes('whatsapp') || queryText.includes('sms')) {
    return 'otp';
  }

  if (fromParam === 'security' || queryText.includes('security') || queryText.includes('vpn') || queryText.includes('privacy')) {
    return 'security';
  }

  return 'signup';
}

function readClickEvents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readProgressByIntent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgressByIntent(progressValue) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressValue));
  } catch {
    // Ignore storage write failures.
  }
}

function aggregateByField(events, fieldName, limit = 5) {
  const counter = {};

  events.forEach((event) => {
    const key = event[fieldName] || 'unknown';
    counter[key] = (counter[key] || 0) + 1;
  });

  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function formatLastSeen(timestampValue) {
  if (!timestampValue) {
    return 'No click data yet';
  }

  const parsed = new Date(timestampValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'No click data yet';
  }

  return `${parsed.toLocaleDateString('en-US')} ${parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function PrivacyStack() {
  const location = useLocation();
  const [intent, setIntent] = useState('signup');
  const [events, setEvents] = useState([]);
  const [progressByIntent, setProgressByIntent] = useState(() => readProgressByIntent());
  const [showDebug, setShowDebug] = useState(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return params.get('debug') === 'true';
  });

  const yesimHref = getAffiliateLink('yesim', 'stack_phone_yesim');
  const nordVpnHeroHref = getAffiliateLink('nordvpn', 'stack_hero_nord');
  const nordVpnShieldHref = getAffiliateLink('nordvpn', 'stack_network_nordvpn');
  const nordPassShieldHref = getAffiliateLink('nordpass', 'stack_network_nordpass');

  useEffect(() => {
    setIntent(detectIntent(location.search));
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowDebug(params.get('debug') === 'true');
  }, [location.search]);

  useEffect(() => {
    const refreshEvents = () => setEvents(readClickEvents());
    refreshEvents();

    window.addEventListener('affiliate-click', refreshEvents);
    window.addEventListener('placement-click', refreshEvents);

    return () => {
      window.removeEventListener('affiliate-click', refreshEvents);
      window.removeEventListener('placement-click', refreshEvents);
    };
  }, []);

  useEffect(() => {
    writeProgressByIntent(progressByIntent);
  }, [progressByIntent]);

  const orderedShields = useMemo(
    () => FLOW_BY_INTENT[intent].map((key) => SHIELD_MAP[key]),
    [intent]
  );

  const completedSteps = progressByIntent[intent] || [];

  const currentStepIndex = useMemo(
    () => orderedShields.findIndex((card) => !completedSteps.includes(card.key)),
    [orderedShields, completedSteps]
  );

  const activeStep = useMemo(() => {
    if (orderedShields.length === 0) {
      return null;
    }

    if (currentStepIndex === -1) {
      return orderedShields[orderedShields.length - 1];
    }

    return orderedShields[currentStepIndex];
  }, [orderedShields, currentStepIndex]);

  const stickyPrefix = useMemo(() => {
    if (currentStepIndex === -1) {
      return 'Path Completed';
    }

    if (currentStepIndex === 0) {
      return 'Step 1 Ready';
    }

    if (currentStepIndex === orderedShields.length - 1) {
      return 'Final Layer';
    }

    return 'Next';
  }, [currentStepIndex, orderedShields.length]);

  const dashboardData = useMemo(() => {
    const stackEvents = events.filter((event) => (event.page || '').includes('/privacy-stack'));
    const affiliateEvents = events.filter((event) => event.type === 'affiliate_click');
    const placementEvents = events.filter((event) => event.type === 'placement_click');

    return {
      totalClicks: events.length,
      stackClicks: stackEvents.length,
      affiliateClicks: affiliateEvents.length,
      placementClicks: placementEvents.length,
      topPlacements: aggregateByField(events, 'placement', 5),
      topPartners: aggregateByField(affiliateEvents, 'partner', 4),
      latestClickAt: formatLastSeen(events[events.length - 1]?.ts),
    };
  }, [events]);

  const handleInternalClick = (placement, href, label) => {
    trackPlacementClick({
      placement,
      href,
      label,
      source: 'privacy-stack',
    });
  };

  const handleAffiliateClick = (partner, placement, href, label) => {
    trackAffiliateClick({
      partner,
      placement,
      href,
      source: 'privacy-stack',
    });

    trackPlacementClick({
      placement,
      href,
      label,
      partner,
      source: 'privacy-stack',
    });
  };

  const handleIntentSelect = (nextIntent) => {
    setIntent(nextIntent);

    trackPlacementClick({
      placement: 'stack_intent_select',
      href: `/privacy-stack?intent=${nextIntent}`,
      label: `intent_${nextIntent}`,
      source: 'privacy-stack',
    });
  };

  const markStepCompleted = (stepKey) => {
    setProgressByIntent((previous) => {
      const existing = previous[intent] || [];

      if (existing.includes(stepKey)) {
        return previous;
      }

      return {
        ...previous,
        [intent]: [...existing, stepKey],
      };
    });
  };

  const resetCurrentIntentProgress = () => {
    setProgressByIntent((previous) => ({
      ...previous,
      [intent]: [],
    }));

    trackPlacementClick({
      placement: 'stack_sticky_reset',
      href: '#privacy-stack-shields',
      label: `reset_${intent}`,
      source: 'privacy-stack',
    });
  };

  return (
    <div className="privacy-stack-page">
      <PageNavbar />
      <Helmet>
        <title>Privacy Stack - Protect Email, Phone & Network | TempMail Pro</title>
        <meta
          name="description"
          content="Build a full privacy stack with TempMail Pro, Yesim, NordVPN, and NordPass. Protect your email, phone number, IP address, and password habits in one workflow."
        />
        <meta
          name="keywords"
          content="privacy stack, temp mail, virtual number, VPN, NordVPN, NordPass, Yesim, email privacy, IP protection"
        />
        <link rel="canonical" href="https://tempmailpk.com/privacy-stack" />
        <meta property="og:title" content="Privacy Stack - Protect Email, Phone & Network | TempMail Pro" />
        <meta
          property="og:description"
          content="Three shields, one mission: protect your inbox, phone number, and network identity with a practical privacy stack."
        />
        <meta property="og:url" content="https://tempmailpk.com/privacy-stack" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://tempmailpk.com/images/temp-mail-promo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Stack - Protect Email, Phone & Network | TempMail Pro" />
        <meta
          name="twitter:description"
          content="Use TempMail Pro as your privacy gateway, then extend protection with virtual numbers, VPN, and password management."
        />
        <meta name="twitter:image" content="https://tempmailpk.com/images/temp-mail-promo.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Privacy Stack',
            url: 'https://tempmailpk.com/privacy-stack',
            description: 'A privacy workflow that combines temporary email, virtual numbers, VPN protection, and password hygiene.',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tempmailpk.com/' },
                { '@type': 'ListItem', position: 2, name: 'Privacy Stack', item: 'https://tempmailpk.com/privacy-stack' },
              ],
            },
          })}
        </script>
      </Helmet>

      <main className="privacy-stack">
        <section className="privacy-stack__hero">
          <div className="container privacy-stack__hero-grid">
            <div className="privacy-stack__hero-copy">
              <span className="privacy-stack__eyebrow">Privacy by Design</span>
              <h1>Protect Your Identity Layer by Layer</h1>
              <p className="privacy-stack__lead">
                Every signup is a potential exposure: your inbox gets spam, your phone gets OTPs from forgotten accounts, your IP gets logged, and your passwords get reused. 
                <strong>Build a complete privacy defense.</strong> Start with temporary email, extend with virtual numbers and network protection.
              </p>
              <div className="privacy-stack__hero-actions">
                <Link
                  to="/app"
                  className="btn btn-primary btn-lg"
                  onClick={() => handleInternalClick('stack_email_internal', '/app', 'Start With Free Temp Email')}
                >
                  <AppIcon iconClass="fas fa-envelope me-2" />
                  Start With Free Temp Email
                </Link>
                <a href="#privacy-stack-shields" className="privacy-stack__secondary-btn">
                  <AppIcon iconClass="fas fa-arrow-down me-2" />
                  See All Layers
                </a>
              </div>
            </div>

            <aside className="privacy-stack__hero-card">
              <div className="privacy-stack__signal">
                <span>Privacy Gateway</span>
                <strong>TempMail Pro</strong>
              </div>
              <ul className="privacy-stack__signal-list">
                <li><AppIcon iconClass="fas fa-check-circle" /> Email shield online</li>
                <li><AppIcon iconClass="fas fa-check-circle" /> Phone shield optional</li>
                <li><AppIcon iconClass="fas fa-check-circle" /> Network shield recommended</li>
              </ul>
              <div className="privacy-stack__hero-card-cta">
                <a
                  href={nordVpnHeroHref}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  className="btn btn-light"
                  onClick={() => handleAffiliateClick('nordvpn', 'stack_hero_nord', nordVpnHeroHref, 'Hide My IP')}
                >
                  <AppIcon iconClass="fas fa-shield-alt me-2" />
                  Hide My IP
                </a>
              </div>
              <p className="privacy-stack__microcopy">Optional external tools. TempMail Pro and partner services are separate products.</p>
            </aside>
          </div>
        </section>

        <section className="privacy-stack__social-proof">
          <div className="container">
            <div className="privacy-stack__proof-grid">
              <article className="privacy-stack__proof-card">
                <strong className="privacy-stack__proof-number">1.2M+</strong>
                <p>Temporary Emails Generated</p>
              </article>
              <article className="privacy-stack__proof-card">
                <strong className="privacy-stack__proof-number">14K+</strong>
                <p>Privacy-Focused Users</p>
              </article>
              <article className="privacy-stack__proof-card">
                <strong className="privacy-stack__proof-number">42+</strong>
                <p>Countries Served</p>
              </article>
            </div>
          </div>
        </section>

        <section className="privacy-stack__start-here">
          <div className="container">
            <div className="privacy-stack__section-head">
              <span className="privacy-stack__eyebrow">Start Here</span>
              <h2>Where does your privacy challenge start?</h2>
            </div>
            <div className="privacy-stack__intent-picker" role="group" aria-label="Select your privacy intent">
              {INTENT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`privacy-stack__intent-btn ${intent === option.key ? 'is-active' : ''}`}
                  onClick={() => handleIntentSelect(option.key)}
                >
                  <span className="privacy-stack__intent-title">{option.label}</span>
                  <span className="privacy-stack__intent-text">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy-stack-shields" className="privacy-stack__shields">
          <div className="container">
            <div className="privacy-stack__section-head">
              <span className="privacy-stack__eyebrow">Recommended Path</span>
              <h2>Layer your defenses in the right order</h2>
              <p>
                Your path: <strong>{INTENT_OPTIONS.find((option) => option.key === intent)?.label}</strong>
              </p>
            </div>

            <div className="privacy-stack__panel-grid">
              {orderedShields.map((card, index) => (
                <article key={card.title} className={`privacy-stack__panel ${card.accentClass}`}>
                  <div className="privacy-stack__step-head">
                    <span className="privacy-stack__step-badge">Step {index + 1}</span>
                    <span className="privacy-stack__panel-icon" aria-hidden="true">
                      <AppIcon iconClass={card.iconClass} />
                    </span>
                    <span className="privacy-stack__panel-eyebrow">{card.eyebrow}</span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <ul className="privacy-stack__bullet-list">
                    {card.bullets.map((bullet) => (
                      <li key={bullet}>
                        <AppIcon iconClass="fas fa-check" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {card.key === 'email' && (
                    <Link
                      to="/app"
                      className="privacy-stack__panel-btn"
                      onClick={() => {
                        markStepCompleted('email');
                        handleInternalClick('stack_email_internal', '/app', 'Generate Free Email');
                      }}
                    >
                      Generate Free Email
                      <AppIcon iconClass="fas fa-arrow-right ms-2" />
                    </Link>
                  )}

                  {card.key === 'phone' && (
                    <a
                      href={yesimHref}
                      target="_blank"
                      rel={AFFILIATE_REL}
                      className="privacy-stack__panel-btn"
                      onClick={() => {
                        markStepCompleted('phone');
                        handleAffiliateClick('yesim', 'stack_phone_yesim', yesimHref, 'Protect My Number');
                      }}
                    >
                      Protect My Number
                      <AppIcon iconClass="fas fa-arrow-right ms-2" />
                    </a>
                  )}

                  {card.key === 'network' && (
                    <div className="privacy-stack__dual-actions">
                      <a
                        href={nordVpnShieldHref}
                        target="_blank"
                        rel={AFFILIATE_REL}
                        className="privacy-stack__panel-btn"
                        onClick={() => {
                          markStepCompleted('network');
                          handleAffiliateClick('nordvpn', 'stack_network_nordvpn', nordVpnShieldHref, 'Hide My IP');
                        }}
                      >
                        Hide My IP
                        <AppIcon iconClass="fas fa-arrow-right ms-2" />
                      </a>
                      <a
                        href={nordPassShieldHref}
                        target="_blank"
                        rel={AFFILIATE_REL}
                        className="privacy-stack__panel-link"
                        onClick={() => handleAffiliateClick('nordpass', 'stack_network_nordpass', nordPassShieldHref, 'Protect Passwords')}
                      >
                        Protect Passwords
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {showDebug && (
          <section className="privacy-stack__observability">
            <div className="container">
              <div className="privacy-stack__section-head">
                <span className="privacy-stack__eyebrow">Observability Layer</span>
                <h2>Conversion signals from your current click stream</h2>
                <p>
                  This dashboard reads from local click events so you can spot top placements and partner demand before rolling out server-side analytics.
                </p>
              </div>

              <div className="privacy-stack__metrics-grid">
                <article className="privacy-stack__metric-card">
                  <span>Total Click Events</span>
                  <strong>{dashboardData.totalClicks}</strong>
                </article>
                <article className="privacy-stack__metric-card">
                  <span>Privacy Stack Clicks</span>
                  <strong>{dashboardData.stackClicks}</strong>
                </article>
                <article className="privacy-stack__metric-card">
                  <span>Affiliate Clicks</span>
                  <strong>{dashboardData.affiliateClicks}</strong>
                </article>
                <article className="privacy-stack__metric-card">
                  <span>Placement Clicks</span>
                  <strong>{dashboardData.placementClicks}</strong>
                </article>
              </div>

              <div className="privacy-stack__insight-grid">
                <article className="privacy-stack__insight-card">
                  <h3>Top Placements</h3>
                  <ul>
                    {dashboardData.topPlacements.length > 0 ? dashboardData.topPlacements.map((entry) => (
                      <li key={entry.label}>
                        <span>{entry.label}</span>
                        <strong>{entry.count}</strong>
                      </li>
                    )) : <li><span>No placement clicks yet</span><strong>0</strong></li>}
                  </ul>
                </article>

                <article className="privacy-stack__insight-card">
                  <h3>Top Outbound Sources</h3>
                  <ul>
                    {dashboardData.topPartners.length > 0 ? dashboardData.topPartners.map((entry) => (
                      <li key={entry.label}>
                        <span>{entry.label}</span>
                        <strong>{entry.count}</strong>
                      </li>
                    )) : <li><span>No affiliate clicks yet</span><strong>0</strong></li>}
                  </ul>
                </article>

                <article className="privacy-stack__insight-card">
                  <h3>Last Event</h3>
                  <p>{dashboardData.latestClickAt}</p>
                  <small>Tracked from browser localStorage key: {STORAGE_KEY}</small>
                </article>
              </div>
            </div>
          </section>
        )}

        <section className="privacy-stack__funnel">
          <div className="container privacy-stack__funnel-grid">
            <div className="privacy-stack__funnel-copy">
              <span className="privacy-stack__eyebrow">Exposure Funnel</span>
              <h2>One signup can expose more than your inbox</h2>
              <p>
                Disposable email solves the first layer. The privacy stack extends that protection when a signup also wants your phone,
                your location trail, or clues about how you secure accounts.
              </p>
            </div>

            <div className="privacy-stack__funnel-card privacy-stack__funnel-card--risk">
              <h3>Exposure Points</h3>
              <ul className="privacy-stack__checklist privacy-stack__checklist--risk">
                {exposurePoints.map((item) => (
                  <li key={item}>
                    <AppIcon iconClass="fas fa-times-circle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="privacy-stack__funnel-card privacy-stack__funnel-card--safe">
              <h3>Stack Protection</h3>
              <ul className="privacy-stack__checklist privacy-stack__checklist--safe">
                {protectionPoints.map((item) => (
                  <li key={item}>
                    <AppIcon iconClass="fas fa-check-circle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="privacy-stack__bridge">
          <div className="container">
            <div className="privacy-stack__bridge-card">
              <div>
                <span className="privacy-stack__eyebrow">You're Almost Fully Protected</span>
                <h2>One tool isn't enough. The full stack is.</h2>
                <p>
                  A temporary inbox stops spam. A virtual number protects your identity during OTP and verification flows. A VPN hides your IP and encrypts your connection. Together, they close every gap that a single signup can open.
                </p>
              </div>
              <div className="privacy-stack__bridge-actions">
                <Link
                  to="/blog/temporary-email-vs-email-alias-for-privacy-2026"
                  className="privacy-stack__secondary-btn privacy-stack__secondary-btn--dark"
                  onClick={() => handleInternalClick('blog_privacy_stack', '/blog/temporary-email-vs-email-alias-for-privacy-2026', 'Read Privacy Guide')}
                >
                  Read Privacy Guide
                </Link>
                <Link
                  to="/app"
                  className="btn btn-primary"
                  onClick={() => handleInternalClick('stack_email_internal', '/app', 'Launch TempMail Pro')}
                >
                  Launch TempMail Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-stack__trust-bar" aria-label="Privacy trust signals">
          <div className="container">
            <p>
              No signup required • No inbox storage • Instant access • Trusted by privacy-focused users in 42+ countries
            </p>
          </div>
        </section>

        <section className="privacy-stack__sticky-cta" aria-live="polite" aria-label="Current path progress">
          <div className="privacy-stack__sticky-inner">
            <p className="privacy-stack__sticky-text">
              <span className="privacy-stack__sticky-prefix">{stickyPrefix}</span>
              <span className="privacy-stack__sticky-title">
                {activeStep ? `${activeStep.eyebrow} - ${activeStep.title}` : 'Privacy Path'}
              </span>
            </p>

            {currentStepIndex === -1 ? (
              <button type="button" className="privacy-stack__sticky-btn privacy-stack__sticky-btn--reset" onClick={resetCurrentIntentProgress}>
                Restart Path
              </button>
            ) : (
              <>
                {activeStep?.key === 'email' && (
                  <Link
                    to="/app"
                    className="privacy-stack__sticky-btn"
                    onClick={() => {
                      markStepCompleted('email');
                      handleInternalClick('stack_sticky_email', '/app', 'Generate Free Email');
                    }}
                  >
                    <AppIcon iconClass="fas fa-envelope me-2" />
                    Generate Free Email
                  </Link>
                )}

                {activeStep?.key === 'phone' && (
                  <a
                    href={yesimHref}
                    target="_blank"
                    rel={AFFILIATE_REL}
                    className="privacy-stack__sticky-btn"
                    onClick={() => {
                      markStepCompleted('phone');
                      handleAffiliateClick('yesim', 'stack_sticky_phone', yesimHref, 'Protect My Number');
                    }}
                  >
                    <AppIcon iconClass="fas fa-mobile-screen-button me-2" />
                    Protect My Number
                  </a>
                )}

                {activeStep?.key === 'network' && (
                  <a
                    href={nordVpnShieldHref}
                    target="_blank"
                    rel={AFFILIATE_REL}
                    className="privacy-stack__sticky-btn"
                    onClick={() => {
                      markStepCompleted('network');
                      handleAffiliateClick('nordvpn', 'stack_sticky_network', nordVpnShieldHref, 'Hide My IP');
                    }}
                  >
                    <AppIcon iconClass="fas fa-shield-halved me-2" />
                    Hide My IP
                  </a>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
