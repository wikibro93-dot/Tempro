import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";
import { IntroCard, FeatureGrid, SectionCard, StepsGrid, FinalCtaCard, UpdatedAt } from "./InfoPageBlocks";
import AppIcon from "./AppIcon";

const Privacy = () => {
  const featureItems = [
    {
      iconClass: "bi bi-browser-chrome",
      iconColor: "text-primary",
      title: "Browser-Generated Emails",
      description:
        "You choose the address in your browser with no sign-in and no personal details; the account itself is created through our backend on Mail.tm's servers.",
    },
    {
      iconClass: "bi bi-database-x",
      iconColor: "text-danger",
      title: "No Server Database",
      description:
        "The free service keeps no database of inboxes. Messages live on Mail.tm under Mail.tm's retention; an expired inbox leaves your view, and deleting an inbox requests deletion of its Mail.tm account. Premium custom-domain mail is the one exception — it is stored for delivery, see below.",
    },
    {
      iconClass: "bi bi-eye-slash",
      iconColor: "text-warning",
      title: "Minimal Data Visibility",
      description:
        "We are not profiling users or building behavioral histories. The platform is designed for practical anonymity and low data retention.",
    },
    {
      iconClass: "bi bi-clock",
      iconColor: "text-info",
      title: "Automatic Expiry",
      description:
        "Every temporary mailbox follows expiration rules, so it leaves your view when it expires without manual requests — and deleting it requests removal from the mail server.",
    },
  ];

  const steps = [
    {
      title: "Generate",
      description: "Create a temporary address instantly in your browser with one click.",
    },
    {
      title: "Receive",
      description: "Use it for signups and verifications while keeping your personal inbox hidden.",
    },
    {
      title: "Expire",
      description: "The inbox leaves your view after expiry, and deleting it requests removal from the mail server.",
    },
  ];

  return (
    <div>
      <PageNavbar />
      <Helmet>
        <title>Privacy Policy | TempMail Pro</title>
        <meta
          name="description"
          content="TempMail Pro privacy policy. We do not store your temporary emails permanently and your privacy is our priority."
        />
        <meta
          name="keywords"
          content="privacy policy, temp mail privacy, disposable email privacy, no tracking email"
        />
        <link rel="canonical" href="https://tempmailpk.com/privacy" />

        {/* Open Graph */}
        <meta property="og:title" content="Privacy Policy | TempMail Pro" />
        <meta property="og:description" content="TempMail Pro privacy policy. We protect your privacy with temporary email services." />
        <meta property="og:url" content="https://tempmailpk.com/privacy" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="text-center mb-5">Privacy Policy</h1>

            <IntroCard
              iconClass="bi bi-shield-check"
              title="Privacy-First by Design"
              subtitle="Your privacy is our foundation, not an afterthought."
              lead="TempMail Pro is built to minimize data exposure by default. We collect the least possible information, avoid user profiling, and keep temporary email usage anonymous and short-lived."
            />

            <FeatureGrid items={featureItems} />

            <SectionCard title="Our Privacy Principles">
                <p>
                  We intentionally design TempMail Pro around privacy-respecting defaults. Our architecture avoids
                  persistent identity mapping and minimizes retained information.
                </p>
                <p>
                  Temporary addresses are session-oriented, content lifespan is limited, and we do not run user-profiling or cross-site tracking workflows. This helps reduce risk from spam, leaks, and long-term profiling.
                </p>
                <p>
                  Privacy is not treated as a premium feature; it is the baseline operating model of the service.
                </p>
            </SectionCard>

            <SectionCard title="How It Works">
              <StepsGrid steps={steps} />
            </SectionCard>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-light">
                <h4 className="mb-0">What We Do Not Collect or Sell</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Permanent inbox archives</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Personal information</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Payment information</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Data sold to advertisers</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> User profiles or browsing histories</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Sign-in accounts</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Long-term IP logs</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Cross-site tracking by TempMail Pro</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted small mb-4">
              Note: this list is about TempMail Pro itself. Messages live on Mail.tm under Mail.tm&apos;s retention and deletion policies, and Mail.tm may see connection metadata. Partner referral clicks are counted as described below.
            </p>

            <SectionCard title="Premium (Custom Domains) — What Changes">
              <p>
                Premium is the paid option that connects a domain you own. It is the only part of TempMail Pro that stores data on our servers. Everything else in this policy applies to Premium in the same way — no profiling, no sale of data, no advertising use.
              </p>
              <p>
                <strong>What we store for Premium:</strong> your license key (to verify your subscription), your domain (to route mail to it), and the messages received on that domain. Messages are stored so you can read them and are shown for 7 days. We also keep a count of how many inboxes and emails you have used this month, to enforce the fair-use limits (10 inboxes and 50 emails per month per key).
              </p>
              <p>
                <strong>Payments:</strong> Premium is billed through Creem, our merchant of record. Creem takes the payment, issues the receipt, and handles tax. We never see or store your card details. Creem holds your email address for the receipt and the customer portal, under its own privacy policy.
              </p>
              <p>
                <strong>Mail delivery:</strong> custom-domain mail is received through Postmark, which processes the messages and delivers them to our backend. Postmark sees the message content in order to deliver it, under its own privacy policy.
              </p>
            </SectionCard>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-light">
                <h4 className="mb-0">Your Rights</h4>
              </div>
              <div className="card-body">
                <p>
                  Since we minimize stored data, privacy controls are built directly into the system behavior rather
                  than relying only on account-level settings.
                </p>
                <ul>
                  <li><strong>No Sign-In Required:</strong> The service does not ask you to sign in, and it does not sell inbox data for advertising.</li>
                  <li><strong>Expiry and Deletion:</strong> An expired inbox disappears from your view; deleting an inbox requests deletion of its Mail.tm account. Expired inboxes are assumed unrecoverable.</li>
                  <li><strong>Limited Referral Counting:</strong> Clicks on partner links are counted in your browser (up to 200 recent events) to measure placements; we do not build profiles or browsing histories from them.</li>
                  <li><strong>Anonymous Service:</strong> Use our service without any identification</li>
                </ul>
                <p>
                  Third-Party Partners &amp; Cookies: To support our free service, we may participate in affiliate marketing programs. When you click on a referral link on our site, a &ldquo;cookie&rdquo; may be placed in your browser by the partner service to track the referral for commission purposes. These third-party services have their own privacy policies, which we encourage you to review.
                </p>
                <p>
                  <strong>Mail Infrastructure Provider:</strong> Temporary email delivery is provided by Mail.tm (mail.tm). Your messages pass through Mail.tm&apos;s mail servers and exist there until they expire, and Mail.tm may see connection metadata. TempMail Pro itself does not sell or store inbox data for advertising.
                </p>
              </div>
            </div>

            <SectionCard title="Your Data Protection Rights (GDPR)">
              <p>
                We process personal data lawfully in accordance with the General Data Protection Regulation (GDPR) (Regulation (EU) 2016/679). TempMail Pro is the data controller for the data described in this policy. If you are in the European Economic Area (EEA), you have the following rights:
              </p>
              <ul>
                <li><strong>Right to access</strong> — request a copy of the personal data we hold about you.</li>
                <li><strong>Right to rectification</strong> — ask us to correct data you believe is inaccurate or incomplete.</li>
                <li><strong>Right to erasure</strong> — ask us to delete your personal data, under certain conditions.</li>
                <li><strong>Right to restrict processing</strong> — ask us to limit how we use your data, under certain conditions.</li>
                <li><strong>Right to object</strong> — object to our processing of your data, under certain conditions.</li>
                <li><strong>Right to data portability</strong> — ask us to transfer the data you provided to you or another organisation, under certain conditions.</li>
                <li><strong>Right to lodge a complaint</strong> — with your local data protection authority, if you believe your rights have been violated.</li>
              </ul>
              <p>
                <strong>How these rights apply here:</strong> the free service holds almost no data about you — temporary addresses and messages expire and disappear, and deleting an inbox requests deletion of its Mail.tm account. Because there is no account and no database for the free service, access and deletion requests are generally not applicable after expiry, since there is nothing left to access or delete. For Premium, you can ask us to access, correct, or delete your Premium data (license key, domain, messages, usage counts).
              </p>
              <p>
                <strong>Legal basis:</strong> we process data to perform the contract (a Premium subscription) and on legitimate interest (keeping the free service running, preventing abuse, and rate-limiting). <strong>Transfers:</strong> your data may be processed outside the EEA by our providers (Mail.tm, Postmark, Creem, Render, Vercel) in order to deliver the service.
              </p>
              <p>
                To exercise any of these rights, contact us through the{" "}
                <Link to="/contact">Contact Us</Link> form. We will respond within one month.
              </p>
            </SectionCard>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-3">New: Yesim Virtual Number Support</h4>
                <p className="mb-0">
                  We also link to privacy-conscious virtual number options from Yesim, an affiliate partner and separate service, for OTP flows,
                  helping you avoid exposing your personal phone number when a site requires SMS verification. TempMail Pro itself handles email only; any SMS verification happens in Yesim's own service.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center">
                <h5>Questions About Privacy?</h5>
                <p className="text-muted mb-3">
                  Our privacy practices are designed to be transparent and protective by default: minimal data, short-lived inboxes, and no inbox database. Messages live on Mail.tm under Mail.tm&apos;s retention, and deleting an inbox requests their removal.
                </p>
              </div>
            </div>

            <FinalCtaCard
              iconClass="bi bi-envelope-check"
              title="Ready to Protect Your Privacy?"
              description="Start using TempMail Pro for free — no sign-up, no tracking, instant disposable email."
              primaryTo="/app"
              primaryLabel="Get Free Temp Email"
              secondaryTo="/about"
              secondaryLabel="About TempMail Pro"
            />

            <UpdatedAt date="November 2026" topClass="mt-2" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
