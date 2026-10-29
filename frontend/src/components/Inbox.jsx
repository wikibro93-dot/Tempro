import React, { useState, useEffect, useRef, memo } from 'react';
import { getApiRoot } from '../utils/apiRoot.js';
import axios from 'axios';
import { List } from 'react-window';
import AppIcon from './AppIcon';
import SafeEmailViewer from './SafeEmailViewer';
import offlineMailbox from '../utils/offlineMailbox';

// Helper to extract verification/OTP codes from subject or message preview
const extractOtpCode = (text) => {
  if (!text) return null;
  // Look for patterns like: "code: 123456", "verification code 1234", "G-123456", "849204"
  const otpMatch = text.match(/\b(?:\d{4,8}|[A-Z0-9]{3,4}-[A-Z0-9]{3,4})\b/);
  if (otpMatch && !/^\d{4}$/.test(otpMatch[0]) && !/^\d{6}$/.test(otpMatch[0])) {
    // Only return if it looks like a genuine verification code
    const isLikelyOtp = /(?:code|verification|verify|otp|pin|token|confirm)/i.test(text);
    return isLikelyOtp ? otpMatch[0] : null;
  }
  return otpMatch ? otpMatch[0] : null;
};

// Clean Web Audio synthesizer chime
const playMessageChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now);
    osc2.frequency.setValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Audio autoplay restrictions or unsupported
  }
};

