import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import AppIcon from './AppIcon';

export const PWAInstallButton = ({ className = '', variant = 'navbar', label = 'Install App' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running inside installed standalone PWA, suppress the button
  if (isInstalled) {
    return null;
  }

  // If not installable and not iOS, we can show a proactive install option or subtle trigger
  const handleTrigger = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Desktop Chrome / Edge instruction or prompt
      setShowIOSModal(true);
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

      {/* Guided Installation Modal (for iOS Safari and Desktop browsers) */}
      {showIOSModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10050 }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '420px', margin: '1rem auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content shadow-lg border rounded-4 bg-surface text-start overflow-hidden">
              <div className="modal-header border-bottom p-3 d-flex align-items-center justify-content-between bg-light-subtle">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center">
                    <AppIcon iconClass="bi bi-phone-fill fs-5" />
                  </div>
                  <div>
                    <h5 className="modal-title fs-6 fw-bold mb-0 text-dark">
                      Install TempMail Pro App
                    </h5>
                    <small className="text-muted">100% Free · No App Store needed</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowIOSModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4">
                {isIOS ? (
                  <div>
                    <p className="small text-muted mb-3">
                      Follow these 2 quick steps in Apple Safari to install on your iPhone or iPad:
                    </p>
                    <div className="d-flex align-items-start gap-3 p-3 rounded-3 border bg-light-subtle mb-3">
                      <span className="badge bg-primary text-white rounded-circle p-2">1</span>
                      <div className="small">
                        Tap the <strong>Share</strong> button <AppIcon iconClass="bi bi-box-arrow-up text-primary fw-bold mx-1" /> at the bottom toolbar of Safari.
                      </div>
                    </div>
                    <div className="d-flex align-items-start gap-3 p-3 rounded-3 border bg-light-subtle">
                      <span className="badge bg-primary text-white rounded-circle p-2">2</span>
                      <div className="small">
                        Scroll down and tap <strong>Add to Home Screen</strong> <AppIcon iconClass="bi bi-plus-square text-success fw-bold mx-1" />.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="small text-muted mb-3">
                      To install TempMail Pro on Android, Chrome, or Windows:
                    </p>
                    <div className="d-flex align-items-start gap-3 p-3 rounded-3 border bg-light-subtle mb-3">
                      <span className="badge bg-primary text-white rounded-circle p-2">1</span>
                      <div className="small">
                        Tap the <strong>browser menu (⋮ or ⋯)</strong> at the top right of your browser.
                      </div>
                    </div>
                    <div className="d-flex align-items-start gap-3 p-3 rounded-3 border bg-light-subtle">
                      <span className="badge bg-primary text-white rounded-circle p-2">2</span>
                      <div className="small">
                        Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3 bg-light-subtle">
                <button
                  type="button"
                  className="btn btn-primary w-100 fw-semibold"
                  onClick={() => setShowIOSModal(false)}
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;
