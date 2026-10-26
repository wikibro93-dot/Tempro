import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import AccountManager from "./AccountManager.jsx";
import Inbox from "./Inbox.jsx";
import EmailSidebar from "./EmailSidebar.jsx";
import EmailGenerator from "./EmailGenerator.jsx";
import Footer from "./Footer";
import ErrorAlert from "./ErrorAlert";
import YesimRecommendation from "./YesimRecommendation.jsx";
import PageNavbar from "./PageNavbar";
import AppIcon from "./AppIcon";
import batchInboxManager from "../utils/batchInboxManager";
import offlineMailbox from "../utils/offlineMailbox";

const RAW_API_BASE = import.meta.env.VITE_API_BASE || '';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');
const API_ROOT = API_BASE ? `${API_BASE}/api` : '/api';

const DURATIONS = {
  "10min": 10 * 60 * 1000,
  "1hour": 60 * 60 * 1000,
  "24hour": 24 * 60 * 60 * 1000,
  "max": 3650 * 24 * 60 * 60 * 1000
};

const POLLING_INTERVALS = {
  FAST: 5000,
  NORMAL: 10000,
  SLOW: 30000
};

const AUTO_DISMISS_ERROR_MS = 4500;

const isPersistentError = (message = "") => {
  const text = String(message).toLowerCase();
  return (
    text.includes("expired") ||
    text.includes("session") ||
    text.includes("token") ||
    text.includes("unauthorized")
  );
};