// Memoized virtualized row item for high-performance rendering of 100+ emails
const EmailRowItem = memo(({ index, style, messages, selectedId, copiedOtp, onSelect, onCopyOtp, formatDate }) => {
  const msg = messages?.[index];
  if (!msg) return null;

  const isSelected = selectedId === msg.id;
  const previewText = msg.intro || msg.text || msg.subject || '';
  const detectedOtp = extractOtpCode(`${msg.subject} ${previewText}`);

  return (
    <div
      style={style}
      className={`inbox-item-row p-3 border-bottom cursor-pointer transition-colors ${
        isSelected ? 'inbox-item-active bg-primary-subtle' : 'hover-bg-light'
      }`}
      onClick={() => onSelect(msg)}
    >
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="fw-bold small text-dark text-truncate me-2" style={{ maxWidth: '180px' }}>
          {msg.from?.name || msg.from?.address || 'Unknown Sender'}
        </span>
        <span className="text-muted font-monospace" style={{ fontSize: '0.74rem' }}>
          {formatDate(msg.createdAt)}
        </span>
      </div>

      <div className="small fw-semibold text-dark text-truncate mb-1">
        {msg.subject || '(No Subject)'}
      </div>

      <div className="text-muted text-truncate mb-2" style={{ fontSize: '0.8rem' }}>
        {previewText || 'No text preview available.'}
      </div>

      {/* Auto-detected OTP Badge with 1-Click Copy */}
      {detectedOtp && (
        <div className="d-flex align-items-center justify-content-between p-1 px-2 rounded-2 bg-warning-subtle border border-warning-subtle">
          <span className="font-monospace fw-bold text-dark small">
            OTP: {detectedOtp}
          </span>
          <button
            type="button"
            className={`btn btn-xs ${copiedOtp === detectedOtp ? 'btn-success' : 'btn-dark'} py-0 px-2 fw-semibold`}
            style={{ fontSize: '0.7rem', minHeight: '32px' }}
            onClick={(e) => onCopyOtp(detectedOtp, e)}
          >
            {copiedOtp === detectedOtp ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      )}
    </div>
  );
});
EmailRowItem.displayName = 'EmailRowItem';

const Inbox = ({ messages = [], isLoading = false, onRetry, onTokenExpired }) => {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [messageContent, setMessageContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [viewMode, setViewMode] = useState('html'); // 'html' or 'text'
  const [copiedOtp, setCopiedOtp] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'viewer'
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isOfflineContent, setIsOfflineContent] = useState(false);
  const prevCountRef = useRef(messages?.length || 0);

  const API_ROOT = getApiRoot();

  // Sound and dynamic tab title notification on new message
  useEffect(() => {
    const currentCount = messages?.length || 0;
    if (currentCount > prevCountRef.current) {
      playMessageChime();
      document.title = `(${currentCount}) New Mail · TempMail Pro`;
    } else if (currentCount === 0) {
      document.title = 'TempMail Pro – Free Disposable Email';
    }
    prevCountRef.current = currentCount;
  }, [messages]);

  // Auto-select first message on desktop if none selected
  useEffect(() => {
    if (messages && messages.length > 0 && !selectedMsg) {
      setSelectedMsg(messages[0]);
    } else if (messages && messages.length === 0) {
      setSelectedMsg(null);
      setMessageContent(null);
      setMobileView('list');
    }
  }, [messages]);

  useEffect(() => {
    if (selectedMsg) {
      fetchMessageContent(selectedMsg);
    }
  }, [selectedMsg?.id]);

  const fetchMessageContent = async (msg) => {
    setLoadingContent(true);
    setContentError(null);
    setIsOfflineContent(false);

    // If device is offline, check offline cache immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = offlineMailbox.getMessageContent(msg.id);
      if (cached) {
        setMessageContent(cached);
        setIsOfflineContent(true);
        setLoadingContent(false);
        return;
      }
    }

    try {
      const res = await axios.get(`${API_ROOT}/inbox/content/${msg.token}/${msg.id}`, {
        validateStatus: (status) => status < 500,
        timeout: 6000,
      });

      if (res.status === 401 || res.status === 403) {
        const errorMsg = res.data?.error || 'Token expired. Please create a new email address.';
        setContentError(errorMsg);
        if (onTokenExpired) onTokenExpired();
        return;
      }

      if (res.status >= 400) {
        setContentError(res.data?.error || 'Message could not be loaded. Please try again.');
        return;
      }

      setMessageContent(res.data);
      setIsOfflineContent(false);
      offlineMailbox.saveMessageContent(msg.token, msg.id, res.data);
    } catch (err) {
      // Offline fallback: try reading cached message body
      const cached = offlineMailbox.getMessageContent(msg.id);
      if (cached) {
        setMessageContent(cached);
        setIsOfflineContent(true);
      } else if (msg.html || msg.text || msg.intro) {
        setMessageContent({
          text: msg.text || msg.intro || '',
          html: msg.html || `<p>${msg.text || msg.intro || ''}</p>`,
        });
        setIsOfflineContent(true);
      } else {
        if (err.response?.status === 401 || err.response?.status === 403) {
          const errorMsg = err.response?.data?.error || 'Token expired. Please create a new email address.';
          setContentError(errorMsg);
          if (onTokenExpired) onTokenExpired();
        } else {
          setContentError('Offline: message body not yet cached.');
        }
      }
    } finally {
      setLoadingContent(false);
    }
  };

  const copyOtp = (otp, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(otp).then(() => {
      setCopiedOtp(otp);
      setTimeout(() => setCopiedOtp(''), 2200);
    });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const formatFullDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Recent';
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!msg?.id || !msg?.token) return;
    if (!window.confirm('Delete this message from your disposable inbox?')) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await axios.delete(`${API_ROOT}/inbox/${msg.token}/${msg.id}`);
      setSelectedMsg(null);
      setMessageContent(null);
      setMobileView('list');
      if (onRetry) onRetry();
    } catch (err) {
      console.warn('Could not delete message:', err);
      setDeleteError(err.response?.data?.error || 'Could not delete this message. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const sender = (m.from?.name || m.from?.address || '').toLowerCase();
    const subject = (m.subject || '').toLowerCase();
    const preview = (m.intro || m.text || '').toLowerCase();
    return sender.includes(q) || subject.includes(q) || preview.includes(q);
  });

  const getRowHeight = (index, rowProps) => {
    const msg = rowProps?.messages?.[index];
    if (!msg) return 102;
    const preview = msg.intro || msg.text || msg.subject || '';
    const hasOtp = !!extractOtpCode(`${msg.subject} ${preview}`);
    return hasOtp ? 142 : 102;
  };

  // Error State
  if (messages === null) {
    return (
      <div className="card border rounded-4 shadow-sm bg-surface">
        <div className="card-body text-center py-5">
          <div className="text-danger mb-3">
            <AppIcon iconClass="bi bi-exclamation-triangle-fill fs-1" />
          </div>
          <h5 className="text-danger">Failed to load inbox</h5>
          <p className="text-muted">Could not retrieve your messages from backend</p>
          {onRetry && (
            <button className="btn btn-primary mt-3" onClick={onRetry}>
              <AppIcon iconClass="bi bi-arrow-clockwise me-2" />
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading && (!messages || messages.length === 0)) {
    return (
      <div className="card border rounded-4 shadow-sm bg-surface">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Checking Mail.tm server for messages…</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!messages.length) {
    return (
      <div className="card border rounded-4 shadow-sm bg-surface empty-inbox-card">
        <div className="card-body text-center py-5">
          <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
            <AppIcon iconClass="bi bi-inbox fs-2" />
          </div>
          <h4 className="fw-bold mb-2">Your Inbox is Waiting</h4>
          <p className="text-muted mx-auto mb-3" style={{ maxWidth: '460px' }}>
            Emails sent to this address arrive automatically within 5 to 30 seconds. If you just sent an email from Gmail, you can wait for auto-sync or click below to check immediately.
          </p>
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
            {onRetry && (
              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                onClick={onRetry}
                disabled={isLoading}
              >
                <AppIcon iconClass={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`} />
                <span>{isLoading ? 'Checking Server…' : 'Check Mail / Refresh Now'}</span>
              </button>
            )}
          </div>
          <div className="d-inline-flex align-items-center gap-2 small text-muted px-3 py-1 rounded-pill border bg-light-subtle">
            <span className="eg-pulse-dot"></span>
            <span>Live Auto-Sync Active (Connected to Mail Server)</span>
          </div>
        </div>
      </div>
    );
  }

  // Split-Pane Master-Detail Layout
  return (
    <div className="inbox-split-wrapper shadow-sm rounded-4 border overflow-hidden bg-surface">
      <div className="row g-0">
        {/* Left Pane: Message List */}
        <div className={`col-lg-5 col-xl-4 border-end inbox-list-pane ${mobileView === 'viewer' ? 'd-none d-lg-flex' : 'd-flex'}`}>
          <div className="inbox-pane-header p-3 border-bottom d-flex flex-column gap-2 bg-light-subtle">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold small text-uppercase tracking-wider">Messages</span>
                <span className="badge bg-primary text-white rounded-pill px-2">{filteredMessages.length}</span>
                {filteredMessages.length >= 10 && (
                  <span
                    className="badge bg-success-subtle text-success border border-success-subtle rounded-pill"
                    style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}
                    title="Virtualized list active: Renders only visible rows for 60fps performance with 100+ emails"
                  >
                    Virtualized ⚡
                  </span>
                )}
              </div>
              {onRetry && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary py-1 px-2"
                  onClick={onRetry}
                  title="Refresh inbox messages"
                >
                  <AppIcon iconClass={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`} />
                </button>
              )}
            </div>
            {messages.length > 1 && (
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <AppIcon iconClass="bi bi-search text-muted" size={12} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Filter messages or senders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchQuery('')}
                  >
                    <AppIcon iconClass="bi bi-x" size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="inbox-list-scroll">
            {filteredMessages.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                <AppIcon iconClass="bi bi-search mb-2 fs-4 opacity-50" />
                <p className="mb-2">No emails match &ldquo;{searchQuery}&rdquo;</p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <List
                rowCount={filteredMessages.length}
                rowHeight={getRowHeight}
                rowComponent={EmailRowItem}
                rowProps={{
                  messages: filteredMessages,
                  selectedId: selectedMsg?.id,
                  copiedOtp,
                  onSelect: (msg) => {
                    setSelectedMsg(msg);
                    setMobileView('viewer');
                  },
                  onCopyOtp: copyOtp,
                  formatDate,
                }}
                overscanCount={4}
                defaultHeight={560}
                style={{ height: '100%', width: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Right Pane: Message Viewer */}
        <div className={`col-lg-7 col-xl-8 inbox-viewer-pane ${mobileView === 'list' ? 'd-none d-lg-block' : 'd-block inbox-viewer-mobile-active'}`}>
          {selectedMsg ? (
            <div className="d-flex flex-column h-100">
              {/* Message Header */}
              <div className="p-3 p-md-4 border-bottom bg-light-subtle">
                {/* Mobile Back Button */}
                <div className="d-flex align-items-center justify-content-between mb-3 d-lg-none border-bottom pb-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary fw-semibold px-3 py-1 d-inline-flex align-items-center gap-1"
                    onClick={() => setMobileView('list')}
                    style={{ minHeight: '38px' }}
                  >
                    <AppIcon iconClass="bi bi-arrow-left" />
                    <span>Back to Messages</span>
                  </button>
                  <span className="small text-muted font-monospace">{formatDate(selectedMsg.createdAt)}</span>
                </div>

                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                  <h4 className="fw-bold text-dark fs-5 mb-0 text-break">
                    {selectedMsg.subject || '(No Subject)'}
                  </h4>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'html' ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2 small`}
                      onClick={() => setViewMode('html')}
                      style={{ minHeight: '34px' }}
                    >
                      HTML
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'text' ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2 small`}
                      onClick={() => setViewMode('text')}
                      style={{ minHeight: '34px' }}
                    >
                      Plain Text
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger py-1 px-2 d-inline-flex align-items-center gap-1"
                      onClick={() => handleDeleteMessage(selectedMsg)}
                      disabled={isDeleting}
                      title="Delete this email"
                      style={{ minHeight: '34px' }}
                    >
                      <AppIcon iconClass={`bi bi-trash ${isDeleting ? 'spin' : ''}`} size={14} />
                      <span className="d-none d-sm-inline">{isDeleting ? 'Deleting…' : 'Delete'}</span>
                    </button>
                  </div>
                </div>

                {deleteError && (
                  <div className="alert alert-danger mx-3 mt-2 mb-0" role="alert">
                    {deleteError}
                  </div>
                )}

                <div className="inbox-detail-meta small text-secondary">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex flex-wrap gap-x-4 gap-y-1">
                      <div>
                        <strong>From:</strong> {selectedMsg.from?.name ? `${selectedMsg.from.name} <${selectedMsg.from.address}>` : (selectedMsg.from?.address || 'Unknown')}
                      </div>
                      <div>
                        <strong>To:</strong> {selectedMsg.to?.[0]?.address || 'You'}
                      </div>
                      <div>
                        <strong>Date:</strong> {formatFullDate(selectedMsg.createdAt)}
                      </div>
                    </div>
                    {isOfflineContent && (
                      <span
                        className="badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1"
                        style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontSize: '0.72rem' }}
                        title="You are viewing the offline cached version of this message"
                      >
                        <AppIcon iconClass="bi bi-cloud-slash" size={12} />
                        <span>Offline Cached</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="p-3 p-md-4 flex-grow-1 overflow-auto inbox-body-area">
                {loadingContent ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">Loading message body…</span>
                  </div>
                ) : contentError ? (
                  <div className="alert alert-danger d-flex align-items-center justify-content-between">
                    <span>{contentError}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => fetchMessageContent(selectedMsg)}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <SafeEmailViewer
                    html={messageContent?.html || selectedMsg?.html}
                    text={messageContent?.text || selectedMsg?.text || selectedMsg?.intro}
                    viewMode={viewMode}
                    isOffline={isOfflineContent}
                  />
                )}

                {/* Attachments & Download Section */}
                {((messageContent?.attachments && messageContent.attachments.length > 0) || selectedMsg.hasAttachments) && (
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <AppIcon iconClass="bi bi-paperclip fs-5 text-primary" />
                        <span>Attached Files ({messageContent?.attachments?.length || 1})</span>
                      </h6>
                      <a
                        href={`${API_ROOT}/inbox/download/${selectedMsg?.token || messageContent?.token || ''}/${selectedMsg.id}`}
                        download={`email-${selectedMsg.id}.eml`}
                        className="btn btn-sm btn-outline-secondary py-1 px-2 small d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem' }}
                        title="Download raw email with all attachments (.eml)"
                      >
                        <AppIcon iconClass="bi bi-download" size={13} />
                        <span>Download Full .eml</span>
                      </a>
                    </div>

                    {messageContent?.attachments && messageContent.attachments.length > 0 ? (
                      <div className="row g-2 mt-1">
                        {messageContent.attachments.map((att) => {
                          const sizeKb = att.size ? Math.round(att.size / 1024) : 0;
                          const sizeDisplay = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
                          const tokenForDownload = selectedMsg?.token || messageContent?.token || '';
                          const downloadUrl = `${API_ROOT}/inbox/attachment/${tokenForDownload}/${selectedMsg.id}/${att.id}`;

                          return (
                            <div key={att.id} className="col-sm-6">
                              <div className="p-2 rounded-3 border bg-light d-flex align-items-center justify-content-between gap-2">
                                <div className="d-flex align-items-center gap-2 text-truncate">
                                  <AppIcon iconClass="bi bi-file-earmark-arrow-down text-primary fs-5" />
                                  <div className="text-truncate">
                                    <div className="small fw-semibold text-truncate text-dark" title={att.filename}>
                                      {att.filename || 'attachment'}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                      {sizeDisplay} · {att.contentType?.split('/')[1] || 'file'}
                                    </div>
                                  </div>
                                </div>
                                <a
                                  href={downloadUrl}
                                  download={att.filename || 'attachment'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-primary py-1 px-2 d-inline-flex align-items-center"
                                  title={`Download ${att.filename || 'file'}`}
                                >
                                  <AppIcon iconClass="bi bi-download" size={14} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="alert alert-info py-2 px-3 small d-flex align-items-center justify-content-between mt-2">
                        <span>This message contains attached files. Click below to download the complete email package:</span>
                        <a
                          href={`${API_ROOT}/inbox/download/${selectedMsg.token}/${selectedMsg.id}`}
                          download={`email-${selectedMsg.id}.eml`}
                          className="btn btn-sm btn-primary ms-2"
                        >
                          Download .eml
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 p-5 text-muted">
              <div className="text-center">
                <AppIcon iconClass="bi bi-envelope-open fs-1 mb-2 opacity-50" />
                <p className="mb-0">Select an email from the left to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;