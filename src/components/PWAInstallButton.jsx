import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import AppIcon from './AppIcon';

export const PWAInstallButton = ({ className = '', variant = 'navbar', label = 'Install App' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // Handle ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // If already running inside installed standalone PWA, suppress the button
  if (isInstalled) {
    return null;
  }

  const handleTrigger = () => {
    if (isInstallable) {
      install();
    } else {
      setShowModal(true);
    }
  };

  const handleDirectInstallFromModal = async () => {
    if (isInstallable) {
      await install();
      setShowModal(false);
    }
  };

  const isNavbar = variant === 'navbar';

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        className={
          isNavbar
            ? `btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 fw-semibold px-2 px-md-3 ${className}`
            : `btn btn-primary d-inline-flex align-items-center gap-2 fw-bold px-4 py-2 ${className}`
        }
        title="Install TempMail Pro as a native app on your phone or PC"
        style={{ minHeight: isNavbar ? '38px' : '44px', borderRadius: '10px' }}
      >
        <AppIcon iconClass="bi bi-download" />
        <span>{label}</span>
      </button>

      {/* Modern Compact Mobile-Friendly PWA Install Dialog */}
      {showModal && (
        <div
          className="pwa-modal-backdrop"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-modal-title"
        >
          <div
            className="pwa-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="pwa-modal-drag-indicator d-block d-sm-none" aria-hidden="true" />

            {/* High-Contrast Brand Header */}
            <div className="pwa-modal-header">
              <div className="pwa-modal-header__brand">
                <div className="pwa-modal-header__icon" aria-hidden="true">
                  <AppIcon iconClass="bi bi-phone-fill" />
                </div>
                <div>
                  <h3 id="pwa-modal-title" className="pwa-modal-header__title">
                    Install TempMail Pro
                  </h3>
                  <span className="pwa-modal-header__subtitle">
                    100% Free · No App Store needed
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="pwa-modal-header__close"
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Compact Body with Streamlined Steps */}
            <div className="pwa-modal-body">
              <p className="pwa-modal-lead">
                {isIOS
                  ? 'Add to your Home Screen in 2 quick taps on Safari:'
                  : 'Install directly from your mobile browser in 2 taps:'}
              </p>

              <div className="pwa-modal-steps">
                {isIOS ? (
                  <>
                    <div className="pwa-modal-step-item">
                      <span className="pwa-modal-step-badge">1</span>
                      <p className="pwa-modal-step-text">
                        Tap <strong>Share</strong>{' '}
                        <AppIcon iconClass="bi bi-box-arrow-up text-primary fw-bold mx-1" /> at the bottom toolbar.
                      </p>
                    </div>
                    <div className="pwa-modal-step-item">
                      <span className="pwa-modal-step-badge">2</span>
                      <p className="pwa-modal-step-text">
                        Scroll down and tap <strong>"Add to Home Screen"</strong>{' '}
                        <AppIcon iconClass="bi bi-plus-square text-success fw-bold mx-1" />.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pwa-modal-step-item">
                      <span className="pwa-modal-step-badge">1</span>
                      <p className="pwa-modal-step-text">
                        Tap browser menu <strong>(⋮ or ⋯)</strong> at the top right.
                      </p>
                    </div>
                    <div className="pwa-modal-step-item">
                      <span className="pwa-modal-step-badge">2</span>
                      <p className="pwa-modal-step-text">
                        Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Perks Strip */}
              <div className="pwa-modal-perks">
                <span className="pwa-modal-perk-item">
                  <AppIcon iconClass="bi bi-lightning-charge-fill text-warning" />
                  Instant OTP
                </span>
                <span className="text-muted opacity-50">·</span>
                <span className="pwa-modal-perk-item">
                  <AppIcon iconClass="bi bi-shield-check text-success" />
                  Zero Logs
                </span>
                <span className="text-muted opacity-50">·</span>
                <span className="pwa-modal-perk-item">
                  <AppIcon iconClass="bi bi-layers-fill text-primary" />
                  Multi-Inbox
                </span>
              </div>
            </div>

            {/* Compact Modal Footer */}
            <div className="pwa-modal-footer">
              {isInstallable && (
                <button
                  type="button"
                  className="btn btn-outline-primary fw-semibold flex-fill py-2"
                  style={{ borderRadius: '9px', fontSize: '0.85rem' }}
                  onClick={handleDirectInstallFromModal}
                >
                  <AppIcon iconClass="bi bi-download me-1" />
                  Install Now
                </button>
              )}
              <button
                type="button"
                className="pwa-modal-btn-primary"
                onClick={() => setShowModal(false)}
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;

