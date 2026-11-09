import React, { useEffect, useMemo, useState } from 'react';
import AppIcon from './AppIcon';
import { sanitizeEmailHtmlWithMeta } from '../utils/sanitizeEmailHtml';

/**
 * SafeEmailViewer
 * Renders incoming email content with robust DOMPurify sanitization.
 * Strips malicious scripts, clickjacking overlays, and unsafe inline styles,
 * while preserving legitimate rich email formatting, tables, and images.
 * Remote images are blocked by default (a tracking pixel phones home the
 * moment a message is opened) and load only when the reader taps
 * "Load images" for that message.
 */
const SafeEmailViewer = ({
  html,
  text,
  viewMode = 'html',
  isOffline = false,
}) => {
  // Per-message opt-in: remote images stay blocked until the reader asks.
  const [imagesAllowed, setImagesAllowed] = useState(false);

  // A new message starts with images blocked again.
  useEffect(() => {
    setImagesAllowed(false);
  }, [html]);

  // Memoized HTML sanitization for zero rendering jank and sub-millisecond INP
  const { html: sanitizedHtml, blockedRemoteImages } = useMemo(() => {
    if (!html) return { html: '', blockedRemoteImages: 0 };
    return sanitizeEmailHtmlWithMeta(html, { allowRemoteImages: imagesAllowed });
  }, [html, imagesAllowed]);

  const hasHtml = Boolean(sanitizedHtml && sanitizedHtml.trim());
  const displayText = text || 'No text content available in this email.';
  const showImageBanner = viewMode === 'html' && hasHtml && blockedRemoteImages > 0 && !imagesAllowed;

  // If user requested HTML view and sanitized HTML is present
  if (viewMode === 'html' && hasHtml) {
    return (
      <div className="safe-email-viewer-wrapper">
        {/* Security Shield Indicator Bar */}
        <div className="d-flex align-items-center justify-content-between px-3 py-1.5 mb-2 rounded-2 bg-success-subtle border border-success-subtle">
          <div className="d-flex align-items-center gap-1.5 text-success-emphasis" style={{ fontSize: '0.78rem' }}>
            <AppIcon iconClass="bi bi-shield-check text-success fs-6" />
            <span className="fw-semibold">Shield Protected</span>
            <span className="text-muted d-none d-sm-inline">· Scripts, trackers & unsafe styles neutralized</span>
          </div>
          <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
            Safe HTML Mode
          </div>
        </div>

        {/* Remote Images Blocked Banner — compact single row so it does not
            push the message down or wrap into a tall block. */}
        {showImageBanner && (
          <div
            className="d-flex align-items-center justify-content-between gap-2 px-3 py-1.5 mb-2 rounded-2 bg-warning-subtle border border-warning-subtle"
            title="Remote images are hidden to protect your privacy — senders can track opens with them."
          >
            <div className="d-flex align-items-center gap-1.5 text-warning-emphasis min-w-0" style={{ fontSize: '0.78rem' }}>
              <AppIcon iconClass="bi bi-image text-warning fs-6 flex-shrink-0" />
              <span className="fw-semibold text-truncate">
                Remote images blocked · {blockedRemoteImages} hidden
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-warning flex-shrink-0"
              onClick={() => setImagesAllowed(true)}
            >
              Load images
            </button>
          </div>
        )}

        {/* Sanitized HTML Container */}
        <div
          className="email-html-viewport bg-white p-3 p-md-4 rounded-3 border"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    );
  }

  // Plain Text Fallback View
  return (
    <div className="safe-email-viewer-wrapper">
      <div className="d-flex align-items-center justify-content-between px-3 py-1.5 mb-2 rounded-2 bg-light border">
        <div className="d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.78rem' }}>
          <AppIcon iconClass="bi bi-file-text fs-6 text-primary" />
          <span className="fw-semibold">Plain Text View</span>
          {isOffline && <span className="badge bg-warning-subtle text-warning-emphasis">Offline</span>}
        </div>
        <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
          Raw Text
        </div>
      </div>

      <pre className="p-3 p-md-4 rounded-3 border bg-body-tertiary font-monospace small text-dark mb-0 whitespace-pre-wrap">
        {displayText}
      </pre>
    </div>
  );
};

export default React.memo(SafeEmailViewer);