function TempMailApp({ onEmailCopied }) {
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem("tempMailAccount");
    return saved ? JSON.parse(saved) : null;
  });
  const [generatedEmails, setGeneratedEmails] = useState(() => {
    try {
      const saved = localStorage.getItem("generatedEmails");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const unique = [];
      const seen = new Set();
      for (const item of parsed) {
        const addr = (item.address || item.email || '').toLowerCase();
        if (addr && !seen.has(addr)) {
          seen.add(addr);
          unique.push(item);
        }
      }
      return unique.slice(0, 10);
    } catch {
      return [];
    }
  });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailDuration, setEmailDuration] = useState(() => {
    const saved = localStorage.getItem("emailDuration");
    return saved || "1hour";
  });
  const [pollingInterval, setPollingInterval] = useState(() => {
    const saved = localStorage.getItem("pollingInterval");
    return saved ? parseInt(saved) : POLLING_INTERVALS.NORMAL;
  });
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [isBackgroundPolling, setIsBackgroundPolling] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showExpiredCard, setShowExpiredCard] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [inboxCounts, setInboxCounts] = useState(() => {
    // Seed counts safely from localStorage cached messages
    try {
      const saved = localStorage.getItem('generatedEmails');
      if (!saved) return {};
      const emails = JSON.parse(saved);
      if (!Array.isArray(emails)) return {};
      const counts = {};
      emails.forEach((e) => {
        try {
          const token = e?.token;
          if (!token) return;
          const cached = localStorage.getItem(`inbox-${token}`);
          if (cached) counts[token] = JSON.parse(cached).length;
        } catch (_) {}
      });
      return counts;
    } catch {
      return {};
    }
  });

  const [availableDomains, setAvailableDomains] = useState(['maxxspace.com']);
  const [selectedDomain, setSelectedDomain] = useState('maxxspace.com');

  useEffect(() => {
    let isMounted = true;
    const fetchDomains = async () => {
      try {
        const res = await axios.get(`${API_ROOT}/accounts/domains`);
        if (isMounted && res.data?.domains && Array.isArray(res.data.domains) && res.data.domains.length > 0) {
          setAvailableDomains(res.data.domains);
          setSelectedDomain(prev => res.data.domains.includes(prev) ? prev : res.data.domains[0]);
        }
      } catch (err) {
        console.warn('Could not load domains list from unified backend:', err);
      }
    };
    fetchDomains();
    return () => { isMounted = false; };
  }, []);

  const location = useLocation();
  const isAppPage = location.pathname === "/app";
  const currentUrl = `${window.location.origin}${location.pathname}`;

  // Use refs to access current state in intervals and prevent loops
  const accountRef = useRef(account);
  const pollingIntervalRef = useRef(pollingInterval);
  const isCreatingRef = useRef(false);
  const hasAutoInitRef = useRef(false);

  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  useEffect(() => {
    pollingIntervalRef.current = pollingInterval;
  }, [pollingInterval]);

  // Add token expiration handler
  const handleTokenExpired = () => {
    setTokenValid(false);
    setError({ message: "Session expired. Please create a new email address." });
  };

  const setDuration = (duration) => {
    setEmailDuration(duration);
    localStorage.setItem("emailDuration", duration);
  };

  const setPollingSpeed = (speed) => {
    setPollingInterval(speed);
    localStorage.setItem("pollingInterval", speed.toString());
  };

  useEffect(() => {
    if (account) {
      localStorage.setItem("tempMailAccount", JSON.stringify(account));
      // Load messages from localStorage if available
      const savedMessages = localStorage.getItem(`inbox-${account.token}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      fetchInbox(true); // Initial load - show loading indicator
    }
  }, [account]);

  useEffect(() => {
    if (error?.message?.includes('expired')) {
      setTokenValid(false);
      setShowExpiredCard(true);
      // Clear any stored data for this token
      if (account) {
        localStorage.removeItem(`inbox-${account.token}`);
      }
    }
  }, [error, account]);

  // Auto-dismiss temporary alerts so they behave like toasts.
  useEffect(() => {
    if (!error) return;

    const message = typeof error === "string" ? error : error?.message;
    if (isPersistentError(message)) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setError(null);
    }, AUTO_DISMISS_ERROR_MS);

    return () => window.clearTimeout(timerId);
  }, [error]);

  useEffect(() => {
    localStorage.setItem("generatedEmails", JSON.stringify(generatedEmails));
  }, [generatedEmails]);

  useEffect(() => {
    if (account?.token && Array.isArray(messages)) {
      // Save full set of loaded messages to offlineMailbox for offline PWA access
      offlineMailbox.saveMessages(account.token, messages);
    }
  }, [messages, account]);

  // Auto-generate on mount exactly once if no valid account exists
  useEffect(() => {
    if (hasAutoInitRef.current) return;
    hasAutoInitRef.current = true;

    const savedAccRaw = localStorage.getItem("tempMailAccount");
    let currentAcc = null;
    try {
      currentAcc = savedAccRaw ? JSON.parse(savedAccRaw) : null;
    } catch {}

    const isMockOrInactive = currentAcc && (currentAcc.token?.startsWith('mock_') || currentAcc.address?.includes('uberip.com'));

    if (isMockOrInactive) {
      localStorage.removeItem("tempMailAccount");
      setAccount(null);
      createNewAccount({ durationMs: 3600000 });
    } else if (isAppPage && !currentAcc) {
      createNewAccount({ durationMs: 3600000 });
    }
  }, [isAppPage]);

  // Effect to check if email has expired and show the card
  useEffect(() => {
    if (!account?.expiration) return;

    const checkExpiration = () => {
      const now = new Date();
      const expiration = new Date(account.expiration);
      const isExpired = now > expiration;
      
      setTokenValid(!isExpired);
      setShowExpiredCard(isExpired);
      
      if (isExpired) {
        setError({ message: "Session expired. Please create a new email address." });
      }
    };

    // Check immediately
    checkExpiration();

    // Then check every minute
    const intervalId = setInterval(checkExpiration, 60000);
    
    return () => clearInterval(intervalId);
  }, [account]);
  const createNewAccount = async (options = {}) => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;

    const isAuto = options === true;
    const customName = typeof options === 'object' ? options.customName : null;
    const durationMs = typeof options === 'object' && options.durationMs
      ? options.durationMs
      : DURATIONS['1hour'];

    const normalizeRequestedUsername = (value) => {
      if (!value || typeof value !== 'string') return null;

      const sanitized = value
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '')
        .replace(/^[._-]+|[._-]+$/g, '')
        .slice(0, 24);

      if (!sanitized) return null;
      if (sanitized.length >= 3) return sanitized;

      const needed = 3 - sanitized.length;
      const pad = Math.random().toString(36).slice(2, 2 + needed);
      return `${sanitized}${pad}`;
    };

    const requestedUsername = normalizeRequestedUsername(customName);

    const customDomain = (typeof options === 'object' && options?.domain) ? options.domain : selectedDomain;

    setIsLoading(true);
    setError(null);
    setShowExpiredCard(false);
    setShowAddPanel(false);

    try {
      let res;
      const payload = {};
      if (customName) {
        if (!requestedUsername) {
          setError({ message: 'Please enter a valid custom name (letters or numbers).' });
          return;
        }
        payload.username = requestedUsername;
      }
      if (customDomain) {
        payload.domain = customDomain;
      }

      res = await axios.post(`${API_ROOT}/accounts/create`, payload);

      if (customName) {
        const createdAddress = (res.data?.address || res.data?.email || '').toLowerCase();
        const createdLocalPart = createdAddress.split('@')[0] || '';
        if (!createdLocalPart.startsWith(requestedUsername)) {
          setError({
            message: `Could not create custom email "${requestedUsername}". Please try another name.`
          });
          return;
        }
      }
      const now = new Date();
      const expirationTime = new Date(now.getTime() + (isAuto ? DURATIONS['1hour'] : durationMs));
      const accountData = {
        ...res.data,
        expiration: expirationTime.toISOString(),
        createdAt: new Date().toISOString(),
      };
      setAccount(accountData);
      setTokenValid(true);
      const addr = accountData.address || accountData.email;
      if (addr) {
        setGeneratedEmails(prev => {
          const filtered = prev.filter(e => (e.address || e.email) !== addr);
          return [{
            address: addr,
            expiration: accountData.expiration,
            createdAt: accountData.createdAt,
            token: accountData.token
          }, ...filtered].slice(0, 10);
        });
      }
      setMessages([]);
    } catch (err) {
      console.warn('Backend account creation error, creating local fallback account:', err);
      const fallbackUser = requestedUsername || ('user' + Math.random().toString(36).slice(2, 7));
      const fallbackDomain = customDomain || 'maxxspace.com';
      const fallbackAddr = `${fallbackUser}@${fallbackDomain}`;
      const now = new Date();
      const expirationTime = new Date(now.getTime() + (isAuto ? DURATIONS['1hour'] : durationMs));
      const fallbackToken = 'mock_' + Math.random().toString(36).slice(2, 12);
      const fallbackData = {
        address: fallbackAddr,
        email: fallbackAddr,
        token: fallbackToken,
        expiration: expirationTime.toISOString(),
        createdAt: now.toISOString(),
      };
      setAccount(fallbackData);
      setTokenValid(true);
      if (fallbackAddr) {
        setGeneratedEmails(prev => {
          const filtered = prev.filter(e => (e.address || e.email) !== fallbackAddr);
          return [fallbackData, ...filtered].slice(0, 10);
        });
      }
      const welcomeMsg = [{
        id: 'msg_welcome_' + Date.now(),
        token: fallbackToken,
        from: { address: 'support@tempmailpk.com', name: 'TempMail Pro Support' },
        to: [{ address: fallbackAddr }],
        subject: 'Welcome to TempMail Pro - Disposable Email Active',
        intro: 'Your temporary email address is active and ready to receive messages.',
        text: `Welcome to TempMail Pro!\n\nYour temporary address (${fallbackAddr}) is ready.\n\nUse this address to protect your personal inbox from spam and unwanted marketing.`,
        html: `<div style="font-family: sans-serif; padding: 16px; color: #1e293b;">
          <h3 style="color: #4361ee; margin-top: 0;">Welcome to TempMail Pro</h3>
          <p>Your temporary email <strong>${fallbackAddr}</strong> is ready.</p>
          <p style="color: #64748b; font-size: 14px;">Incoming emails will appear in your inbox automatically.</p>
        </div>`,
        createdAt: now.toISOString(),
      }];
      setMessages(welcomeMsg);
      localStorage.setItem(`inbox-${fallbackToken}`, JSON.stringify(welcomeMsg));
      setError(null);
    } finally {
      setIsLoading(false);
      isCreatingRef.current = false;
    }
  };

  const switchAccount = (emailAddress) => {
    const emailAccount = generatedEmails.find(e => e.address === emailAddress);
    if (emailAccount) {
      setAccount({
        address: emailAccount.address,
        email: emailAccount.address,
        expiration: emailAccount.expiration,
        token: emailAccount.token,
        createdAt: emailAccount.createdAt,
      });
      const cached = offlineMailbox.getMessages(emailAccount.token);
      setMessages(cached || []);
      setTokenValid(true);
      setShowExpiredCard(false);
    }
  };

  const deleteEmail = (emailAddress) => {
    setGeneratedEmails(prev => {
      const remaining = prev.filter(e => e.address !== emailAddress);
      const cur = accountRef.current;
      const curAddr = cur?.address || cur?.email;
      if (curAddr === emailAddress) {
        if (remaining.length > 0) {
          switchAccount(remaining[0].address);
        } else {
          setAccount(null);
          createNewAccount({ durationMs: 3600000 });
        }
      }
      return remaining;
    });
  };

  const fetchInbox = async (showLoading = false) => {
    const currentToken = accountRef.current?.token;
    if (!currentToken || currentToken === 'undefined' || currentToken === 'null') return;

    if (accountRef.current.expiration) {
      const now = new Date();
      const expiration = new Date(accountRef.current.expiration);
      if (now > expiration) {
        setTokenValid(false);
        setShowExpiredCard(true);
        setError({ message: 'Session expired. Please create a new email address.' });
        return;
      }
    }

    // Offline bypass: load cached messages immediately without triggering network timeouts
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = offlineMailbox.getMessages(currentToken);
      if (cached && cached.length > 0) {
        setMessages(cached);
        setInboxCounts(prev => ({ ...prev, [currentToken]: cached.length }));
      }
      if (showLoading) setIsInboxLoading(false);
      return;
    }

    if (showLoading) setIsInboxLoading(true);
    else setIsBackgroundPolling(true);

    try {
      const res = await axios.get(`${API_ROOT}/inbox/${currentToken}`, {
        timeout: 10000
      });
      const inboxArray = Array.isArray(res.data) ? res.data : res.data?.messages || [];
      const loadedMessages = inboxArray.slice(-100);
      setMessages(loadedMessages);
      offlineMailbox.saveMessages(currentToken, loadedMessages);
      setInboxCounts(prev => ({ ...prev, [currentToken]: loadedMessages.length }));
      setError(null);
      setTokenValid(true);
    } catch (err) {
      let errorMessage = 'Failed to load inbox';
      const status = err.response?.status;
      const isTransient = status === 503 || status === 502 || status === 504 || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';

      if (err.code === 'ECONNABORTED') errorMessage = 'Request timeout. Please check your connection.';
      else if (status === 401) { setTokenValid(false); setShowExpiredCard(true); errorMessage = 'Session expired. Please create a new email address.'; }
      else if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.message) errorMessage = err.message;

      // Handle transient gateway/server reload gracefully without tripping error listeners
      if (isTransient) {
        console.warn('Inbox gateway temporary delay (retrying automatically):', err.message);
      } else {
        console.warn('Inbox fetch note:', err.message);
      }

      const cached = offlineMailbox.getMessages(currentToken);
      if (cached && cached.length > 0) {
        setMessages(cached);
        setInboxCounts(prev => ({ ...prev, [currentToken]: cached.length }));
        // If cached messages exist, do not display a blocking alert
        return;
      }

      // Only show visible alerts for user-triggered fetches or token/session issues (never for background 503/502).
      const isSessionError = status === 401 || errorMessage.toLowerCase().includes('expired');
      if ((showLoading && !isTransient) || isSessionError) {
        setError({ message: errorMessage });
      }
    } finally {
      if (showLoading) setIsInboxLoading(false);
      else setTimeout(() => setIsBackgroundPolling(false), 300);
    }
  };

  // Real-time Live SSE Stream with Polling Fallback
  useEffect(() => {
    if (!account?.token || !tokenValid) return;

    let eventSource = null;
    let fallbackInterval = null;

    // 1. Attempt Real-time SSE Connection
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        eventSource = new EventSource(`${API_ROOT}/inbox/stream/${account.token}`);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'inbox' && Array.isArray(data.messages)) {
              setMessages(data.messages);
              localStorage.setItem(`inbox-${account.token}`, JSON.stringify(data.messages));
              setInboxCounts((prev) => ({ ...prev, [account.token]: data.messages.length }));
            } else if (data.type === 'error' && data.code === 'EXPIRED') {
              handleTokenExpired();
            }
          } catch (e) {
            console.warn('[SSE] Parse warning:', e);
          }
        };

        eventSource.onerror = () => {
          // Fall back gracefully to polling on any network interruption
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!fallbackInterval) {
            fallbackInterval = setInterval(() => fetchInbox(false), pollingInterval);
          }
        };
      } else {
        fallbackInterval = setInterval(() => fetchInbox(false), pollingInterval);
      }
    } catch {
      fallbackInterval = setInterval(() => fetchInbox(false), pollingInterval);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [account?.token, pollingInterval, tokenValid]);

  // High-performance Batch Background Polling across all user inboxes
  useEffect(() => {
    if (!generatedEmails || generatedEmails.length === 0) return;

    let isCancelled = false;

    const checkAllInboxesBatch = async () => {
      const tokens = generatedEmails.map(e => e.token).filter(Boolean);
      if (tokens.length === 0) return;

      try {
        const batchResults = await batchInboxManager.checkBatch(tokens);
        if (isCancelled) return;

        const newCounts = {};
        Object.entries(batchResults).forEach(([tok, info]) => {
          if (info && typeof info.count === 'number') {
            newCounts[tok] = info.count;
            if (Array.isArray(info.messages) && info.messages.length > 0) {
              offlineMailbox.saveMessages(tok, info.messages);
            }
            // If it's the active account and has new messages
            if (accountRef.current?.token === tok && Array.isArray(info.messages) && info.messages.length > 0) {
              setMessages(info.messages);
            }
          }
        });

        if (Object.keys(newCounts).length > 0) {
          setInboxCounts(prev => ({ ...prev, ...newCounts }));
        }
      } catch (err) {
        console.warn('[Batch Polling] Note:', err.message);
      }
    };

    // Run batch check every 8 seconds in the background
    const timer = setInterval(checkAllInboxesBatch, 8000);
    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [generatedEmails]);

  return (
    <>
      <div className="container-fluid py-3 px-3 px-md-4">
        <PageNavbar />

        {isBackgroundPolling && (
          <div className="background-polling-indicator">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Checking for new messages...</span>
            </div>
          </div>
        )}

        <section className="monetag-app-ad-section" aria-label="Sponsored content">
          <div className="monetag-app-ad-slot">
            <div className="monetag-ad-slot__label">Sponsored</div>
            <div className="monetag-ads monetag-ads--compact" data-zone="11505330" data-ad-format="auto" aria-live="polite"></div>
          </div>
        </section>

        {error && !showExpiredCard && (
          <ErrorAlert error={error} setError={setError} onRetry={fetchInbox} />
        )}

        {/* Two-column layout — sidebar + main */}
        <div className="multi-inbox-layout">

          {/* ── Left Sidebar ── */}
          <EmailSidebar
            generatedEmails={generatedEmails}
            activeToken={account?.token}
            inboxCounts={inboxCounts}
            isCreating={isLoading}
            onSwitch={switchAccount}
            onDelete={deleteEmail}
            onCreateNew={() => setShowAddPanel(v => !v)}
          />

          {/* ── Main Content ── */}
          <div className="multi-inbox-main">

            {/* Generator: full-hero when no account, compact panel when adding */}
            {(!account || showAddPanel) && (
              <EmailGenerator
                onGenerate={(opts) => createNewAccount(opts)}
                isLoading={isLoading}
                compact={!!account}
                availableDomains={availableDomains}
                selectedDomain={selectedDomain}
                onDomainChange={setSelectedDomain}
              />
            )}

            {/* Active inbox view */}
            {account && !showAddPanel && (
              <>
                {showExpiredCard && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                    <AppIcon iconClass="bi bi-exclamation-triangle-fill" />
                    <span>This email has expired. Use <strong>+ Add Inbox</strong> in the sidebar to create a new one.</span>
                  </div>
                )}

                <AccountManager
                  account={account}
                  refreshInbox={() => fetchInbox(true)}
                  onEmailCopied={onEmailCopied}
                  isLoading={isLoading || isInboxLoading}
                  onNewEmailClick={() => setShowAddPanel(v => !v)}
                />

                {!showExpiredCard && tokenValid && (
                  <div className="mt-3">
                    <YesimRecommendation />
                  </div>
                )}

                <Inbox
                  messages={messages.map(msg => ({ ...msg, token: account.token }))}
                  isLoading={isInboxLoading}
                  onRetry={() => fetchInbox(true)}
                  onTokenExpired={handleTokenExpired}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}


export default TempMailApp;
