import React, { useState, useEffect } from 'react';
import AppIcon from './AppIcon';
import QRCodeModal from './QRCodeModal';

const AccountManager = ({
  account,
  refreshInbox,
  onEmailCopied,
  isLoading = false,
  onNewEmailClick = null,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copyResetTimer, setCopyResetTimer] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const email = account?.address || account?.email || '';

  const copyToClipboard = () => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopiedEmail(true);
      if (onEmailCopied) onEmailCopied();
      if (copyResetTimer) {
        clearTimeout(copyResetTimer);
      }
      const timerId = setTimeout(() => setCopiedEmail(false), 2500);
      setCopyResetTimer(timerId);
    }).catch(() => {});
  };

  useEffect(() => {
    return () => {
      if (copyResetTimer) {
        clearTimeout(copyResetTimer);
      }
    };
  }, [copyResetTimer]);

  useEffect(() => {
    if (!account?.expiration) return;
    const calc = () => {
      const diff = new Date(account.expiration) - new Date();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [account]);

  const formatTime = () => {
    if (!account?.expiration) return '—';
    const diff = new Date(account.expiration) - new Date();
    if (diff <= 0) return 'Expired';
    const { days, hours, minutes, seconds } = timeLeft;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getProgress = () => {
    if (!account?.expiration) return 0;
    const now = Date.now();
    const exp = new Date(account.expiration).getTime();
    const created = account.createdAt ? new Date(account.createdAt).getTime() : exp - 3600000;
    const total = exp - created;
    const elapsed = now - created;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const progress = getProgress();
  const timeStr = formatTime();
  const isCritical = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5;
  const barColor = progress > 90 ? 'bg-danger' : progress > 70 ? 'bg-warning' : 'bg-primary';

  return (
    <div className={`am-card rounded-4 border shadow-sm p-3 p-md-4 bg-surface mb-3${isCritical ? ' border-warning' : ''}`}>
      {/* Top Bar: Status & Badges */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary text-white px-2 py-1 small fw-semibold">
            Active Disposable Address
          </span>
          <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>
            Live Mail Server
          </span>
        </div>

        {account?.expiration && (
          <div className="d-flex align-items-center gap-1 small font-monospace text-secondary" style={{ fontSize: '0.82rem' }}>
            <AppIcon iconClass="bi bi-clock me-1" size={13} />
            <span>Expires in:</span>
            <strong className={isCritical ? 'text-danger' : 'text-dark'}>{timeStr}</strong>
          </div>
        )}
      </div>

      {/* Main Address Presentation Row */}
      <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2 p-2 p-md-3 bg-light-subtle rounded-3 border mb-3">
        <div className="d-flex align-items-center gap-3 overflow-hidden flex-grow-1 px-1">
          <div className="d-none d-sm-flex p-2 rounded-3 bg-primary-subtle text-primary align-items-center justify-content-center shrink-0">
            <AppIcon iconClass="bi bi-envelope-at-fill fs-5" />
          </div>
          <div className="overflow-hidden flex-grow-1">
            <div className="text-dark fw-bold font-monospace text-break user-select-all" style={{ fontSize: '1.08rem', letterSpacing: '-0.01em' }}>
              {email || <span className="text-muted">Generating secure email address…</span>}
            </div>
          </div>
        </div>

        {/* Big Touch-Friendly Copy Button */}
        <button
          type="button"
          className={`btn ${copiedEmail ? 'btn-success' : 'btn-primary'} d-inline-flex align-items-center justify-content-center gap-2 px-3 fw-semibold shrink-0 transition-all`}
          onClick={copyToClipboard}
          disabled={!email || isLoading}
          title="Copy email address"
          style={{ minHeight: '44px', minWidth: '120px' }}
        >
          {copiedEmail ? (
            <>
              <AppIcon iconClass="bi bi-check-lg fs-5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <AppIcon iconClass="bi bi-clipboard fs-6" />
              <span>Copy Email</span>
            </>
          )}
        </button>
      </div>

      {/* Expiry Progress Bar */}
      {account?.expiration && (
        <div className="progress mb-3" style={{ height: '5px' }}>
          <div
            className={`progress-bar ${barColor}`}
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 px-3 flex-grow-1 flex-sm-grow-0"
            onClick={refreshInbox}
            disabled={isLoading || !account}
            title="Check mail now"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          >
            <AppIcon iconClass={`bi bi-arrow-clockwise${isLoading ? ' spin' : ''}`} />
            <span>{isLoading ? 'Checking…' : 'Check Mail / Refresh'}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 px-3 flex-grow-1 flex-sm-grow-0"
            onClick={() => setShowQrModal(true)}
            disabled={!email}
            title="Scan with mobile camera"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          >
            <AppIcon iconClass="bi bi-qr-code" />
            <span>Mobile QR</span>
          </button>
        </div>

        {onNewEmailClick && (
          <button
            type="button"
            className="btn btn-link text-decoration-none text-primary small p-0 fw-semibold d-none d-sm-inline-flex align-items-center gap-1"
            onClick={onNewEmailClick}
          >
            <AppIcon iconClass="bi bi-plus-circle" />
            <span>Custom Name / New Inbox</span>
          </button>
        )}
      </div>

      {showQrModal && (
        <QRCodeModal email={email} onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
};

export default AccountManager;
