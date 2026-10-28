import React, { useMemo } from 'react';
import AppIcon from './AppIcon';
import { sanitizeEmailHtml } from '../utils/sanitizeEmailHtml';

/**
 * SafeEmailViewer
 * Renders incoming email content with robust DOMPurify sanitization.
 * Strips malicious scripts, clickjacking overlays, and unsafe inline styles,
 * while preserving legitimate rich email formatting, tables, and images.
 */
const SafeEmailViewer = ({
  html,
  text,
  viewMode = 'html',
  isOffline = false,
}) => {
  // Memoized HTML sanitization for zero rendering jank and sub-millisecond INP
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';
    return sanitizeEmailHtml(html);
  }, [html]);

  const hasHtml = Boolean(sanitizedHtml && sanitizedHtml.trim());
  const displayText = text || 'No text content available in this email.';

  // If user requested HTML view and sanitized HTML is present
  if (viewMode === 'html' && hasHtml) {
    return (
      <div className="safe-email-viewer-wrapper">
        {/* Security Shield Indicator Bar */}
        <div className="d-flex align-items-center justify-content-between px-3 py-1.5 mb-2 rounded-2 bg-success-subtle border border-success-subtle">
          <div className="d-flex align-items-center gap-1.5 text-success-emphasis" style={{ fontSize: '0.74rem' }}>
            <AppIcon iconClass="bi bi-shield-check text-success fs-6" />
            <span className="fw-semibold">Shield Protected</span>
            <span className="text-muted d-none d-sm-inline">· Scripts, trackers & unsafe styles neutralized</span>
          </div>
          <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
            Safe HTML Mode
          </div>
        </div>

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
        <div className="d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.74rem' }}>
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
