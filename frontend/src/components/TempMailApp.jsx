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

import { getApiRoot } from '../utils/apiRoot.js';

const API_ROOT = getApiRoot();

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

  // No hardcoded domain: the list always comes from Mail.tm via the backend.
  // Until it loads, no domain is shown or used, so a stale domain can never
  // be presented as if it were live.
  const [availableDomains, setAvailableDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domainsLoaded, setDomainsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDomains = async () => {
      try {
        const res = await axios.get(`${API_ROOT}/accounts/domains`);
        if (isMounted && res.data?.domains && Array.isArray(res.data.domains) && res.data.domains.length > 0) {
          setAvailableDomains(res.data.domains);
          setSelectedDomain(prev => res.data.domains.includes(prev) ? prev : res.data.domains[0]);
          setDomainsLoaded(true);
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
      // Production rule: never create a local mock mailbox. If the backend
      // could not create a real Mail.tm account, show an error and keep
      // the user on their previous account (if any) instead of giving them
      // an address that can never receive mail.
      const backendMessage = err?.response?.data?.error;
      const freshDomains = err?.response?.data?.availableDomains;
      if (Array.isArray(freshDomains) && freshDomains.length > 0) {
        setAvailableDomains(freshDomains);
        setSelectedDomain(freshDomains[0]);
        setDomainsLoaded(true);
      }
      setError({ message: backendMessage || 'Could not create a real temporary email. Mail.tm is unreachable right now, please try again.' });
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

        {/* Two-column layout — sidebar + main */}
        <div className="multi-inbox-layout">

          {/* ── Left Sidebar (Mobile strip on <992px, left column on desktop) ── */}
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
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-2 py-2 px-3 small">
                    <AppIcon iconClass="bi bi-exclamation-triangle-fill text-warning" />
                    <span>This email has expired. Use <strong>+ New</strong> to generate a fresh address.</span>
                  </div>
                )}

                <div className="alert alert-warning d-flex align-items-center gap-2 mb-2 py-2 px-3 small" role="note">
                  <AppIcon iconClass="bi bi-exclamation-triangle-fill text-warning" />
                  <span>Keep this inbox private: anyone with access to this inbox can read its messages. Do not share screenshots or links that expose it.</span>
                </div>

                <AccountManager
                  account={account}
                  refreshInbox={() => fetchInbox(true)}
                  onEmailCopied={onEmailCopied}
                  isLoading={isLoading || isInboxLoading}
                  onNewEmailClick={() => setShowAddPanel(v => !v)}
                />

                {/* Primary Inbox View — Directly visible on mobile screen */}
                <Inbox
                  messages={messages.map(msg => ({ ...msg, token: account.token }))}
                  isLoading={isInboxLoading}
                  onRetry={() => fetchInbox(true)}
                  onTokenExpired={handleTokenExpired}
                />

                {/* Sponsored Ad Section (Placed below active inbox so it doesn't push mail offscreen) */}
                <section className="monetag-app-ad-section mt-3" aria-label="Sponsored content">
                  <div className="monetag-app-ad-slot">
                    <div className="monetag-ad-slot__label">Sponsored</div>
                    <div className="monetag-ads monetag-ads--compact" data-zone="11505330" data-ad-format="auto" aria-live="polite"></div>
                  </div>
                </section>

                {!showExpiredCard && tokenValid && (
                  <div className="mt-3">
                    <YesimRecommendation />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <section className="app-seo-content container py-4" aria-label="About the TempMail Pro app">
        <h2>How the TempMail Pro app works</h2>
        <p>
          TempMail Pro is a free temporary email app that gives you a working email address
          without asking you to sign in, create an account, or hand over personal details.
          You open the app, generate an address, use it for a signup or a verification, read
          the messages that arrive in that inbox, and then let the address expire when you no
          longer need it. Your real inbox stays clean because welcome messages, confirmations,
          offers, and test data go to the temporary inbox instead of the address you use for
          work, family, and accounts you plan to keep.
        </p>
        <p>
          The workflow is deliberately simple, and it follows four steps. First, you generate
          an address and choose how long it should last. Second, you copy that address and paste
          it into the signup form, trial form, newsletter form, or test form you are using.
          Third, you return to the app and watch the inbox for a confirmation link or a code.
          Fourth, you use that link or code to finish the signup, and you either keep using the
          inbox until it expires or create a fresh one for the next signup. There is no password
          to remember for the temporary address itself, and no separate mailbox to configure,
          which is why the app is useful for quick, low-risk signups that do not deserve your
          permanent address.
        </p>
        <h3>A short checklist before you generate an address</h3>
        <ul>
          <li>Decide what the address is for: one trial, one newsletter, one test case, or one shopping signup.</li>
          <li>Choose an expiry that is longer than the task, not shorter. If a trial lasts a week, a ten-minute inbox will not help.</li>
          <li>Save anything important outside the inbox, because an expired inbox and its messages are assumed to be unrecoverable.</li>
          <li>Use a permanent address for anything you must be able to recover later, such as banking, billing, or a main work account.</li>
        </ul>

        <h2>Using multiple inboxes without mixing them up</h2>
        <p>
          The most useful habit in this app is also the simplest: use a separate inbox for a
          separate purpose. When every signup shares one address, every welcome message, receipt,
          and promotional email lands in the same place, and it becomes hard to tell which message
          belongs to which trial or test. When each signup has its own inbox, the messages stay
          separated by purpose. A trial inbox holds only trial messages. A shopping inbox holds
          only order and coupon messages for that shop. A testing inbox holds only the messages
          for one test case. That separation makes it much easier to find a code, to see whether
          a confirmation arrived, and to delete a whole inbox when you are done with it, without
          losing anything else.
        </p>
        <p>
          Switching between inboxes in the app is part of the same workflow. You generate a new
          address when you start a new signup, and you switch back to an earlier inbox when you
          need to check whether its confirmation has arrived. Keeping a short, private note of
          which inbox belongs to which signup can help, especially when you are running several
          trials at once. Do not share screenshots or links that expose an inbox, because anyone
          who can open that inbox can read its messages. Treat each temporary address as
          disposable, but treat its contents as private while it is active.
        </p>
        <p>
          For a fuller look at organising separate signups, see the guide on{" "}
          <a href="/blog/free-temp-mail-multiple-inboxes-guide">keeping test signups separate with multiple inboxes</a>.
          The guide explains the same idea in more detail, while this page stays focused on how
          the app itself handles switching, creating, and deleting inboxes.
        </p>

        <h2>Choosing a custom name for your temporary address</h2>
        <p>
          A temporary address does not have to look random. TempMail Pro lets you choose a custom
          name for the part before the at sign, so the address can be easier to recognise when
          you see it in a form or in a message list. A clear name helps you remember which signup
          an inbox belongs to, and it can make a test inbox easier to discuss with a teammate,
          because you can refer to the inbox by a readable name rather than by a long string of
          characters. Keep the name simple, use letters, numbers, dots, or hyphens where the app
          allows them, and avoid putting personal details, passwords, or sensitive information
          in the name itself.
        </p>
        <p>
          A custom name does not change what a temporary address is for. It is still a disposable
          address, it still expires, and it still should not be used for an account you need to
          recover. The name is a convenience for organisation, not a way to turn a temporary
          address into a permanent one. If you need a permanent address for a service you plan to
          keep, use your real mailbox for that service, and keep the temporary address for the
          low-risk signups, trials, and tests it was designed for. More detail on naming is
          available in the guide to{" "}
          <a href="/blog/free-custom-name-temp-email">choosing a custom name for a temporary address</a>.
        </p>

        <h2>Choosing an expiry that matches the job</h2>
        <p>
          Expiry is the other choice that matters most in the app. TempMail Pro offers several
          preset durations and a custom option, so you can match the inbox lifetime to the task
          instead of forcing every signup into the same ten-minute window. A short expiry is right
          for a one-time code that you expect within minutes. A longer expiry is right for a trial
          that sends messages over days, for a newsletter you want to sample, or for a signup flow
          that you will return to later in the week. Choosing too short an expiry is a common
          mistake, because a confirmation that arrives after expiry may be lost, and the inbox
          cannot be assumed to be recoverable after that point.
        </p>
        <table>
          <caption>Temporary inbox expiry options in TempMail Pro</caption>
          <thead>
            <tr>
              <th>Expiry option</th>
              <th>Good for</th>
              <th>Watch out for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10 minutes</td>
              <td>A quick code or a one-time confirmation you expect right away</td>
              <td>Too short for trials, delayed messages, or multi-step signups</td>
            </tr>
            <tr>
              <td>1 hour</td>
              <td>A signup with a few steps, or a code that may take a while to arrive</td>
              <td>Not enough for a trial that lasts more than a day</td>
            </tr>
            <tr>
              <td>24 hours</td>
              <td>A day of testing, a short trial, or a signup you will finish tomorrow</td>
              <td>Messages after the first day will not be there</td>
            </tr>
            <tr>
              <td>7 days</td>
              <td>A week-long trial, a newsletter sample, or a signup you return to during the week</td>
              <td>Still temporary, so move anything you want to keep before it ends</td>
            </tr>
            <tr>
              <td>Custom</td>
              <td>A task with a known end date that does not match a preset</td>
              <td>Pick a date after the last message you expect, not on the same day</td>
            </tr>
          </tbody>
        </table>
        <p>
          As a rule, pick the shortest expiry that still covers the whole task, and then add a
          little margin. If a trial runs for seven days, a seven-day inbox is a better fit than a
          one-hour inbox, and a custom expiry that ends a day after the trial ends gives you time
          to read a final message or to move the account to a permanent address. That margin is
          the difference between a smooth signup and a lost confirmation.
        </p>

        <h2>Receiving verification codes and confirmation links</h2>
        <p>
          Most temporary email use comes down to one moment: waiting for a code or a link. After
          you paste your temporary address into a signup form, return to the app and open that
          inbox. New messages appear in the inbox view, and you can open a message to read its
          code or follow its confirmation link. Copy the code carefully, paste it into the form
          that asked for it, and use the link or code promptly, because many confirmation links
          and codes are meant to be used once or within a limited time. If a code does not work
          on the first try, check that you copied the full code, that you are using the message
          for the right signup, and that the inbox has not expired.
        </p>
        <p>
          If a message does not arrive, work through the problem in order rather than generating
          a new address straight away. First, refresh the inbox and give the sender a little time,
          because delivery can be delayed. Second, check that the address you pasted matches the
          address in the app, character for character. Third, check whether the service allows
          temporary addresses at all, because some services block disposable domains as a matter
          of policy. If the service blocks the address, generating another temporary address from
          the same service will usually be blocked in the same way, and the honest next step is
          to use a permanent address for that service. If the message still has not arrived and
          the service does accept temporary addresses, generate a fresh inbox and try the signup
          once more, keeping a note of which inbox belongs to which attempt so you do not mix
          the messages up.
        </p>

        <h2>Testing signup flows with a separate inbox per test</h2>
        <p>
          Developers, testers, and support teams use the app in a different way from a casual
          signup, but the principle is the same: one inbox per test case. When you test a signup
          flow, create a fresh inbox for that case, run the flow, and watch that inbox only. That
          way, a verification message, a password-reset message, or a welcome message can be
          traced to exactly one test, instead of being mixed with messages from other tests or
          from personal signups. If a test fails, you can look at the messages for that inbox
          alone, see whether the confirmation arrived, whether the link worked, and whether an
          expired link was handled correctly, without guessing which message belonged to which
          run.
        </p>
        <p>
          A useful set of checks for a signup flow includes verification arrival, link or code use,
          expired-link handling, password-reset delivery, and localisation, such as language, date
          format, and currency format in the message. Running each check in its own inbox makes
          the results repeatable and easier to report, because a teammate can see the same inbox
          pattern and reproduce the same steps. For a deeper walkthrough of this testing approach,
          see the guide on{" "}
          <a href="/blog/temp-mail-for-qa-and-account-testing-teams">testing signup and verification flows</a>.
          That guide covers test design in more detail, while this page focuses on how the app
          supports the workflow: generate, test, read, and discard, one inbox at a time.
        </p>

        <h2>Free trials, coupons, and everyday signups</h2>
        <p>
          Free trials are one of the most common reasons people open a temporary email app. A
          trial signup often asks for an email address before you can see whether the service is
          worth keeping, and giving your permanent address at that stage means trial reminders,
          upsell messages, and newsletters can follow you long after the trial ends. A temporary
          inbox lets you try the service first, read its welcome and trial messages in a separate
          place, and decide calmly whether to keep it. If you decide to keep the service, move it
          to a permanent address before the temporary inbox expires, because recovery, billing,
          and password-reset messages for a kept account should go to an address you control for
          the long term.
        </p>
        <p>
          The same idea applies to coupons, shopping signups, and newsletters. Use a temporary
          inbox to check a coupon or a shop, read its offers without polluting your real inbox,
          and keep the shop only if you actually want its messages. If you want to keep receiving
          a newsletter, subscribe with a permanent address instead, because a newsletter you
          value is no longer a low-risk signup. A practical guide to this approach is available
          in the article on{" "}
          <a href="/blog/how-to-use-temp-email-for-free-trials">using a temporary inbox for free trials</a>,
          which covers trial checklists and the move from a temporary address to a permanent one
          in more detail.
        </p>

        <h2>Limitations and responsible use</h2>
        <p>
          Temporary email is a tool for low-risk signups, not a replacement for a permanent
          mailbox, and understanding its limits is part of using it well. An expired inbox and
          its messages are assumed to be unrecoverable, so you should never use a temporary
          address for an account you must be able to recover, for banking or payment accounts,
          for billing, or for any account that holds sensitive personal or financial information.
          You should also not use a temporary address to impersonate another person, to evade a
          ban or a block, or to break a service terms of use. If a service blocks disposable
          domains, that is the service policy, and the responsible response is to use a different,
          permanent address for that service, not to look for a way around the block.
        </p>
        <p>
          Temporary email is also not full identity protection on its own. A website can still
          see other signals, such as your browser and connection details, even when you use a
          temporary address, and TempMail Pro does not sell or store your inbox data for
          advertising. Infrastructure providers that run the web, such as Vercel, Cloudflare, and
          Render, may see connection metadata, as explained in the{" "}
          <a href="/privacy">Privacy Policy</a>. For questions about whether temporary email is
          allowed for a particular use, see the guide on{" "}
          <a href="/blog/is-free-temp-mail-legal">whether free temporary email is legal</a>,
          which gives general information only and is not legal advice. For the full list of
          guides, visit the <a href="/blog">blog</a>, and for background on the service itself,
          see the <a href="/about">about page</a>.
        </p>

        <h2>For users in the United States</h2>
        <p>
          TempMail Pro is free and works worldwide, including for users in the United States,
          with the same features and the same limits: multiple inboxes, custom names, custom
          expiry, and no sign-in required. Users in the United States can use the app for the
          same low-risk tasks described on this page, such as trying a trial, sampling a
          newsletter, signing up for a shopping account, or testing a signup flow, using US
          English and US date and currency formats in their own notes and labels. The app does
          not claim a United States office, address, phone number, or company registration, and
          it does not promise that any specific United States service will accept a temporary
          address, because acceptance is set by each service. The same rule applies everywhere:
          if a service blocks disposable domains, use a permanent address for that service.
        </p>

        <h2>Frequently asked questions about the app</h2>
        <h3>How long does a temporary inbox last?</h3>
        <p>
          It lasts for the expiry you choose when you generate it: 10 minutes, 1 hour, 24 hours,
          7 days, or a custom duration. Choose an expiry that covers the whole task, with a
          little margin, because an expired inbox and its messages are assumed to be unrecoverable.
        </p>
        <h3>Do I need to sign in to use the app?</h3>
        <p>
          No. The app does not ask you to sign in, create an account, or provide personal details
          to generate a temporary address. That is one of the reasons it is useful for quick,
          low-risk signups.
        </p>
        <h3>Can I recover an inbox after it expires?</h3>
        <p>
          No, you should assume that you cannot. Save anything important outside the inbox before
          it expires, and move any account you want to keep to a permanent address in good time.
        </p>
        <h3>Can I use more than one inbox at a time?</h3>
        <p>
          Yes. The app is designed for multiple inboxes, so you can keep a separate inbox for each
          signup, trial, or test case, switch between them, and delete one without affecting the
          others.
        </p>
        <h3>Why did a site reject my temporary address?</h3>
        <p>
          Some services block disposable domains as a matter of policy. That is not a fault in
          the app, and generating another temporary address from the same service will usually
          be blocked in the same way. Use a permanent address for that service instead.
        </p>
        <h3>Is a temporary address safe for sensitive accounts?</h3>
        <p>
          No. Do not use a temporary address for banking, payments, billing, recovery, or any
          account that holds sensitive information. Those accounts belong on a permanent address
          you control for the long term.
        </p>
        <h3>What should I do if a verification code does not arrive?</h3>
        <p>
          Refresh the inbox, give the sender a little time, check that the pasted address matches
          the app address exactly, and check whether the service accepts temporary addresses. If
          it does, try once more with a fresh inbox and keep track of which inbox belongs to
          which attempt.
        </p>
        <h3>Can I use the app for testing a signup flow?</h3>
        <p>
          Yes, and one inbox per test case is the recommended approach. It keeps verification,
          password-reset, and welcome messages separated by test, so results are easier to read
          and repeat.
        </p>
      </section>
    </>
  );
}


export default TempMailApp;
