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
      const timerId = setTimeout(() => setCopiedEmail(false), 2200);
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
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
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
    <div className={`am-compact-card rounded-4 border bg-surface p-2 p-md-3 mb-2 shadow-xs${isCritical ? ' border-warning' : ''}`}>
      {/* Top Meta Line: Status, Timer & Action Icons in 1 Tight Row */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1.5 px-1">
        <div className="d-flex align-items-center gap-1.5">
          <span className="eg-pulse-dot" style={{ width: '8px', height: '8px' }}></span>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-0.5 px-2 fw-semibold" style={{ fontSize: '0.72rem' }}>
            Active Address
          </span>
          <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.74rem' }}>
            Live Mail Server
          </span>
        </div>

        <div className="d-flex align-items-center gap-1.5">
          {account?.expiration && (
            <div className="d-flex align-items-center gap-1 font-monospace text-secondary" style={{ fontSize: '0.78rem' }}>
              <AppIcon iconClass="bi bi-clock text-muted" size={12} />
              <span className="d-none d-sm-inline">Expires:</span>
              <strong className={isCritical ? 'text-danger' : 'text-dark'}>{timeStr}</strong>
            </div>
          )}

          <div className="vr d-none d-sm-block mx-1" style={{ height: '14px', opacity: 0.2 }}></div>

          {/* Quick Icon Actions (Refresh, QR, New) */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center p-0"
            onClick={refreshInbox}
            disabled={isLoading || !account}
            title="Check mail / refresh now"
            style={{ width: '30px', height: '30px', minHeight: '30px', minWidth: '30px', borderRadius: '7px' }}
          >
            <AppIcon iconClass={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`} size={14} />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center p-0"
            onClick={() => setShowQrModal(true)}
            disabled={!email}
            title="Scan QR code with mobile camera"
            style={{ width: '30px', height: '30px', minHeight: '30px', minWidth: '30px', borderRadius: '7px' }}
          >
            <AppIcon iconClass="bi bi-qr-code" size={13} />
          </button>

          {onNewEmailClick && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center p-0"
              onClick={onNewEmailClick}
              title="Add custom name or new inbox"
              style={{ width: '30px', height: '30px', minHeight: '30px', minWidth: '30px', borderRadius: '7px' }}
            >
              <AppIcon iconClass="bi bi-plus-lg" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Single-Line Address & Copy Bar */}
      <div className="am-address-strip d-flex align-items-center justify-content-between p-1.5 ps-2.5 rounded-3 border bg-light-subtle">
        <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1 pe-2">
          <AppIcon iconClass="bi bi-envelope-at text-primary fs-6 shrink-0 d-none d-sm-inline" />
          <div
            className="text-dark fw-bold font-monospace text-truncate user-select-all"
            style={{ fontSize: '0.94rem', letterSpacing: '-0.01em' }}
            title={email}
          >
            {email || <span className="text-muted fw-normal">Generating address…</span>}
          </div>
        </div>

        {/* 1-Tap Copy Button */}
        <button
          type="button"
          className={`btn btn-sm ${copiedEmail ? 'btn-success' : 'btn-primary'} d-inline-flex align-items-center justify-content-center gap-1 px-3 fw-semibold shrink-0 transition-all`}
          onClick={copyToClipboard}
          disabled={!email || isLoading}
          title="Copy email address"
          style={{
            minHeight: '36px',
            minWidth: '92px',
            borderRadius: '8px',
            fontSize: '0.84rem'
          }}
        >
          {copiedEmail ? (
            <>
              <AppIcon iconClass="bi bi-check-lg" size={15} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <AppIcon iconClass="bi bi-clipboard" size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Slim Integrated Expiry Progress Bar */}
      {account?.expiration && (
        <div className="progress mt-1.5" style={{ height: '3px', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            className={`progress-bar ${barColor}`}
            role="progressbar"
            style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}

      {showQrModal && (
        <QRCodeModal
          email={email}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};

export default AccountManager;
