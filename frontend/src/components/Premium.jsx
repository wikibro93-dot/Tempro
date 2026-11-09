import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";
import { IntroCard, FeatureGrid, SectionCard, StepsGrid, UpdatedAt } from "./InfoPageBlocks";
import AppIcon from "./AppIcon";

// TempMail Pro Premium — sales page.
// Two plans, both the same product (custom domain + more inboxes + longer
// expiry + no ads). Checkout is Creem; the links below are the real
// product checkout URLs. After paying, Creem emails the customer a
// license key, which they paste into /app to unlock the custom-domain
// section. No login, no account — the key is the credential.
const CREEM_MONTHLY_URL = "https://www.creem.io/payment/prod_5rlysHo03p4e5czTOZFe02";
const CREEM_YEARLY_URL = "https://www.creem.io/payment/prod_7LDR5lYmCrzoHqjIDtO2K";

const Premium = () => {
  const featureItems = [
    {
      iconClass: "bi bi-globe",
      iconColor: "text-primary",
      title: "Your own custom domain",
      description:
        "Connect a domain you own — for example londonstore.com — and receive mail at addresses on it, like wiki@londonstore.com. You add one MX record at your registrar; we show it to you in the app.",
    },
    {
      iconClass: "bi bi-inboxes",
      iconColor: "text-success",
      title: "More inboxes",
      description:
        "Run more temporary inboxes at once, so each signup, trial, or test case keeps its own inbox instead of sharing one.",
    },
    {
      iconClass: "bi bi-clock",
      iconColor: "text-info",
      title: "Longer expiry",
      description:
        "Keep an inbox for longer than the free presets allow, so a trial or signup that runs for weeks is not cut short.",
    },
    {
      iconClass: "bi bi-badge-ad",
      iconColor: "text-warning",
      title: "No ads",
      description:
        "The app without sponsored placements, so the inbox stays clean while you work.",
    },
  ];

  const steps = [
    {
      title: "Subscribe",
      description: "Pick monthly or yearly and pay securely through Creem. Cancel anytime from your Creem customer portal.",
    },
    {
      title: "Get your license key",
      description: "Creem emails your license key with the receipt, and it stays in your Creem customer portal. One key covers one domain.",
    },
    {
      title: "Paste it in the app",
      description: "Open /app, find the Custom domain section, and paste your key. No sign-in and no account is needed — the key is the credential.",
    },
    {
      title: "Connect your domain",
      description: "Enter your domain, add the one MX record we show you at your registrar, and verify it. Mail to your domain then arrives in the app.",
    },
  ];

  return (
    <div>
      <PageNavbar />
      <Helmet>
        <title>TempMail Pro Premium – Custom Domain, $5/Month</title>
        <meta
          name="description"
          content="TempMail Pro Premium costs $5 a month: connect your own custom domain, get more inboxes, longer expiry, and no ads. No sign-in — pay, paste your key, and go."
        />
        <link rel="canonical" href="https://tempmailpk.com/premium" />
        <meta property="og:title" content="TempMail Pro Premium – Custom Domain, $5/Month" />
        <meta property="og:description" content="Connect your own custom domain to TempMail Pro for $5 a month. No sign-in — pay, paste your license key, and go." />
        <meta property="og:url" content="https://tempmailpk.com/premium" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="text-center mb-5">TempMail Pro Premium</h1>

            <IntroCard
              iconClass="bi bi-patch-check"
              title="Your own domain, your own addresses"
              subtitle="Bring your own domain — we never sell you an address on ours"
              lead="Premium connects a domain you already own to TempMail Pro, so mail sent to addresses on your domain lands in your inbox here. The free app stays exactly as it is: no sign-in, no account, no change."
            />

            {/* Pricing */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <h5 className="fw-bold">Monthly</h5>
                    <p className="display-6 fw-bold mb-1">$5<span className="fs-6 text-muted fw-normal"> / month</span></p>
                    <p className="text-muted small mb-4">Billed monthly. Cancel anytime.</p>
                    <a href={CREEM_MONTHLY_URL} className="btn btn-primary btn-lg w-100">
                      Subscribe — $5/month
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100 border-primary shadow-sm">
                  <div className="card-body text-center p-4">
                    <span className="badge bg-primary mb-2">Save 20%</span>
                    <h5 className="fw-bold">Yearly</h5>
                    <p className="display-6 fw-bold mb-1">$48<span className="fs-6 text-muted fw-normal"> / year</span></p>
                    <p className="text-muted small mb-4">$4 a month when billed yearly. Cancel anytime.</p>
                    <a href={CREEM_YEARLY_URL} className="btn btn-primary btn-lg w-100">
                      Subscribe — $48/year
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-muted small mb-4">
              Payments are processed by Creem (our merchant of record). Prices include tax where Creem applies it.
            </p>

            <FeatureGrid items={featureItems} />

            <SectionCard title="How it works">
              <StepsGrid steps={steps} />
            </SectionCard>

            <SectionCard title="What you need">
              <ul className="text-secondary mb-0">
                <li>A domain you own (for example, londonstore.com), with access to its DNS settings at your registrar.</li>
                <li>One MX record to add — we show it to you in the app, and it is the same record for every customer.</li>
                <li>Your license key, from the Creem receipt email or your Creem customer portal. Keep it private: anyone with it can use your domain here.</li>
              </ul>
            </SectionCard>

            <SectionCard title="What Premium does not do">
              <ul className="text-secondary mb-0">
                <li>It does not give you an address on tempmailpk.com. Premium is for your own domain, not ours.</li>
                <li>It does not send mail. TempMail Pro receives mail only; sending from a disposable address is the spam path, so it stays off.</li>
                <li>It does not ask you to sign in or create an account. The license key is the only credential.</li>
                <li>It does not change the free app. Free inboxes, expiry choices, and the no-sign-in experience stay as they are.</li>
              </ul>
            </SectionCard>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center py-5">
                <AppIcon iconClass="bi bi-envelope text-primary mb-3" size={40} />
                <h4 className="mb-3">Ready to use your own domain?</h4>
                <p className="text-muted mb-4">Subscribe, get your license key, and connect your domain in the app.</p>
                <a href={CREEM_MONTHLY_URL} className="btn btn-primary btn-lg me-3">
                  Subscribe — $5/month
                </a>
                <Link to="/app" className="btn btn-outline-secondary btn-lg">
                  Back to the free app
                </Link>
              </div>
            </div>

            <UpdatedAt date="November 9, 2026" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Premium;
