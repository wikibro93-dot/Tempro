import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import getApiRoot from "../utils/apiRoot";
import AppIcon from "./AppIcon";
import Inbox from "./Inbox";

// Custom-domain (Premium BYOD) section inside /app.
// Paid access is a license key, not a login: the customer pays on Creem,
// gets a key by email, and pastes it here. The key is verified SERVER-side
// (POST /api/premium/verify-key) — a browser flag alone never unlocks it.
// The key is stored in localStorage so the user does not re-enter it, and
// the domain is stored the same way. One key = one domain.
//
// The section is fully self-serve:
//   key -> domain -> MX records shown -> user adds MX at their registrar
//   -> Verify (DNS MX check) -> verified -> read mail on that domain.
// Free Mail.tm inboxes are untouched by this component.
const PREMIUM_KEY_STORAGE = "tempmail_premium_key";
const PREMIUM_DOMAIN_STORAGE = "tempmail_premium_domain";

const POLL_MS = 15000;

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const CustomDomainSection = () => {
  const [keyInput, setKeyInput] = useState("");
  const [keyState, setKeyState] = useState("unknown"); // unknown | checking | active | invalid | error
  const [keyMessage, setKeyMessage] = useState("");
  const [storedKey, setStoredKey] = useState(() => {
    try { return localStorage.getItem(PREMIUM_KEY_STORAGE) || ""; } catch { return ""; }
  });

  const [domainInput, setDomainInput] = useState("");
  const [domain, setDomain] = useState(() => {
    try { return localStorage.getItem(PREMIUM_DOMAIN_STORAGE) || ""; } catch { return ""; }
  });
  const [domainStatus, setDomainStatus] = useState(null); // 'pending' | 'pending_dns' | 'verified' | 'failed'
  const [mxRecords, setMxRecords] = useState([]);
  const [postmarkConfigured, setPostmarkConfigured] = useState(true);
  const [domainMessage, setDomainMessage] = useState("");
  const [registering, setRegistering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [keyExpiresAt, setKeyExpiresAt] = useState(null);
  const [usage, setUsage] = useState(null); // {inboxesUsed, inboxesLimit, emailsUsed, emailsLimit, usageMonth, addresses}

  const [dnsResult, setDnsResult] = useState(null);
  const [checkingDns, setCheckingDns] = useState(false);

  const [addressInput, setAddressInput] = useState("");
  const [customMessages, setCustomMessages] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState("");

  const [copiedField, setCopiedField] = useState("");
  const pollTimer = useRef(null);

  const apiRoot = getApiRoot();

  const verifyKey = useCallback(async (keyToCheck) => {
    const key = (keyToCheck || "").trim();
    if (!key) {
      setKeyState("invalid");
      setKeyMessage("Enter your license key.");
      return false;
    }
    setKeyState("checking");
    setKeyMessage("");
    try {
      const res = await fetch(`${apiRoot}/premium/verify-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.active) {
        setStoredKey(key);
        try { localStorage.setItem(PREMIUM_KEY_STORAGE, key); } catch { /* storage unavailable */ }
        setKeyState("active");
        setKeyMessage("");
        setKeyExpiresAt(data.expiresAt || null);
        return true;
      }
      setKeyState("invalid");
      setKeyMessage(data.error || "That key is not active. Check it and try again, or buy Premium to get a key.");
      setKeyExpiresAt(null);
      return false;
    } catch {
      setKeyState("error");
      setKeyMessage("Could not reach the server. Check your connection and try again.");
      return false;
    }
  }, [apiRoot]);

  // Restore a previously registered domain's status + MX records.
  // register-domain is idempotent for a domain owned by this key, so this
  // is a safe read of the stored state, not a new registration. Without
  // it, a fresh page load showed the domain as "Pending DNS" with no MX
  // table and no Verify button (mxRecords is only set by register), and
  // the user had to re-register to get them back. Failures stay silent —
  // the register form still works.
  const restoreDomain = useCallback(async (domainToRestore, keyToUse) => {
    const d = (domainToRestore || "").trim().toLowerCase();
    const k = (keyToUse || "").trim();
    if (!d || !k) return;
    try {
      const res = await fetch(`${apiRoot}/premium/register-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k, domain: d }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDomain(data.domain);
        setDomainStatus(data.status);
        setMxRecords(Array.isArray(data.mxRecords) ? data.mxRecords : []);
        setPostmarkConfigured(data.postmarkConfigured !== false);
        if (data.status === "verified") {
          setDomainMessage("This domain is already verified and live.");
        }
        if (!addressInput) setAddressInput(`hello@${data.domain}`);
      }
    } catch {
      // Network failure on mount — stay silent; the form still works.
    }
  }, [apiRoot, addressInput]);

  // On mount, re-verify a stored key (server-side — a stored key is not
  // trusted until the server says it is active), then restore the stored
  // domain's status + MX records so the Verify button is there.
  useEffect(() => {
    (async () => {
      if (!storedKey) return;
      const ok = await verifyKey(storedKey);
      if (ok && domain) {
        await restoreDomain(domain, storedKey);
      }
    })();
    // Only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    verifyKey(keyInput);
  };

  const handleRemoveKey = () => {
    setStoredKey("");
    setKeyInput("");
    setKeyState("unknown");
    setKeyMessage("");
    setKeyExpiresAt(null);
    setUsage(null);
    setConfirmingRemove(false);
    setDomain("");
    setDomainStatus(null);
    setMxRecords([]);
    setDnsResult(null);
    setCustomMessages([]);
    try {
      localStorage.removeItem(PREMIUM_KEY_STORAGE);
      localStorage.removeItem(PREMIUM_DOMAIN_STORAGE);
    } catch { /* storage unavailable */ }
  };

  const registerDomain = async (e) => {
    e.preventDefault();
    const d = domainInput.trim().toLowerCase();
    if (!d) {
      setDomainMessage("Enter your domain, for example londonstore.com.");
      return;
    }
    setRegistering(true);
    setDomainMessage("");
    setDnsResult(null);
    try {
      const res = await fetch(`${apiRoot}/premium/register-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: storedKey, domain: d }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDomain(data.domain);
        setDomainStatus(data.status);
        setMxRecords(Array.isArray(data.mxRecords) ? data.mxRecords : []);
        setPostmarkConfigured(data.postmarkConfigured !== false);
        try { localStorage.setItem(PREMIUM_DOMAIN_STORAGE, data.domain); } catch { /* storage unavailable */ }
        if (data.status === "verified") {
          setDomainMessage("This domain is already verified and live.");
        } else if (data.postmarkConfigured === false) {
          setDomainMessage("Domain saved. Our setup is still being completed — add the MX record now and verify it once the setup is ready.");
        } else {
          setDomainMessage("Domain registered. Add the MX record below at your registrar, then press Verify.");
        }
        if (!addressInput) setAddressInput(`hello@${data.domain}`);
      } else {
        setDomainMessage(data.error || "Could not register that domain. Check it and try again.");
      }
    } catch {
      setDomainMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setRegistering(false);
    }
  };

  // Remove the registered domain and free the key's slot on the server,
  // so the customer can connect a different domain. Before this existed,
  // "Use a different domain" only cleared the browser's local copy while
  // the server still counted the old domain — so switching was impossible
  // (the next register was rejected with "already has its domain") and
  // there was no way to remove a domain at all. The local state is only
  // cleared after the server confirms the removal, so a failed call
  // leaves the domain on screen for a retry.
  const removeDomain = useCallback(async () => {
    const d = (domain || "").trim().toLowerCase();
    if (!d || !storedKey) return;
    setRemoving(true);
    setDomainMessage("");
    try {
      const res = await fetch(`${apiRoot}/premium/remove-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: storedKey, domain: d }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDomain("");
        setDomainStatus(null);
        setMxRecords([]);
        setDnsResult(null);
        setCustomMessages([]);
        setUsage(null);
        setConfirmingRemove(false);
        try { localStorage.removeItem(PREMIUM_DOMAIN_STORAGE); } catch { /* storage unavailable */ }
        setDomainMessage(`Removed ${d}. Your key is free to connect a different domain.`);
      } else {
        setDomainMessage(data.error || "Could not remove that domain. Try again.");
      }
    } catch {
      setDomainMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setRemoving(false);
    }
  }, [apiRoot, domain, storedKey]);

  // Usage + inbox addresses for the registered domain, for the usage
  // display ("X of 10 inboxes, Y of 50 emails this month") and the
  // clickable address list. Failures stay silent — the usage line simply
  // does not render, and the address input still works.
  const fetchUsage = useCallback(async () => {
    const d = (domain || "").trim().toLowerCase();
    const k = (storedKey || "").trim();
    if (!d || !k) { setUsage(null); return; }
    try {
      const res = await fetch(`${apiRoot}/premium/usage/${encodeURIComponent(d)}?key=${encodeURIComponent(k)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setUsage({
          inboxesUsed: Number(data.inboxesUsed) || 0,
          inboxesLimit: Number(data.inboxesLimit) || 10,
          emailsUsed: Number(data.emailsUsed) || 0,
          emailsLimit: Number(data.emailsLimit) || 50,
          usageMonth: data.usageMonth || "",
          addresses: Array.isArray(data.addresses) ? data.addresses : [],
        });
      } else {
        setUsage(null);
      }
    } catch {
      setUsage(null);
    }
  }, [apiRoot, domain, storedKey]);

  // Load usage whenever a domain is registered and the key is active, and
  // refresh it as mail arrives (fetchCustomMessages calls fetchUsage).
  useEffect(() => {
    if (domain && storedKey && keyState === "active") {
      fetchUsage();
    } else {
      setUsage(null);
    }
  }, [domain, storedKey, keyState, fetchUsage]);

  const checkDns = async () => {
    if (!domain) return;
    setCheckingDns(true);
    setDnsResult(null);
    try {
      const res = await fetch(
        `${apiRoot}/premium/verify-dns/${encodeURIComponent(domain)}?key=${encodeURIComponent(storedKey)}`
      );
      const data = await res.json().catch(() => ({}));
      setDnsResult(data);
      if (data.verified && data.status === "verified") {
        setDomainStatus("verified");
        setDomainMessage("Verified — mail sent to addresses on this domain now arrives here.");
        if (!addressInput) setAddressInput(`hello@${domain}`);
      } else if (data.verified && data.postmarkError) {
        // MX is right but Postmark has no server for the domain yet, so
        // mail would not arrive. Do not claim verified — keep the domain
        // pending and let the user retry; the next Verify click retries
        // the Postmark server setup.
        setDomainMessage(`Your MX record is correct, but connecting the mail server failed: ${data.postmarkError} Press Verify again to retry.`);
      } else if (data.verified) {
        setDomainMessage(data.hint || "The MX record is correct. Press Verify again to finish connecting.");
      } else if (data.lookupError) {
        setDomainMessage("The DNS check failed to run. Try again in a moment.");
      } else {
        setDomainMessage(data.hint || "The MX record was not found yet. Add it at your registrar, wait a few minutes, and verify again.");
      }
    } catch {
      setDomainMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setCheckingDns(false);
    }
  };

  const copyText = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      // Clipboard unavailable (non-secure context) — the value is shown
      // in the read-only input so the user can copy it manually.
      setCopiedField(`${field}-manual`);
      setTimeout(() => setCopiedField(""), 3000);
    }
  };

  // Map a Postmark inbound message to the shape Inbox expects.
  const mapCustomMessage = useCallback((m) => {
    const attachments = Array.isArray(m.attachments) ? m.attachments : [];
    // The backend stores the body as textBody/htmlBody (Postmark's field
    // names) and the arrival time as receivedAt (ms since epoch) plus date
    // (the sender's RFC 2822 Date header). The Inbox reads text/html and
    // createdAt, so map them here — reading m.text/m.html directly left
    // every custom-domain message body blank ("No text content available")
    // and createdAt undefined rendered as "Invalid Date".
    const text = m.textBody || m.text || "";
    const html = m.htmlBody || m.html || "";
    const at = m.receivedAt ? new Date(m.receivedAt).toISOString() : (m.date || "");
    return {
      id: m.id,
      token: "custom",
      from: { address: m.from || "", name: m.fromName || "" },
      subject: m.subject || "(no subject)",
      date: at,
      createdAt: at,
      intro: text.slice(0, 140) || stripHtml(html).slice(0, 140),
      text,
      html,
      hasAttachments: attachments.length > 0,
      attachments,
    };
  }, []);

  // Custom-domain messages already carry their full body (the webhook
  // stored it). No Mail.tm fetch is needed — just hand the body back.
  const fetchCustomContent = useCallback(async (msg) => ({
    text: msg.text || "",
    html: msg.html || "",
    attachments: msg.attachments || [],
  }), []);

  const fetchCustomMessages = useCallback(async (address) => {
    const addr = (address || "").trim().toLowerCase();
    if (!addr) return;
    setCustomLoading(true);
    setCustomError("");
    try {
      const res = await fetch(`${apiRoot}/inbound/messages/${encodeURIComponent(addr)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setCustomMessages((data.messages || []).map(mapCustomMessage));
      } else {
        setCustomError(data.error || "Could not load messages for that address.");
      }
    } catch {
      setCustomError("Could not reach the server. Check your connection and try again.");
    } finally {
      setCustomLoading(false);
      // Refresh the usage counts + address list so a newly arrived
      // message updates the display without a page reload.
      fetchUsage();
    }
  }, [apiRoot, mapCustomMessage, fetchUsage]);

  // Poll the active custom address while the domain is verified.
  useEffect(() => {
    if (domainStatus !== "verified" || !addressInput.trim()) {
      if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
      return;
    }
    fetchCustomMessages(addressInput);
    pollTimer.current = setInterval(() => fetchCustomMessages(addressInput), POLL_MS);
    return () => {
      if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
    };
  }, [domainStatus, addressInput, fetchCustomMessages]);

  const isLocked = keyState !== "active";

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-light d-flex align-items-center justify-content-between">
        <h5 className="mb-0">
          <AppIcon iconClass="bi bi-globe" size={18} /> Custom domain{" "}
          <span className="badge bg-warning text-dark ms-1">Premium</span>
        </h5>
        {!isLocked && (
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleRemoveKey}>
            Remove key
          </button>
        )}
      </div>
      <div className="card-body">
        {isLocked ? (
          <>
            <p className="text-muted mb-3">
              Connect a domain you own and receive mail at addresses on it — for example{" "}
              <code>wiki@londonstore.com</code>. This is a Premium feature: paste your license key to unlock it.
            </p>
            <form onSubmit={handleUnlock} className="mb-3">
              <label htmlFor="premium-key" className="form-label small fw-bold">License key</label>
              <div className="input-group">
                <input
                  id="premium-key"
                  type="text"
                  className="form-control"
                  placeholder="ABCDE-FGHIJ-KLMNO-PQRST-UVWXY"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" className="btn btn-primary" disabled={keyState === "checking"}>
                  {keyState === "checking" ? "Checking…" : "Unlock"}
                </button>
              </div>
              <div className="form-text">Your key is in the Creem receipt email and your Creem customer portal.</div>
            </form>
            {keyMessage && (
              <div className={`alert ${keyState === "invalid" || keyState === "error" ? "alert-warning" : "alert-info"} py-2 mb-3`} role="alert">
                {keyMessage}
              </div>
            )}
            <p className="mb-0">
              Don&apos;t have a key?{" "}
              <Link to="/premium">Get TempMail Pro Premium — $5/month</Link>
            </p>
          </>
        ) : (
          <>
            <div className="alert alert-success py-2 mb-3" role="alert">
              <AppIcon iconClass="bi bi-patch-check" size={16} /> Premium unlocked. One key covers one domain.
              {keyExpiresAt && !Number.isNaN(new Date(keyExpiresAt).getTime()) && (
                <div className="small mt-1">
                  Subscription active until{" "}
                  {new Date(keyExpiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}.
                </div>
              )}
            </div>

            {/* Domain registration */}
            {!domain ? (
              <form onSubmit={registerDomain} className="mb-3">
                <label htmlFor="custom-domain" className="form-label small fw-bold">Your domain</label>
                <div className="input-group">
                  <input
                    id="custom-domain"
                    type="text"
                    className="form-control"
                    placeholder="londonstore.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button type="submit" className="btn btn-primary" disabled={registering}>
                    {registering ? "Registering…" : "Register domain"}
                  </button>
                </div>
                <div className="form-text">The domain you own — no www, just the domain itself.</div>
              </form>
            ) : (
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <strong>{domain}</strong>
                  {domainStatus === "verified" ? (
                    <span className="badge bg-success">Verified — live</span>
                  ) : domainStatus === "failed" ? (
                    <span className="badge bg-danger">Failed</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending DNS</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 mt-1"
                  onClick={() => setConfirmingRemove(true)}
                  disabled={removing}
                >
                  Use a different domain
                </button>
                {usage && (
                  <div className="text-muted small mt-2">
                    Usage this month: {usage.inboxesUsed} of {usage.inboxesLimit} inboxes · {usage.emailsUsed} of {usage.emailsLimit} emails
                  </div>
                )}
                {confirmingRemove && (
                  <div className="alert alert-warning py-2 mt-2 mb-0" role="alert">
                    <div className="small">
                      Remove <strong>{domain}</strong>? Mail to addresses on this domain will stop arriving.
                      You can add this domain (or a different one) again anytime.
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={removeDomain}
                        disabled={removing}
                      >
                        {removing ? "Removing…" : "Remove domain"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setConfirmingRemove(false)}
                        disabled={removing}
                      >
                        Keep domain
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {domainMessage && (
              <div className={`alert ${domainStatus === "verified" ? "alert-success" : "alert-info"} py-2 mb-3`} role="alert">
                {domainMessage}
              </div>
            )}

            {/* MX records */}
            {domain && mxRecords.length > 0 && domainStatus !== "verified" && (
              <div className="mb-3">
                <p className="small fw-bold mb-2">Add this MX record at your registrar (DNS):</p>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-2">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Host</th>
                        <th>Value</th>
                        <th>Priority</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mxRecords.map((rec, i) => (
                        <tr key={`${rec.type}-${i}`}>
                          <td>{rec.type}</td>
                          <td><code>{rec.host}</code></td>
                          <td><code>{rec.value}</code></td>
                          <td>{rec.priority}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyText(`mx-${i}`, rec.value)}
                            >
                              {copiedField === `mx-${i}` ? "Copied" : "Copy"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="btn btn-primary" onClick={checkDns} disabled={checkingDns}>
                  {checkingDns ? "Checking DNS…" : "Verify DNS"}
                </button>
                {dnsResult && !dnsResult.verified && (
                  <div className="alert alert-warning py-2 mt-3 mb-0" role="alert">
                    MX not found yet{dnsResult.lookupError ? ` (${dnsResult.lookupError})` : ""}.{" "}
                    {dnsResult.hint || "DNS changes can take a few minutes — wait, then press Verify again."}
                  </div>
                )}
              </div>
            )}

            {domain && !postmarkConfigured && domainStatus !== "verified" && (
              <div className="alert alert-warning py-2 mb-3" role="alert">
                Our mail setup for new domains is still being completed. You can add the MX record now — once the setup is ready, press Verify and your domain will go live.
              </div>
            )}

            {/* Verified: read mail on the domain */}
            {domainStatus === "verified" && (
              <div className="mt-3">
                <p className="small fw-bold mb-2">Read mail on this domain</p>
                {usage && usage.addresses.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {usage.addresses.map((addr) => (
                      <button
                        key={addr}
                        type="button"
                        className={`btn btn-sm ${addressInput.trim().toLowerCase() === addr ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setAddressInput(addr)}
                      >
                        {addr}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  className="input-group mb-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchCustomMessages(addressInput);
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`hello@${domain}`}
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Address on your domain"
                  />
                  <button type="submit" className="btn btn-primary" disabled={customLoading}>
                    {customLoading ? "Checking…" : "Check mail"}
                  </button>
                </form>
                <p className="text-muted small mb-3">
                  Any address on {domain} works — mail sent to it arrives here. Messages are checked every 15 seconds while this section is open.
                </p>
                {customError && (
                  <div className="alert alert-warning py-2 mb-3" role="alert">{customError}</div>
                )}
                <Inbox
                  messages={customMessages}
                  isLoading={customLoading}
                  onRetry={() => fetchCustomMessages(addressInput)}
                  onFetchContent={fetchCustomContent}
                  hideActions
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomDomainSection;
