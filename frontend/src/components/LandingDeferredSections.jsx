import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import AppIcon from "./AppIcon";
import WorkspaceCarousel from "./WorkspaceCarousel";

const FAQSection = lazy(() => import("./FAQSection"));
const BlogList = lazy(() => import("./BlogList"));
const YesimRecommendation = lazy(() => import("./YesimRecommendation"));

const LandingDeferredSections = () => {
  return (
    <>
      {/* Interactive App Preview Carousel Showcase */}
      <section className="app-preview-section py-5 defer-render-section" id="workspace-preview">
        <div className="container">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 mb-2 text-primary fw-semibold small text-uppercase tracking-wider">
              <AppIcon iconClass="bi bi-window-sidebar" />
              <span>Inside the Workspace</span>
            </div>
            <h2 className="fw-bold section-title display-6">Power Tools Built for Speed</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Explore how TempMail Pro works with our interactive guide. Slides automatically from left to right, or pause anytime by hovering.
            </p>
          </div>

          {/* Auto-sliding Carousel */}
          <WorkspaceCarousel />
        </div>
      </section>

      {/* Features Section with Modern Tech Hierarchy */}
      <section id="features" className="py-5 bg-light-subtle defer-render-section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 mb-2 text-primary fw-semibold small text-uppercase tracking-wider">
              <AppIcon iconClass="bi bi-shield-check" />
              <span>Engineered For Total Privacy</span>
            </div>
            <h2 className="fw-bold section-title display-6">Why Industry Professionals Choose TempMail Pro</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Built for developers, testers, shoppers, and privacy-conscious users worldwide.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border rounded-4 shadow-xs bg-surface p-3">
                <div className="card-body">
                  <div className="d-inline-flex p-3 rounded-3 bg-primary-subtle text-primary mb-3 fs-4">
                    <AppIcon iconClass="fas fa-user-shield" />
                  </div>
                  <h3 className="card-title h5 fw-bold">No Sign-In Privacy</h3>
                  <p className="card-text text-secondary small">
                    No sign-in is required, and inboxes expire automatically. TempMail Pro does not sell or store inbox data for advertising; infrastructure providers may see connection metadata — see the Privacy Policy.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 shadow-xs bg-surface p-3">
                <div className="card-body">
                  <div className="d-inline-flex p-3 rounded-3 bg-success-subtle text-success mb-3 fs-4">
                    <AppIcon iconClass="fas fa-shield-alt" />
                  </div>
                  <h3 className="card-title h5 fw-bold">100% Spam Quarantine</h3>
                  <p className="card-text text-secondary small">
                    Keep marketing spam, data broker harvesting, and untrusted newsletters quarantined away from your personal Gmail or Outlook accounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 shadow-xs bg-surface p-3">
                <div className="card-body">
                  <div className="d-inline-flex p-3 rounded-3 bg-warning-subtle text-warning mb-3 fs-4">
                    <AppIcon iconClass="fas fa-bolt" />
                  </div>
                  <h3 className="card-title h5 fw-bold">Fast Delivery Pipeline</h3>
                  <p className="card-text text-secondary small">
                    Integrated directly with the unified Mail.tm API engine to deliver OTP codes, magic links, and confirmation emails with fast, direct delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yesim Recommendation Section */}
      <Suspense fallback={<div className="landing-lazy-placeholder landing-lazy-placeholder--yesim" aria-hidden="true" />}>
        <YesimRecommendation />
      </Suspense>

      {/* How It Works with Modern Step Cards */}
      <section id="how-it-works" className="py-5 defer-render-section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 mb-2 text-primary fw-semibold small text-uppercase tracking-wider">
              <AppIcon iconClass="bi bi-gear-wide-connected" />
              <span>Effortless Workflow</span>
            </div>
            <h2 className="fw-bold section-title display-6">How It Works in 3 Simple Steps</h2>
            <p className="text-muted">Start protecting your personal email in less than 5 seconds.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-surface text-center h-100 position-relative shadow-xs">
                <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-3 fw-bold">
                  STEP 01
                </span>
                <h3 className="h5 fw-bold mb-2">Select Domain &amp; Generate</h3>
                <p className="text-secondary small mb-0">
                  Pick your preferred domain from the live domains Mail.tm currently offers and click Generate. Your inbox is created instantly on the backend.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-surface text-center h-100 position-relative shadow-xs">
                <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-3 fw-bold">
                  STEP 02
                </span>
                <h3 className="h5 fw-bold mb-2">Paste &amp; Receive Codes</h3>
                <p className="text-secondary small mb-0">
                  Use your disposable address on any registration, trial, or forum. Incoming emails and OTP codes arrive in real time.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-surface text-center h-100 position-relative shadow-xs">
                <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-3 fw-bold">
                  STEP 03
                </span>
                <h3 className="h5 fw-bold mb-2">Auto-Purge &amp; Stay Private</h3>
                <p className="text-secondary small mb-0">
                  When your timer expires, the mailbox is automatically destroyed. No digital footprints, zero marketing spam left behind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Article Section with Structured Takeaways & Callouts */}
      <section id="seo-article" className="py-5 bg-light-subtle defer-render-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title display-6">The Definitive Guide to Disposable Temporary Email</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '680px' }}>
              How disposable mailboxes safeguard your digital footprint, stop aggressive marketing trackers, and prevent account correlation.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <article className="article-content bg-surface p-4 p-md-5 rounded-4 border shadow-sm">
                <div className="p-3 mb-4 rounded-3 border-start border-4 border-primary bg-primary-subtle">
                  <h4 className="h6 fw-bold text-primary mb-1">Key Takeaway for Online Safety:</h4>
                  <p className="small mb-0 text-dark">
                    Your personal email is a permanent digital identifier tied to banking, personal messages, and cloud accounts. Exposing it to one-off web signups increases phishing risk by over 300%.
                  </p>
                </div>

                <h3 className="h5 fw-bold text-dark mt-4">Why Temporary Email Is Essential Today</h3>
                <p className="text-secondary">
                  Temporary disposable email acts as an impenetrable shield between your true identity and online services. When trying a new tool, testing a prototype, or accessing a gated whitepaper, TempMail Pro absorbs the confirmation link and subsequent marketing drip campaigns so your personal inbox remains pristine.
                </p>

                <h3 className="h5 fw-bold text-dark mt-4">What TempMail Pro Protects You From</h3>
                <ul className="text-secondary">
                  <li><strong>Aggressive Spam &amp; Newsletters:</strong> Automated marketing campaigns never touch your primary mailbox.</li>
                  <li><strong>Data Broker Harvesting:</strong> Websites that resell subscriber lists receive an expired temporary address.</li>
                  <li><strong>Credential Stuffing &amp; Correlation:</strong> Attackers cannot link disparate online signups back to a single primary identity.</li>
                  <li><strong>Phishing Lures:</strong> Suspicious messages are quarantined inside a burner mailbox with automatic deletion.</li>
                </ul>

                <h3 className="h5 fw-bold text-dark mt-4">Best Practices for Temporary Mail Usage</h3>
                <p className="text-secondary">
                  Disposable mail is optimal for trials, code receipts, coupon downloads, and forums. For permanent services such as healthcare portals, tax filings, or banking, maintain a dedicated private address. With TempMail Pro's custom duration slider, you can choose exactly how long each address remains active: 10 minutes, 1 hour, or up to 7 full days.
                </p>

                <div className="text-center mt-5">
                  <Link to="/app" className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-3">
                    <AppIcon iconClass="fas fa-envelope me-2" /> Launch Free Multi-Inbox App
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<div className="landing-lazy-placeholder" aria-hidden="true" />}>
        <FAQSection />
      </Suspense>

      {/* Blog List Section */}
      <Suspense fallback={<div className="landing-lazy-placeholder" aria-hidden="true" />}>
        <BlogList />
      </Suspense>
    </>
  );
};

export default LandingDeferredSections;
