import React, { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { Helmet } from "react-helmet-async";
import AppIcon from "./AppIcon";
import HomepageHeroConsole from "./HomepageHeroConsole";
import CompetitorComparison from "./CompetitorComparison";
import PWAInstallButton from "./PWAInstallButton";

const LandingDeferredSections = lazy(() => import("./LandingDeferredSections.jsx"));

const deferredSectionIds = new Set(["comparison", "features", "how-it-works", "seo-article", "faq", "blog"]);

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id) => {
    const performScroll = () => {
      const element = document.getElementById(id);
      if (!element) {
        return false;
      }
      element.scrollIntoView({ behavior: "smooth" });
      return true;
    };

    if (!performScroll() && deferredSectionIds.has(id)) {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          performScroll();
        }, 60);
      });
    }

    setMenuOpen(false);
  };

  return (
    <div className="landing-page">
      <Helmet>
        <title>TempMail Pro – Free Multi-Inbox Temp Email &amp; Custom Duration</title>
        <meta
          name="description"
          content="Create free temporary email addresses with multiple inboxes, custom expiry, and instant OTP detection. Protect your real inbox with TempMail Pro."
        />
        <meta
          name="keywords"
          content="temporary email, disposable email, temp mail, spam protection, free email service, anonymous email, tempmail, burner mail, 10 minute mail"
        />
        <link rel="canonical" href="https://tempmailpk.com/" />
        <meta property="og:title" content="TempMail Pro – Free Multi-Inbox Temp Email" />
        <meta
          property="og:description"
          content="Create free temporary email addresses with multiple inboxes, custom expiry, and instant OTP detection. Protect your real inbox with TempMail Pro."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tempmailpk.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TempMail Pro – Free Disposable Email Service" />
        <meta
          name="twitter:description"
          content="Protect your real inbox with free multi-inbox disposable emails. No logs, no sign-in."
        />

        {/* Structured Schema.org JSON-LD for rich Google indexing */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "TempMail Pro",
                "url": "https://tempmailpk.com/",
                "logo": "https://tempmailpk.com/icon-512.png",
                "sameAs": [
                  "https://facebook.com/tempmailpk",
                  "https://x.com/tempmailpk"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "support@tempmailpk.com",
                  "contactType": "customer service",
                  "availableLanguage": ["English"]
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "TempMail Pro",
                "applicationCategory": "CommunicationApplication",
                "operatingSystem": "All Web Browsers",
                "url": "https://tempmailpk.com/",
                "description": "Free disposable temporary email service with multi-inbox management, custom durations, custom usernames, and fast OTP verification delivery.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "featureList": [
                  "Multi-Inbox Tab System",
                  "Live Domain Selector",
                  "Custom Expiry Duration (10m to 7 days)",
                  "Custom Username Creation",
                  "Instant OTP Code Auto-Detection",
                  "No Sign-In Privacy Policy"
                ]
              },

            ]
          })}
        </script>
      </Helmet>

      {/* Modern High-Contrast Landing Navbar */}
      <nav className={`landing-navbar${scrolled ? " landing-navbar--scrolled" : ""}`}>
        <div className="landing-navbar__inner">
          <Link className="landing-navbar__brand" to="/">
            <span className="landing-navbar__logo-icon">
              <AppIcon iconClass="fas fa-shield-alt" />
            </span>
            <span className="landing-navbar__brand-text">
              TempMail<span className="landing-navbar__brand-accent">Pro</span>
            </span>
          </Link>

          <div className="d-flex align-items-center gap-2 d-md-none">
            <button
              className={`landing-navbar__toggler${menuOpen ? " is-open" : ""}`}
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <div className={`landing-navbar__menu${menuOpen ? " is-open" : ""}`}>
            <ul className="landing-navbar__nav">
              <li>
                <Link className="landing-navbar__link" to="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <button className="landing-navbar__link landing-navbar__link--btn" onClick={() => scrollToSection("comparison")}>
                  Comparison
                </button>
              </li>
              <li>
                <button className="landing-navbar__link landing-navbar__link--btn" onClick={() => scrollToSection("features")}>
                  Features
                </button>
              </li>
              <li>
                <button className="landing-navbar__link landing-navbar__link--btn" onClick={() => scrollToSection("how-it-works")}>
                  How It Works
                </button>
              </li>
              <li>
                <button className="landing-navbar__link landing-navbar__link--btn" onClick={() => scrollToSection("faq")}>
                  FAQ
                </button>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2 ms-md-3">
              <PWAInstallButton variant="navbar" label="Install App" />
              <Link to="/app" className="landing-navbar__cta" onClick={() => setMenuOpen(false)}>
                <AppIcon iconClass="fas fa-bolt me-1" /> Use App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* Transformational Hero Section with Embedded Instant Console */}
        <section className="hero-section hero-section--elevated">
          <div className="container landing-hero-container">
            <div className="row align-items-center g-4 g-lg-5">
              {/* Left Column: Punchy Value Proposition */}
              <div className="col-lg-6 landing-hero-content text-start">
                <div className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1 rounded-pill border bg-primary-subtle text-primary small fw-semibold">
                  <span className="eg-pulse-dot"></span>
                  <span>100% Free Multi-Inbox Temp Email</span>
                </div>

                <h1 className="hero-title landing-hero-title mb-3">
                  Disposable Email With <span className="brand-highlight">Multi-Inbox</span> Power
                </h1>

                <p className="landing-hero-lead text-secondary mb-4">
                  Generate instant temporary mailboxes, pick from the live domains Mail.tm currently offers, and receive OTP codes with fast delivery. No sign-in, completely free.
                </p>

                {/* Proof badges */}
                <div className="d-flex flex-wrap align-items-center gap-3 pt-2 text-muted small">
                  <div className="d-flex align-items-center gap-1">
                    <AppIcon iconClass="bi bi-shield-check text-success" />
                    <span>No Sign-In Required</span>
                  </div>
                  <span className="text-secondary opacity-50">·</span>
                  <div className="d-flex align-items-center gap-1">
                    <AppIcon iconClass="bi bi-lightning-charge-fill text-warning" />
                    <span>Instant OTP Delivery</span>
                  </div>
                  <span className="text-secondary opacity-50">·</span>
                  <div className="d-flex align-items-center gap-1">
                    <AppIcon iconClass="bi bi-layers-fill text-primary" />
                    <span>Multi-Inbox Tabs</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Live Email Console */}
              <div className="col-lg-6">
                <HomepageHeroConsole />
              </div>
            </div>
          </div>
        </section>

        {/* Sponsor / Monetag Ad Strip */}
        <section className="monetag-ad-section" aria-label="Sponsored content">
          <div className="container">
            <div className="monetag-ad-slot">
              <div className="monetag-ad-slot__label">Sponsored</div>
              <div className="monetag-ads" data-zone="11505330" data-ad-format="auto" aria-live="polite"></div>
            </div>
          </div>
        </section>

        {/* Competitor Comparison Section */}
        <CompetitorComparison />

        {/* Comprehensive Content Sections: Carousel, Features, How It Works, FAQ, SEO Guide */}
        <Suspense fallback={<div className="landing-lazy-placeholder landing-lazy-placeholder--deferred" aria-hidden="true" />}>
          <LandingDeferredSections />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
