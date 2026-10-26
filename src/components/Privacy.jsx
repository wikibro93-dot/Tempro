import React from "react";
import { Helmet } from "react-helmet-async";
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
        "Temporary email addresses are generated locally in your browser using secure randomness, reducing exposure of personal identifiers.",
    },
    {
      iconClass: "bi bi-database-x",
      iconColor: "text-danger",
      title: "No Long-Term Storage",
      description:
        "We do not keep permanent inbox archives. Messages are temporary and removed automatically after their expiry window.",
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
      title: "Automatic Cleanup",
      description:
        "Every temporary mailbox follows expiration rules so stale data is removed without manual requests or intervention.",
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
      description: "Messages and temporary inbox data are automatically removed after expiry.",
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
              lead="TempMail Pro is built to minimize data exposure by default. We collect the least possible information, avoid user tracking, and keep temporary email usage anonymous and short-lived."
            />

            <FeatureGrid items={featureItems} />

            <SectionCard title="Our Privacy Principles">
                <p>
                  We intentionally design TempMail Pro around privacy-respecting defaults. Our architecture avoids
                  persistent identity mapping and minimizes retained information.
                </p>
                <p>
                  Temporary addresses are session-oriented, content lifespan is limited, and we do not run invasive
                  user tracking workflows. This helps reduce risk from spam, leaks, and long-term profiling.
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
                <h4 className="mb-0">Data We Don't Collect</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Email addresses</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Email content</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> IP addresses</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Personal information</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Browser fingerprints</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Usage analytics</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Cookies or tracking</li>
                      <li className="mb-2"><AppIcon iconClass="bi bi-x-circle text-danger me-2" /> Third-party sharing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

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
                  <li><strong>No Data Collection:</strong> We never had your data to begin with</li>
                  <li><strong>Immediate Deletion:</strong> Emails expire and are gone forever</li>
                  <li><strong>No Tracking:</strong> We don't monitor or analyze your usage</li>
                  <li><strong>Anonymous Service:</strong> Use our service without any identification</li>
                </ul>
                <p>
                  We also partner with Yesim to offer a privacy-respecting virtual SMS number option for OTP verification,
                  so you can verify accounts without exposing your personal phone number.
                </p>
                <p>
                  Third-Party Partners &amp; Cookies: To support our free service, we may participate in affiliate marketing programs. When you click on a referral link on our site, a &ldquo;cookie&rdquo; may be placed in your browser by the partner service to track the referral for commission purposes. These third-party services have their own privacy policies, which we encourage you to review.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-3">New: Yesim Virtual Number Support</h4>
                <p className="mb-0">
                  We also support privacy-conscious virtual number options via Yesim for OTP flows,
                  helping you avoid exposing your personal phone number when a site requires SMS verification.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center">
                <h5>Questions About Privacy?</h5>
                <p className="text-muted mb-3">
                  Our privacy practices are designed to be transparent and protective by default.
                  Since we don't collect any data, there are no privacy concerns to address.
                </p>
                <p className="text-muted">
                  <strong>Privacy Guarantee:</strong> We never see, store, or share your information.
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

            <UpdatedAt date="April 2026" topClass="mt-2" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
