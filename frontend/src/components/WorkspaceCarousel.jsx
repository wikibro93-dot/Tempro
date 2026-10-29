import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from './AppIcon';

const SLIDES = [
  {
    id: 'multi-inbox',
    step: '01',
    tag: 'Multi-Inbox Tabs',
    title: 'Parallel Inboxes & Instant Switching',
    description: 'Create and run multiple disposable inboxes simultaneously without losing session or data. Switch tabs in 1 click.',
    badge: '100% Free Feature',
    content: (
      <div className="carousel-preview-card p-3">
        <div className="d-flex align-items-center justify-content-between p-2 rounded-3 border mb-2 bg-primary-subtle border-primary-subtle">
          <div className="d-flex align-items-center gap-2 text-truncate">
            <span className="badge bg-primary rounded-circle p-2">W</span>
            <div className="text-truncate">
              <div className="fw-bold small text-dark text-truncate">waqas@example-domain</div>
              <small className="text-muted font-monospace">⏱ 23h 45m left</small>
            </div>
          </div>
          <span className="badge bg-primary text-white rounded-pill px-2">1 new</span>
        </div>

        <div className="d-flex align-items-center justify-content-between p-2 rounded-3 border mb-2 bg-body-tertiary">
          <div className="d-flex align-items-center gap-2 text-truncate">
            <span className="badge bg-secondary rounded-circle p-2">S</span>
            <div className="text-truncate">
              <div className="fw-semibold small text-dark text-truncate">shop_trial@example-domain</div>
              <small className="text-muted font-monospace">⏱ 6d 12h left</small>
            </div>
          </div>
          <span className="badge bg-light text-secondary border rounded-pill px-2">Active</span>
        </div>

        <div className="d-flex align-items-center justify-content-between p-2 rounded-3 border mb-3 bg-body-tertiary">
          <div className="d-flex align-items-center gap-2 text-truncate">
            <span className="badge bg-secondary rounded-circle p-2">T</span>
            <div className="text-truncate">
              <div className="fw-semibold small text-dark text-truncate">tester_pro@example-domain</div>
              <small className="text-muted font-monospace">⏱ 52m left</small>
            </div>
          </div>
          <span className="badge bg-light text-secondary border rounded-pill px-2">Active</span>
        </div>

        <div className="p-2 rounded-2 border border-dashed text-center small text-primary fw-semibold">
          <AppIcon iconClass="bi bi-plus-circle me-1" /> Add Another Inbox
        </div>
      </div>
    ),
  },
  {
    id: 'otp-detection',
    step: '02',
    tag: 'Smart OTP Detection',
    title: 'Zero-Click Verification Code Extraction',
    description: 'Incoming emails are automatically parsed for 4-8 digit OTP codes. Copy your code directly from the list without opening the email.',
    badge: 'Fastest Workflow',
    content: (
      <div className="carousel-preview-card p-3">
        <div className="p-2 mb-2 rounded-2 bg-light-subtle border d-flex justify-content-between align-items-center">
          <span className="small text-muted">Inbox: waqas@example-domain</span>
          <span className="badge bg-success-subtle text-success border border-success-subtle py-1">Synced</span>
        </div>

        <div className="border rounded-3 p-3 mb-3 bg-white shadow-xs">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <strong className="text-dark small">Discord Security Verification</strong>
            <small className="text-muted font-monospace">Just now</small>
          </div>
          <p className="small text-secondary mb-2">Your 6-digit verification code is below. Do not share it with anyone.</p>

          <div className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-warning-subtle border border-warning-subtle">
            <div>
              <span className="small text-muted d-block" style={{ fontSize: '0.72rem' }}>VERIFICATION CODE</span>
              <span className="fs-5 font-monospace fw-bold text-dark tracking-wider">849-204</span>
            </div>
            <span className="btn btn-sm btn-dark py-1 px-3 fw-semibold" style={{ fontSize: '0.78rem' }}>
              <AppIcon iconClass="bi bi-clipboard me-1" /> 1-Click Copy
            </span>
          </div>
        </div>

        <div className="small text-muted text-center">
          <AppIcon iconClass="bi bi-bell-fill me-1 text-warning" /> Web Audio chime plays when incoming email arrives
        </div>
      </div>
    ),
  },
  {
    id: 'domain-expiry',
    step: '03',
    tag: 'Domain & Duration Engine',
    title: 'Custom Lifespan & Live Domain Selection',
    description: 'Switch between live domains, and choose how long the address lives: 10 mins, 1 hour, 24 hours, or 7 full days.',
    badge: 'Granular Control',
    content: (
      <div className="carousel-preview-card p-3 text-start">
        <label className="small fw-semibold text-muted mb-1">Available Live Domains:</label>
        <div className="d-flex gap-2 mb-3">
          <span className="badge bg-primary py-2 px-3 fs-6">@example-domain</span>
          <span className="badge bg-light text-dark border py-2 px-3 fs-6">@example-domain</span>
        </div>

        <label className="small fw-semibold text-muted mb-1">Select Custom Lifespan:</label>
        <div className="d-flex gap-1 mb-3 flex-wrap">
          <span className="badge bg-light text-dark border py-2 px-2">10 min</span>
          <span className="badge bg-primary text-white py-2 px-3 fw-bold">1 hour</span>
          <span className="badge bg-light text-dark border py-2 px-2">24 hours</span>
          <span className="badge bg-light text-dark border py-2 px-2">7 days</span>
          <span className="badge bg-light text-dark border py-2 px-2">Custom</span>
        </div>

        <div className="p-2 mb-3 rounded-2 bg-light-subtle border small text-muted">
          <AppIcon iconClass="bi bi-shield-check text-success me-1" />
          Emails auto-purge and destroy cleanly when the countdown completes.
        </div>
      </div>
    ),
  },
  {
    id: 'split-pane',
    step: '04',
    tag: 'Desktop Master-Detail',
    title: 'Split-Pane High-Efficiency Email Reader',
    description: 'Read full formatted HTML messages and attachments on the right while continuously monitoring all inboxes on the left.',
    badge: 'Pro Productivity',
    content: (
      <div className="carousel-preview-card p-3 text-start">
        <div className="row g-2 mb-2">
          <div className="col-5 border-end pe-2">
            <div className="small fw-bold text-muted mb-1">MESSAGES (2)</div>
            <div className="p-2 rounded-2 bg-primary-subtle border border-primary-subtle mb-1">
              <div className="small fw-bold text-truncate">Stripe Payments</div>
              <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>Confirm webhook</div>
            </div>
            <div className="p-2 rounded-2 bg-body-tertiary border">
              <div className="small fw-bold text-truncate">GitHub Auth</div>
              <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>Device login code</div>
            </div>
          </div>
          <div className="col-7 ps-2">
            <div className="small fw-bold text-dark mb-1">Confirm webhook subscription</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>From: support@stripe.com</div>
            <div className="p-2 rounded-2 bg-light border mt-2" style={{ fontSize: '0.75rem' }}>
              Click here to verify your endpoint URL for live event delivery.
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
          <span className="badge bg-light text-dark border">HTML / Plain-Text Toggle</span>
          <span className="text-primary small fw-semibold">Instant Response</span>
        </div>
      </div>
    ),
  },
  {
    id: 'mobile-qr',
    step: '05',
    tag: 'Mobile Sync',
    title: '1-Click QR Code Handover to Smartphone',
    description: 'Created an email on your PC? Click Mobile QR and scan with your phone camera to seamlessly take your disposable inbox on the go.',
    badge: 'Cross-Device Ease',
    content: (
      <div className="carousel-preview-card p-3 text-center">
        <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
          <div className="p-2 border rounded-3 bg-white shadow-xs">
            <AppIcon iconClass="bi bi-qr-code fs-1 text-primary" />
          </div>
          <div className="text-start">
            <div className="fw-bold small text-dark">Instant Mobile Sync</div>
            <div className="text-muted small">Scan with phone camera</div>
          </div>
        </div>
        <div className="p-2 rounded-2 bg-light-subtle border small font-monospace text-truncate text-dark mb-2">
          https://tempmailpk.com/app
        </div>
        <div className="small text-muted">
          <AppIcon iconClass="bi bi-phone me-1 text-success" /> No apps or downloads required on your phone
        </div>
      </div>
    ),
  },
];

