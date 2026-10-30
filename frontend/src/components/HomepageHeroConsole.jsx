import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppIcon from './AppIcon';
import { getApiRoot } from '../utils/apiRoot.js';

const API_ROOT = getApiRoot();

const HomepageHeroConsole = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('tempMailAccount');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // No hardcoded domain: only live Mail.tm domains from the backend are shown.
  const [availableDomains, setAvailableDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domainsLoaded, setDomainsLoaded] = useState(false);
  const [customUser, setCustomUser] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [heroError, setHeroError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);
  const isCreatingRef = useRef(false);
  const hasInitRef = useRef(false);

  // Fetch live domains
  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_ROOT}/accounts/domains`)
      .then((res) => {
        if (isMounted && res.data?.domains && Array.isArray(res.data.domains) && res.data.domains.length > 0) {
          setAvailableDomains(res.data.domains);
          setSelectedDomain((prev) => (res.data.domains.includes(prev) ? prev : res.data.domains[0]));
          setDomainsLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Hero console domain fetch fallback:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Check stored inbox count
  useEffect(() => {
    if (account?.token) {
      try {
        const cached = localStorage.getItem(`inbox-${account.token}`);
        if (cached) {
          setInboxCount(JSON.parse(cached).length);
        }
      } catch {}
    }
  }, [account]);

  // Auto-generate on first visit or migrate outdated mock accounts, but only
  // after live domains have loaded — never with a hardcoded/stale domain.
  useEffect(() => {
    if (!domainsLoaded || hasInitRef.current) return;
    hasInitRef.current = true;

    if (!account || account.token?.startsWith('mock_') || account.address?.includes('uberip.com')) {
      handleCreateAccount();
    }
  }, [domainsLoaded]);

  const handleCreateAccount = async (opts = {}) => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreating(true);
    setHeroError('');

    try {
      const domain = opts.domain || (availableDomains.includes(selectedDomain) ? selectedDomain : null);
      const username = (opts.username !== undefined ? opts.username : customUser).trim() || null;

      const payload = {};
      if (username) payload.username = username;
      if (domain) payload.domain = domain;

      const res = await axios.post(`${API_ROOT}/accounts/create`, payload);
      const accData = {
        ...res.data,
        expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      setAccount(accData);
      localStorage.setItem('tempMailAccount', JSON.stringify(accData));

      // Append to generatedEmails cleanly (deduplicated & capped to 10)
      const existing = (() => {
        try {
          const s = localStorage.getItem('generatedEmails');
          return s ? JSON.parse(s) : [];
        } catch {
          return [];
        }
      })();

      const addr = accData.address || accData.email;
      if (addr) {
        const filtered = Array.isArray(existing)
          ? existing.filter((e) => (e.address || e.email) !== addr)
          : [];
        const updated = [
          {
            address: addr,
            expiration: accData.expiration,
            createdAt: accData.createdAt,
            token: accData.token,
          },
          ...filtered,
        ].slice(0, 10);
        localStorage.setItem('generatedEmails', JSON.stringify(updated));
      }
      setShowCustomize(false);
    } catch (err) {
      console.warn('Hero account generation fallback:', err);
      setHeroError(err?.response?.data?.error || 'Could not create a real temporary email. The backend could not be reached or Mail.tm is unavailable right now — please try again.');
      const freshDomains = err?.response?.data?.availableDomains;
      if (Array.isArray(freshDomains) && freshDomains.length > 0) {
        setAvailableDomains(freshDomains);
        setSelectedDomain(freshDomains[0]);
        setDomainsLoaded(true);
      }
    } finally {
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  };

  const copyAddress = () => {
    const email = account?.address || account?.email;
    if (!email) return;
    navigator.clipboard
      .writeText(email)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      })
      .catch(() => {});
  };

  const activeEmail = account?.address || account?.email || 'Generating your address…';

  return (
    <div className="homepage-hero-console">
      <div className="console-window shadow-lg border rounded-4 overflow-hidden bg-surface">
        {/* Console Top bar */}
        <div className="console-topbar d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="console-dot bg-danger"></span>
            <span className="console-dot bg-warning"></span>
            <span className="console-dot bg-success"></span>
            <span className="console-title ms-2 fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>
              Instant Disposable Address · Mail.tm Engine
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-semibold" style={{ fontSize: '0.74rem' }}>
              <span className="eg-pulse-dot me-1"></span> Ready to Receive
            </span>
          </div>
        </div>

        {/* Console Main Body */}
        <div className="console-body p-4 text-center">
          <div className="mb-2 text-start">
            <span className="small text-muted text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.72rem' }}>
              Your Instant Temporary Email:
            </span>
          </div>

          {/* Active Address Box */}
          <div className="console-address-box d-flex align-items-center justify-content-between p-2 ps-3 rounded-3 border bg-light-subtle mb-3">
            <span className="console-address-text font-monospace fw-bold text-dark text-truncate me-2" title={activeEmail}>
              {isCreating ? 'Creating mailbox on live backend…' : activeEmail}
            </span>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${isCopied ? 'btn-success' : 'btn-primary'} console-copy-btn fw-semibold px-3`}
                onClick={copyAddress}
                disabled={isCreating}
                style={{ minWidth: '105px', minHeight: '44px' }}
              >
                {isCopied ? (
                  <>
                    <AppIcon iconClass="bi bi-check2 me-1" /> Copied!
                  </>
                ) : (
                  <>
                    <AppIcon iconClass="bi bi-clipboard me-1" /> Copy
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary console-action-btn"
                onClick={() => handleCreateAccount({})}
                disabled={isCreating}
                title="Generate new random address"
                style={{ minHeight: '44px', minWidth: '44px', padding: 0 }}
              >
                <AppIcon iconClass={`bi bi-arrow-clockwise ${isCreating ? 'spin' : ''}`} />
              </button>
            </div>
          </div>

          {heroError && (
            <div className="alert alert-danger text-start small mb-3" role="alert">
              {heroError}
            </div>
          )}
          <p className="small text-muted text-start mb-3">
            Keep this inbox private — anyone who can open it can read its messages. Do not share it.
          </p>

          {/* Secondary Controls: Domain & Username Toggle */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Domain:</span>
              <select
                className="form-select form-select-sm console-domain-select"
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  handleCreateAccount({ domain: e.target.value });
                }}
                disabled={isCreating || availableDomains.length === 0}
                style={{ width: 'auto', fontWeight: 600, fontSize: '0.86rem', minHeight: '40px' }}
              >
                {availableDomains.length === 0 ? (
                  <option value="" disabled>
                    Loading live domains…
                  </option>
                ) : (
                  availableDomains.map((d) => (
                    <option key={d} value={d}>
                      @{d}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none p-1 text-primary small d-inline-flex align-items-center"
              onClick={() => setShowCustomize((v) => !v)}
              style={{ minHeight: '40px' }}
            >
              <AppIcon iconClass={`bi ${showCustomize ? 'bi-chevron-up' : 'bi-sliders'} me-1`} />
              {showCustomize ? 'Hide custom options' : 'Customize username'}
            </button>
          </div>

          {/* Collapsible custom username row */}
          {showCustomize && (
            <div className="console-custom-panel p-3 rounded-3 border bg-body-tertiary mb-3 text-start">
              <label className="form-label small fw-semibold text-muted mb-1" htmlFor="hero-custom-user">
                Custom Username:
              </label>
              <div className="input-group input-group-sm mb-2">
                <input
                  id="hero-custom-user"
                  type="text"
                  className="form-control"
                  placeholder="e.g. waqas, shop2026…"
                  value={customUser}
                  onChange={(e) => setCustomUser(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  maxLength={24}
                  style={{ minHeight: '42px' }}
                />
                <span className="input-group-text bg-light text-muted">@{selectedDomain}</span>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => handleCreateAccount({ username: customUser })}
                  disabled={isCreating || !customUser.trim()}
                  style={{ minHeight: '42px', minWidth: '70px' }}
                >
                  Create
                </button>
              </div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Letters, numbers, dots, and hyphens allowed.
              </small>
            </div>
          )}

          {/* Action Row: Open Full Multi-Inbox Workspace */}
          <div className="console-footer-row pt-3 d-flex flex-wrap align-items-center justify-content-between gap-3 border-top">
            <div className="text-start">
              <span className="small text-muted d-block" style={{ fontSize: '0.8rem' }}>
                Need multiple inboxes at once?
              </span>
              <strong className="text-dark small">
                {inboxCount > 0 ? `${inboxCount} active inbox message(s)` : 'Multi-Inbox Workspace is 100% Free'}
              </strong>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm fw-semibold px-3 py-2 flex-grow-1 flex-md-grow-0"
              onClick={() => navigate('/app')}
              style={{ minHeight: '44px' }}
            >
              <AppIcon iconClass="bi bi-layers-fill me-1" />
              Open Multi-Inbox Workspace →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageHeroConsole;
