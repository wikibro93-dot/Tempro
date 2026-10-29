import React from 'react';
import AppIcon from './AppIcon';

const COMPARISON_DATA = [
  {
    feature: 'Multi-Inbox Management',
    description: 'Run multiple temporary addresses simultaneously in tabs',
    tempMailPro: 'Free & Unlimited',
    tempMailOrg: '$10 / mo (Premium only)',
    tenMinuteMail: 'Not Supported',
    guerrillaMail: 'Single address only',
  },
  {
    feature: 'Custom Username Choice',
    description: 'Pick your own prefix (e.g. shop2026, test)',
    tempMailPro: 'Free & Instant',
    tempMailOrg: 'Paid plan only',
    tenMinuteMail: 'Random only',
    guerrillaMail: 'Limited scrambling',
  },
  {
    feature: 'Domain Selector Dropdown',
    description: 'Choose between the live domains Mail.tm currently offers',
    tempMailPro: 'Yes (Live Engine)',
    tempMailOrg: 'Locked behind paywall',
    tenMinuteMail: 'Fixed single domain',
    guerrillaMail: 'Fixed preset list',
  },
  {
    feature: 'Flexible Lifetime & Expiry',
    description: 'Set duration from 10m to 7 days, or custom minutes',
    tempMailPro: '10m to 7 Days (Custom)',
    tempMailOrg: 'Fixed duration',
    tenMinuteMail: 'Strict 10 Minutes',
    guerrillaMail: 'Fixed 60 Minutes',
  },
  {
    feature: 'Instant OTP Detection',
    description: 'Auto-extract 4-8 digit verification codes from emails',
    tempMailPro: 'Built-in 1-Click Copy',
    tempMailOrg: 'Manual search in body',
    tenMinuteMail: 'No',
    guerrillaMail: 'No',
  },
  {
    feature: 'Privacy & Log Retention',
    description: 'No sign-in required and automatic message purge on expiry',
    tempMailPro: 'No Sign-In; Auto-Purge',
    tempMailOrg: 'Heavy telemetry & ads',
    tenMinuteMail: 'Basic',
    guerrillaMail: 'Public log ledger',
  },
  {
    feature: 'Cost & Accessibility',
    description: 'No credit card, no sign-in, all power features free',
    tempMailPro: '100% Free Forever',
    tempMailOrg: 'Freemium ($9.99/mo)',
    tenMinuteMail: 'Free (Ad heavy)',
    guerrillaMail: 'Free (Outdated UI)',
  },
];

const CompetitorComparison = () => {
  return (
    <section className="py-5 competitor-comparison-section" id="comparison">
      <div className="container">
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-2 text-primary fw-semibold small text-uppercase tracking-wider">
            <AppIcon iconClass="bi bi-trophy-fill" />
            <span>Why TempMail Pro Leads the Industry</span>
          </div>
          <h2 className="fw-bold section-title display-6">
            Compare TempMail Pro vs. Other Services
          </h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '620px' }}>
            Features that competitors charge up to $10/month for are 100% free and open on TempMail Pro.
          </p>

          {/* Mobile Swipe Helper Strip */}
          <div className="d-inline-flex d-md-none align-items-center gap-2 small px-3 py-1 rounded-pill border bg-light-subtle text-muted mt-2">
            <AppIcon iconClass="bi bi-arrows-expand text-primary" />
            <span>Swipe table left/right to compare columns</span>
          </div>
        </div>

        <div className="comparison-table-wrapper shadow-sm rounded-4 border overflow-hidden">
          <div className="table-responsive">
            <table className="table comparison-table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col" className="comp-col-feature p-4 text-start">
                    <span className="fw-bold fs-6">Key Capability</span>
                  </th>
                  <th scope="col" className="comp-col-ours p-4 text-center bg-primary text-white position-relative">
                    <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2 fw-bold" style={{ fontSize: '0.68rem' }}>
                      RECOMMENDED
                    </span>
                    <div className="fw-bold fs-5">TempMail Pro</div>
                    <small className="opacity-75">All-in-One Engine</small>
                  </th>
                  <th scope="col" className="comp-col-other p-4 text-center">
                    <div className="fw-semibold">Temp-Mail.org</div>
                    <small className="text-muted">Standard</small>
                  </th>
                  <th scope="col" className="comp-col-other p-4 text-center">
                    <div className="fw-semibold">10MinuteMail</div>
                    <small className="text-muted">Legacy</small>
                  </th>
                  <th scope="col" className="comp-col-other p-4 text-center">
                    <div className="fw-semibold">Guerrilla Mail</div>
                    <small className="text-muted">Classic</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-light-subtle' : ''}>
                    <td className="p-3 ps-4">
                      <div className="fw-semibold text-dark">{row.feature}</div>
                      <div className="small text-muted">{row.description}</div>
                    </td>
                    <td className="p-3 text-center comp-cell-ours fw-bold text-primary bg-primary-subtle border-start border-end border-primary-subtle">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <AppIcon iconClass="bi bi-check-circle-fill text-success" />
                        <span>{row.tempMailPro}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-secondary small">
                      {row.tempMailOrg.includes('only') || row.tempMailOrg.includes('/ mo') ? (
                        <span className="text-danger fw-semibold">{row.tempMailOrg}</span>
                      ) : (
                        row.tempMailOrg
                      )}
                    </td>
                    <td className="p-3 text-center text-secondary small">
                      {row.tenMinuteMail === 'Not Supported' || row.tenMinuteMail === 'No' ? (
                        <span className="text-muted">{row.tenMinuteMail}</span>
                      ) : (
                        row.tenMinuteMail
                      )}
                    </td>
                    <td className="p-3 text-center text-secondary small pe-4">
                      {row.guerrillaMail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Micro Trust Strip below comparison */}
        <div className="row g-3 mt-4 text-center">
          <div className="col-md-4">
            <div className="p-3 rounded-3 border bg-surface d-flex align-items-center justify-content-center gap-3">
              <AppIcon iconClass="bi bi-shield-lock-fill text-success fs-4" />
              <div className="text-start">
                <div className="fw-bold small">Zero Registration</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>No passwords, no personal data saved</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded-3 border bg-surface d-flex align-items-center justify-content-center gap-3">
              <AppIcon iconClass="bi bi-lightning-charge-fill text-warning fs-4" />
              <div className="text-start">
                <div className="fw-bold small">Fast Delivery</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>Direct live Mail.tm API pipeline</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded-3 border bg-surface d-flex align-items-center justify-content-center gap-3">
              <AppIcon iconClass="bi bi-clock-history text-primary fs-4" />
              <div className="text-start">
                <div className="fw-bold small">Auto-Purge Expiry</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>Emails cleanly wiped when timer ends</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitorComparison;