const AUTO_INTERVAL_MS = 4000;

const WorkspaceCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentIndex]);

  const current = SLIDES[currentIndex];

  return (
    <div
      className="workspace-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Interactive Feature Stage */}
      <div className="workspace-carousel-stage shadow-sm border rounded-4 bg-surface overflow-hidden">
        {/* Top Header of Stage */}
        <div className="stage-topbar px-4 py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2 bg-light-subtle">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white rounded-pill px-3 py-1 fw-bold">
              STEP {current.step} OF 05
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 fw-semibold">
              {current.tag}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-semibold">
              <span className="eg-pulse-dot me-1"></span> {current.badge}
            </span>
            <span className="text-muted small d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>
              {isPaused ? 'Paused (hovered)' : 'Auto-sliding'}
            </span>
          </div>
        </div>

        {/* Stage Content Grid */}
        <div className="row g-0 align-items-center">
          {/* Left Column: Descriptive Guide */}
          <div className="col-lg-6 p-4 p-md-5 text-start border-end-lg">
            <h3 className="h4 fw-bold text-dark mb-3 animate-fade-in" key={current.title}>
              {current.title}
            </h3>
            <p className="text-secondary mb-4 animate-fade-in" style={{ fontSize: '0.96rem', lineHeight: '1.6' }} key={current.description}>
              {current.description}
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3">
              <Link to="/app" className="btn btn-primary fw-semibold px-4 py-2">
                <AppIcon iconClass="fas fa-bolt me-2" /> Try In Workspace
              </Link>
              <div className="text-muted small">
                Slide <strong>{currentIndex + 1}</strong> of {SLIDES.length}
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Component */}
          <div className="col-lg-6 p-3 p-md-4 bg-light-subtle">
            <div className="carousel-mockup-frame shadow-xs border rounded-3 bg-white overflow-hidden">
              <div className="mockup-header px-3 py-2 border-bottom d-flex align-items-center justify-content-between bg-light">
                <div className="d-flex align-items-center gap-1">
                  <span className="console-dot bg-danger"></span>
                  <span className="console-dot bg-warning"></span>
                  <span className="console-dot bg-success"></span>
                  <span className="small text-muted ms-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
                    tempmailpk.com/app
                  </span>
                </div>
                <span className="badge bg-primary-subtle text-primary py-0 px-2 fw-semibold" style={{ fontSize: '0.72rem' }}>
                  Live Demo
                </span>
              </div>
              <div className="mockup-body animate-fade-in" key={current.id}>
                {current.content}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Control Bar */}
        <div className="stage-bottom-bar px-4 py-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-3 bg-surface">
          {/* Indicator Pills / Dots with Progress */}
          <div className="d-flex align-items-center gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`carousel-dot-btn ${currentIndex === idx ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                title={s.tag}
              >
                <span className="carousel-dot-label d-none d-md-inline">{s.tag}</span>
              </button>
            ))}
          </div>

          {/* Left / Right Arrow Controls */}
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary carousel-nav-arrow"
              onClick={prevSlide}
              aria-label="Previous feature slide"
              title="Previous slide (Left)"
            >
              <AppIcon iconClass="bi bi-chevron-left" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary carousel-nav-arrow"
              onClick={nextSlide}
              aria-label="Next feature slide"
              title="Next slide (Right)"
            >
              <AppIcon iconClass="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCarousel;
