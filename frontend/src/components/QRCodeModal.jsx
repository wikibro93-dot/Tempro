import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import AppIcon from './AppIcon';

const QRCodeModal = ({ email, token, expiration, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  // Deep link to THIS inbox, so scanning the QR on a phone opens the same
  // email and its messages — not just the generic /app page. The phone
  // needs the Mail.tm token to read the inbox, so the link carries it;
  // anyone who scans this QR can open this (temporary, disposable) inbox,
  // which is the nature of a QR handover — show it only to yourself.
  // Falls back to the plain /app link when no token is available.
  const shareUrl = token
    ? `${window.location.origin}/app?inbox=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}${expiration ? `&exp=${encodeURIComponent(expiration)}` : ''}`
    : `${window.location.origin}/app`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1055 }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-surface">
          <div className="modal-header border-bottom px-4 pt-4 pb-2">
            <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
              <AppIcon iconClass="bi bi-qr-code-scan text-primary" />
              <span>Mobile Sync &amp; QR Code</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body text-center p-4">
            <p className="small text-muted mb-3">
              Scan this QR code with your smartphone camera to open this exact inbox on your phone.
            </p>

            <div className="d-inline-block p-3 rounded-3 border bg-white shadow-xs mb-3">
              <QRCode value={shareUrl} size={200} bgColor="#ffffff" fgColor="#0f172a" />
            </div>

            <div className="p-2 rounded-2 bg-light-subtle border small font-monospace text-truncate text-dark fw-semibold mb-3">
              {email}
            </div>

            <button
              type="button"
              className={`btn btn-sm ${copiedLink ? 'btn-success' : 'btn-outline-primary'} w-100 fw-semibold py-2`}
              onClick={copyShareLink}
            >
              <AppIcon iconClass={`bi ${copiedLink ? 'bi-check2' : 'bi-clipboard'} me-1`} />
              {copiedLink ? 'Email Address Copied!' : 'Copy Email Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
