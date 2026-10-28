import React, { useState } from 'react';
import AppIcon from './AppIcon';

const EmailSidebar = ({
  generatedEmails = [],
  activeToken,
  inboxCounts = {},
  isCreating = false,
  onSwitch,
  onDelete,
  onCreateNew,
}) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const now = new Date();

  const activeEmails = generatedEmails.filter(
    (e) => new Date(e.expiration) > now
  );
  const expiredEmails = generatedEmails.filter(
    (e) => new Date(e.expiration) <= now
  );

  const formatExpiry = (expiration) => {
    const diff = new Date(expiration) - now;
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const EmailRow = ({ email, isExpired = false }) => {
    const isSelected = email.token === activeToken;
    const count = inboxCounts[email.token] || 0;
    const addr = email.address || email.email || '';

    return (
      <div
        className={`email-sidebar-row${isSelected ? ' selected' : ''}${isExpired ? ' expired' : ''}`}
        onClick={() => !isExpired && onSwitch && onSwitch(addr)}
        title={addr}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            !isExpired && onSwitch && onSwitch(addr);
          }
        }}
      >
        <div className="email-sidebar-avatar">
          {addr[0]?.toUpperCase() || '?'}
        </div>
        <div className="email-sidebar-info">
          <div className="email-sidebar-addr text-truncate">{addr}</div>
          <div className="email-sidebar-meta">
            {isExpired ? (
              <span className="badge bg-secondary">Expired</span>
            ) : (
              <span className="email-sidebar-expiry">⏱ {formatExpiry(email.expiration)}</span>
            )}
          </div>
        </div>
        <div className="email-sidebar-actions">
          {count > 0 && !isExpired && (
            <span className="badge bg-primary rounded-pill email-sidebar-badge">{count}</span>
          )}
          {onDelete && (
            <button
              type="button"
              className="email-sidebar-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(addr);
              }}
              title="Remove inbox"
              aria-label={`Remove inbox ${addr}`}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Mobile Horizontal Strip (< 992px) ── */}
      <div className="d-lg-none mobile-inboxes-strip mb-2">
        <div className="d-flex align-items-center justify-content-between mb-1.5 px-1">
          <div className="d-flex align-items-center gap-1.5">
            <AppIcon iconClass="bi bi-inbox-fill text-primary" size={13} />
            <span className="fw-bold small text-dark" style={{ fontSize: '0.82rem' }}>
              Inboxes ({activeEmails.length})
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {generatedEmails.length > 1 && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 text-secondary"
                onClick={() => setShowManageModal(true)}
                style={{ fontSize: '0.78rem', fontWeight: 600 }}
              >
                Manage ({generatedEmails.length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-0.5 px-2"
              onClick={onCreateNew}
              disabled={isCreating}
              style={{ minHeight: '28px', fontSize: '0.78rem', borderRadius: '6px' }}
            >
              <AppIcon iconClass="bi bi-plus-lg" size={11} />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Scrollable touch carousel */}
        <div className="mobile-inbox-chips d-flex align-items-center gap-1.5 overflow-x-auto pb-1">
          {activeEmails.map((email) => {
            const isSelected = email.token === activeToken;
            const count = inboxCounts[email.token] || 0;
            const addr = email.address || email.email || '';
            const shortName = addr.split('@')[0] || addr;

            return (
              <button
                key={email.token || addr}
                type="button"
                className={`mobile-inbox-chip btn btn-sm d-inline-flex align-items-center gap-1.5 text-nowrap ${
                  isSelected ? 'btn-primary shadow-xs' : 'btn-outline-secondary bg-white'
                }`}
                onClick={() => onSwitch && onSwitch(addr)}
                style={{
                  minHeight: '34px',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                <span
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-uppercase"
                  style={{
                    width: '18px',
                    height: '18px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    background: isSelected ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#334155',
                    flexShrink: 0,
                  }}
                >
                  {shortName[0]}
                </span>
                <span className="text-truncate" style={{ maxWidth: '110px' }}>
                  {shortName}
                </span>
                {count > 0 && (
                  <span
                    className={`badge rounded-pill ${
                      isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Sidebar (>= 992px) ── */}
      <div className="d-none d-lg-flex email-sidebar">
        <div className="email-sidebar-header">
          <span className="email-sidebar-title">
            <AppIcon iconClass="bi bi-inbox-fill me-2" />Inboxes
          </span>
          <span className="badge bg-primary rounded-pill">{activeEmails.length}</span>
        </div>

        <div className="email-sidebar-list">
          {activeEmails.length === 0 && (
            <div className="email-sidebar-empty">No active emails</div>
          )}
          {activeEmails.map((email) => (
            <EmailRow key={email.token || email.address} email={email} />
          ))}

          {expiredEmails.length > 0 && (
            <>
              <div className="email-sidebar-section-label">Expired</div>
              {expiredEmails.map((email) => (
                <EmailRow key={email.token || email.address} email={email} isExpired />
              ))}
            </>
          )}
        </div>

        <div className="email-sidebar-footer">
          <button
            type="button"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={onCreateNew}
            disabled={isCreating}
            style={{ minHeight: '44px' }}
          >
            {isCreating ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Creating…</span>
              </>
            ) : (
              <>
                <AppIcon iconClass="bi bi-plus-lg" />
                <span>New Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Manage Modal - Sleek Compact Bottom-Sheet Dialog */}
      {showManageModal && (
        <div
          className="pwa-modal-backdrop"
          onClick={() => setShowManageModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="pwa-modal-card"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pwa-modal-drag-indicator d-block d-sm-none" aria-hidden="true" />

            {/* Modal Header */}
            <div className="pwa-modal-header">
              <div className="pwa-modal-header__brand">
                <div className="pwa-modal-header__icon" aria-hidden="true">
                  <AppIcon iconClass="bi bi-collection-fill" />
                </div>
                <div>
                  <h3 className="pwa-modal-header__title">
                    Manage Inboxes ({generatedEmails.length})
                  </h3>
                  <span className="pwa-modal-header__subtitle">
                    Switch between active mailboxes or remove old ones
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="pwa-modal-header__close"
                onClick={() => setShowManageModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal List Body */}
            <div className="pwa-modal-body p-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="d-flex flex-column gap-1.5">
                {generatedEmails.map((e) => {
                  const isSelected = e.token === activeToken;
                  const isExpired = new Date(e.expiration) <= now;
                  const addr = e.address || e.email || '';

                  return (
                    <div
                      key={e.token || addr}
                      className={`d-flex align-items-center justify-content-between p-2 px-2.5 rounded-3 border transition-all ${
                        isSelected
                          ? 'bg-primary-subtle border-primary-subtle'
                          : 'bg-surface hover-bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        onSwitch && onSwitch(addr);
                        setShowManageModal(false);
                      }}
                    >
                      <div className="text-truncate me-2">
                        <div className="d-flex align-items-center gap-1.5">
                          {isSelected && (
                            <span className="badge bg-primary text-white rounded-pill px-1.5" style={{ fontSize: '0.65rem' }}>
                              Active
                            </span>
                          )}
                          <span className={`font-monospace fw-bold small text-truncate ${isSelected ? 'text-primary' : 'text-dark'}`}>
                            {addr}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                          {isExpired ? (
                            <span className="text-danger fw-semibold">Expired</span>
                          ) : (
                            <span>Expires in {formatExpiry(e.expiration)}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2 shrink-0"
                        style={{ minHeight: '30px', fontSize: '0.76rem', borderRadius: '6px' }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onDelete && onDelete(addr);
                        }}
                        title={`Remove ${addr}`}
                      >
                        <AppIcon iconClass="bi bi-trash3" size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pwa-modal-footer">
              <button
                type="button"
                className="pwa-modal-btn-primary"
                onClick={() => setShowManageModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailSidebar;
