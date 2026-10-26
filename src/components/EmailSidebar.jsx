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
        onClick={() => !isExpired && onSwitch && onSwitch(email.address)}
        title={addr}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            !isExpired && onSwitch && onSwitch(email.address);
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
                onDelete(email.address);
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
      <div className="d-lg-none mobile-inboxes-strip mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2 px-1">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold small text-dark d-flex align-items-center gap-1">
              <AppIcon iconClass="bi bi-inbox-fill text-primary" />
              <span>Inboxes ({activeEmails.length})</span>
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            {generatedEmails.length > 1 && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 small text-secondary"
                onClick={() => setShowManageModal(true)}
                style={{ fontSize: '0.82rem' }}
              >
                Manage Inboxes
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2"
              onClick={onCreateNew}
              disabled={isCreating}
              style={{ minHeight: '36px', fontSize: '0.82rem' }}
            >
              <AppIcon iconClass="bi bi-plus-lg" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Scrollable touch carousel */}
        <div className="mobile-inbox-chips d-flex align-items-center gap-2 overflow-x-auto pb-1">
          {activeEmails.map((email) => {
            const isSelected = email.token === activeToken;
            const count = inboxCounts[email.token] || 0;
            const addr = email.address || email.email || '';
            const shortName = addr.split('@')[0] || addr;

            return (
              <button
                key={email.token || email.address}
                type="button"
                className={`mobile-inbox-chip btn btn-sm d-inline-flex align-items-center gap-2 text-nowrap ${
                  isSelected ? 'btn-primary shadow-xs' : 'btn-outline-secondary bg-white'
                }`}
                onClick={() => onSwitch && onSwitch(email.address)}
                style={{
                  minHeight: '44px',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                <span
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-uppercase"
                  style={{
                    width: '22px',
                    height: '22px',
                    fontSize: '0.72rem',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#334155',
                  }}
                >
                  {shortName[0]}
                </span>
                <span className="text-truncate" style={{ maxWidth: '140px' }}>
                  {shortName}
                </span>
                {count > 0 && (
                  <span
                    className={`badge rounded-pill ${
                      isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}
                    style={{ fontSize: '0.72rem' }}
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

      {/* Mobile Manage Modal */}
      {showManageModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold fs-6">Manage Your Inboxes</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowManageModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-3">
                <p className="small text-muted mb-3">
                  Switch between inboxes or delete old ones to keep your list organized.
                </p>
                <div className="list-group">
                  {generatedEmails.map((e) => {
                    const isSelected = e.token === activeToken;
                    const isExpired = new Date(e.expiration) <= now;
                    return (
                      <div
                        key={e.token || e.address}
                        className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 ${
                          isSelected ? 'active' : ''
                        }`}
                        onClick={() => {
                          onSwitch && onSwitch(e.address);
                          setShowManageModal(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="text-truncate me-2">
                          <div className="fw-semibold text-truncate">{e.address}</div>
                          <div
                            className={`small ${isSelected ? 'text-white-50' : 'text-muted'}`}
                          >
                            {isExpired ? 'Expired' : `Expires in ${formatExpiry(e.expiration)}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            isSelected ? 'btn-outline-light' : 'btn-outline-danger'
                          }`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onDelete && onDelete(e.address);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={() => setShowManageModal(false)}
                  style={{ minHeight: '44px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailSidebar;
