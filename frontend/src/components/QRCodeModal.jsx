import React, { useState } from 'react';
import AppIcon from './AppIcon';

const QRCodeModal = ({ email, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const shareUrl = `${window.location.origin}/app`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&margin=10`;

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
              Scan this QR code with your smartphone camera to open TempMail Pro directly on your phone.
            </p>

            <div className="d-inline-block p-3 rounded-3 border bg-white shadow-xs mb-3">
              <img
                src={qrImageUrl}
                alt="QR Code for Mobile Temp Mail"
                width={200}
                height={200}
                className="img-fluid rounded"
                loading="lazy"
              />
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
