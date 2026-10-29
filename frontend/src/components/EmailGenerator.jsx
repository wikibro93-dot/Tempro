import React, { useState, useEffect } from 'react';
import AppIcon from './AppIcon';

const PRESETS = [
  { label: '10 min', ms: 10 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '24 hours', ms: 24 * 60 * 60 * 1000 },
  { label: '7 days', ms: 7 * 24 * 60 * 60 * 1000 },
];

const UNITS = [
  { label: 'Minutes', value: 'min', ms: 60 * 1000, min: 1, max: 59 },
  { label: 'Hours', value: 'hr', ms: 3600 * 1000, min: 1, max: 720 },
  { label: 'Days', value: 'day', ms: 86400 * 1000, min: 1, max: 365 },
];

const DEFAULT_DOMAINS = []; // No hardcoded domain — only live Mail.tm domains are ever shown.

const EmailGenerator = ({
  onGenerate,
  isLoading,
  compact = false,
  availableDomains = [],
  selectedDomain: controlledDomain = '',
  onDomainChange = null,
}) => {
  const [customName, setCustomName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(1); // 1 hour default
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(30);
  const [customUnit, setCustomUnit] = useState('min');
  const [internalDomains, setInternalDomains] = useState([]);

  // Self-fetch domains if parent does not pass any
  useEffect(() => {
    let isMounted = true;
    if (!availableDomains || availableDomains.length === 0) {
      fetch('/api/accounts/domains')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data?.domains && Array.isArray(data.domains) && data.domains.length > 0) {
            setInternalDomains(data.domains);
          }
        })
        .catch((err) => {
          console.warn('[EmailGenerator] Domains fetch fallback:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [availableDomains]);

  // Unified domains list
  const domainsList =
    availableDomains && availableDomains.length > 0
      ? availableDomains
      : internalDomains.length > 0
      ? internalDomains
      : DEFAULT_DOMAINS;

  const [activeDomain, setActiveDomain] = useState(
    controlledDomain || domainsList[0] || ''
  );

  useEffect(() => {
    if (controlledDomain) {
      setActiveDomain(controlledDomain);
    } else if (domainsList.length > 0 && !domainsList.includes(activeDomain)) {
      setActiveDomain(domainsList[0]);
    }
  }, [controlledDomain, domainsList]);

  const handleDomainSelect = (d) => {
    setActiveDomain(d);
    if (onDomainChange) onDomainChange(d);
  };

  const getDurationMs = () => {
    if (isCustom) {
      const unit = UNITS.find((u) => u.value === customUnit);
      return (customValue || 1) * unit.ms;
    }
    return PRESETS[selectedPreset].ms;
  };

  const getLabel = () => {
    if (isCustom) {
      const unit = UNITS.find((u) => u.value === customUnit);
      const val = customValue || 1;
      return `${val} ${unit.label}`;
    }
    return PRESETS[selectedPreset].label;
  };

  const sanitizeName = (v) =>
    v.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24);

  const handleGenerate = () => {
    onGenerate({
      customName: customName.trim() || null,
      domain: activeDomain,
      durationMs: getDurationMs(),
    });
  };

  const unitConfig = UNITS.find((u) => u.value === customUnit);

  if (compact) {
    return (
      <div className="eg-compact">
        {/* Name and Domain Row */}
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="eg-label m-0" htmlFor="eg-compact-username">
              Username &amp; Domain
            </label>
            <span className="eg-domain-live-tag">
              <span className="eg-pulse-dot"></span> @{activeDomain}
            </span>
          </div>

          <div className="eg-split-input-row eg-split-compact">
            <div className="eg-username-col">
              <input
                id="eg-compact-username"
                type="text"
                className="eg-name-input"
                placeholder="username (optional)"
                value={customName}
                onChange={(e) => setCustomName(sanitizeName(e.target.value))}
                maxLength={24}
              />
            </div>
            <div className="eg-domain-col">
              <div className="eg-domain-select-box">
                <span className="eg-at-symbol">@</span>
                <select
                  id="eg-compact-domain"
                  className="eg-domain-select-field"
                  value={activeDomain}
                  onChange={(e) => handleDomainSelect(e.target.value)}
                  aria-label="Select domain"
                >
                  {domainsList.length === 0 ? (
                    <option value="" disabled>
                      Loading live domains…
                    </option>
                  ) : (
                    domainsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))
                  )}
                </select>
                <span className="eg-domain-chevron">
                  <AppIcon iconClass="bi bi-chevron-down" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Address Preview */}
        <div className="d-flex justify-content-between align-items-center mb-2 px-1">
          <span className="small text-muted">Preview:</span>
          <span className="font-monospace text-primary fw-semibold small text-truncate" style={{ maxWidth: '220px' }}>
            {customName || 'auto_random'}@{activeDomain}
          </span>
        </div>

        {/* Duration chips */}
        <div className="eg-chips mb-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`eg-chip${!isCustom && selectedPreset === i ? ' active' : ''}`}
              onClick={() => { setSelectedPreset(i); setIsCustom(false); }}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className={`eg-chip${isCustom ? ' active' : ''}`}
            onClick={() => setIsCustom(true)}
          >
            Custom
          </button>
        </div>

        {/* Custom duration row */}
        {isCustom && (
          <div className="eg-custom-row mb-2">
            <input
              type="number"
              className="eg-custom-num"
              value={customValue}
              min={unitConfig.min}
              max={unitConfig.max}
              onChange={(e) => setCustomValue(Math.max(unitConfig.min, Math.min(unitConfig.max, parseInt(e.target.value) || unitConfig.min)))}
            />
            <select
              className="eg-custom-unit"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        )}

        <button
          className="btn btn-primary w-100 eg-generate-btn"
          onClick={handleGenerate}
          disabled={isLoading || domainsList.length === 0}
        >
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating…</>
          ) : (
            <><AppIcon iconClass="bi bi-lightning-charge-fill me-1" />Generate Email</>
          )}
        </button>
      </div>
    );
  }

  // Full hero layout
  return (
    <div className="eg-hero">
      <div className="eg-hero-card">
        <div className="eg-hero-icon">
          <AppIcon iconClass="bi bi-envelope-plus-fill" size={32} />
        </div>
        <h2 className="eg-hero-title">Create Your Temp Email</h2>
        <p className="eg-hero-sub">
          Instant disposable inbox with live backend integration and domain selection.
        </p>

        {/* Custom username and Domain selector field */}
        <div className="eg-field-group">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="eg-label m-0" htmlFor="eg-username-input">
              <AppIcon iconClass="bi bi-globe2 me-1" />Choose Domain &amp; Username <span className="eg-optional">(optional)</span>
            </label>
            <span className="eg-domain-live-tag">
              <span className="eg-pulse-dot"></span> Live Engine
            </span>
          </div>

          <div className="eg-split-input-row">
            {/* Username Input */}
            <div className="eg-username-col">
              <div className="eg-input-box">
                <span className="eg-input-prefix">
                  <AppIcon iconClass="bi bi-person" />
                </span>
                <input
                  id="eg-username-input"
                  type="text"
                  className="eg-input-text"
                  placeholder="e.g. waqas, shop2026…"
                  value={customName}
                  onChange={(e) => setCustomName(sanitizeName(e.target.value))}
                  maxLength={24}
                />
              </div>
            </div>

            {/* Domain Selector Dropdown */}
            <div className="eg-domain-col">
              <div className="eg-domain-select-box" title="Select domain">
                <span className="eg-at-symbol">@</span>
                <select
                  id="eg-domain-select"
                  className="eg-domain-select-field"
                  value={activeDomain}
                  onChange={(e) => handleDomainSelect(e.target.value)}
                  aria-label="Select preferred email domain"
                >
                  {domainsList.length === 0 ? (
                    <option value="" disabled>
                      Loading live domains…
                    </option>
                  ) : (
                    domainsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))
                  )}
                </select>
                <span className="eg-domain-chevron">
                  <AppIcon iconClass="bi bi-chevron-down" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Domain Switcher Pills (if multiple domains) */}
          {domainsList.length > 1 && (
            <div className="eg-domain-pills-row mt-2 d-flex align-items-center gap-1 flex-wrap">
              <span className="eg-pills-label">Available domains:</span>
              {domainsList.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`eg-domain-quick-pill${activeDomain === d ? ' active' : ''}`}
                  onClick={() => handleDomainSelect(d)}
                >
                  @{d}
                </button>
              ))}
            </div>
          )}

          {/* Real-time Address Preview */}
          <div className="eg-preview-box mt-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <span className="eg-preview-label">
                <AppIcon iconClass="bi bi-eye me-1 text-primary" />
                Address Preview:
              </span>
              <span className="eg-preview-value font-monospace">
                <strong>{customName || 'auto_random'}</strong>@{activeDomain}
              </span>
            </div>
          </div>
        </div>

        {/* Duration selector */}
        <div className="eg-field-group">
          <label className="eg-label">
            <AppIcon iconClass="bi bi-clock me-1" />Email Duration
          </label>
          <div className="eg-chips">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`eg-chip${!isCustom && selectedPreset === i ? ' active' : ''}`}
                onClick={() => { setSelectedPreset(i); setIsCustom(false); }}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              className={`eg-chip eg-chip-custom${isCustom ? ' active' : ''}`}
              onClick={() => setIsCustom(true)}
            >
              <AppIcon iconClass="bi bi-sliders me-1" />Custom
            </button>
          </div>

          {isCustom && (
            <div className="eg-custom-row mt-2">
              <input
                type="number"
                className="eg-custom-num"
                value={customValue}
                min={unitConfig.min}
                max={unitConfig.max}
                onChange={(e) =>
                  setCustomValue(
                    Math.max(unitConfig.min, Math.min(unitConfig.max, parseInt(e.target.value) || unitConfig.min))
                  )
                }
              />
              <select
                className="eg-custom-unit"
                value={customUnit}
                onChange={(e) => { setCustomUnit(e.target.value); setCustomValue(1); }}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <span className="eg-custom-summary">= {getLabel()}</span>
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          className="eg-generate-btn-hero btn btn-primary"
          onClick={handleGenerate}
          disabled={isLoading || domainsList.length === 0}
        >
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating your mailbox…</>
          ) : (
            <><AppIcon iconClass="bi bi-lightning-charge-fill me-2" />Generate Email Address</>
          )}
        </button>

        <p className="eg-note">
          <AppIcon iconClass="bi bi-shield-check me-1 text-success" />
          Free &amp; private mailbox with real-time OTP and message delivery
        </p>
      </div>
    </div>
  );
};

export default EmailGenerator;
