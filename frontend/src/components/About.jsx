import React from "react";
import { Helmet } from "react-helmet-async";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";
import { IntroCard, FeatureGrid, SectionCard, StepsGrid, FinalCtaCard, UpdatedAt } from "./InfoPageBlocks";
import AppIcon from "./AppIcon";

const About = () => {
  const featureItems = [
    {
      iconClass: "bi bi-browser-chrome",
      iconColor: "text-primary",
      title: "Browser-Generated",
      description:
        "Temporary email addresses are created through the TempMail Pro service: the address is requested from the mail server, and messages exist on that mail server until the inbox expires. TempMail Pro does not sell or store inbox data for advertising; infrastructure providers may see connection metadata.",
    },
    {
      iconClass: "bi bi-database-x",
      iconColor: "text-danger",
      title: "No Database Storage",
      description:
        "We do not keep permanent storage of your inboxes. Temporary email addresses exist on the mail server only until they expire, and TempMail Pro does not sell or store inbox data for advertising; infrastructure providers may see connection metadata.",
    },
    {
      iconClass: "bi bi-eye-slash",
      iconColor: "text-warning",
      title: "No Sign-In Required",
      description:
        "No sign-in is required to create an inbox. TempMail Pro does not sell or store inbox data for advertising; see the Privacy Policy for what the service records.",
    },
    {
      iconClass: "bi bi-clock",
      iconColor: "text-info",
      title: "Automatic Cleanup",
      description:
        "All emails are automatically deleted after expiration. No manual intervention or data retention policies required.",
    },
  ];

  const steps = [
    {
      title: "Generate",
      description: "Click to create a temporary email address instantly in your browser",
    },
    {
      title: "Use Anywhere",
      description: "Use the temporary email for sign-ups, downloads, or any online service",
    },
    {
      title: "Auto-Delete",
      description: "Email expires automatically, protecting your privacy permanently",
    },
  ];

  return (
    <div className="about-container">
      <PageNavbar />
      <Helmet>
        <title>About TempMail Pro - Free Temporary Email Service</title>
        <meta
          name="description"
          content="Learn about TempMail Pro, the privacy-first temporary email service. Browser-generated emails, no sign-in required, and inboxes that expire automatically."
        />
        <meta name="keywords" content="temporary email, disposable email, privacy, anonymous email, spam protection, TempMail Pro" />
        <link rel="canonical" href="https://tempmailpk.com/about" />

        {/* Open Graph */}
        <meta property="og:title" content="About TempMail Pro - Free Temporary Email Service" />
        <meta property="og:description" content="Learn about TempMail Pro, the privacy-first temporary email service. Browser-generated emails, no sign-in required, and inboxes that expire automatically." />
        <meta property="og:url" content="https://tempmailpk.com/about" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="text-center mb-5">About TempMail Pro</h1>

            <IntroCard
              iconClass="bi bi-shield-check"
              title="Privacy-First Temporary Email Service"
              subtitle="Protecting your online privacy since 2024"
              lead="TempMail Pro is a free, privacy-focused temporary email service designed to protect your personal inbox from spam, unwanted marketing, and potential security threats."
            />

            <FeatureGrid items={featureItems} />

            <SectionCard title="Our Mission">
                <p>
                  In today's digital world, maintaining privacy online has become increasingly challenging.
                  Websites and services collect email addresses for various purposes, often leading to
                  unwanted spam, marketing emails, and potential security risks.
                </p>
                <p>
                  TempMail Pro was created to give users back control over their digital communication.
                  We believe that privacy should be the default, not an optional feature. Our service
                  provides a simple, effective way to protect your primary email address while still
                  allowing you to access online services that require email verification.
                </p>
                <p>
                  By generating temporary email addresses through the service and keeping no permanent storage of your inboxes,
                  we help keep your online activities more private.
                </p>
            </SectionCard>

            <SectionCard title="How It Works">
              <StepsGrid steps={steps} />
            </SectionCard>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-3">New: Yesim Virtual Number Service</h4>
                <p>
                  Through our affiliate partnership with Yesim, a separate external service, you can explore Yesim virtual numbers as an optional way to receive SMS verification. Yesim is not part of the TempMail Pro app, which handles email only.
                  This partner option helps you receive OTPs without exposing your personal phone number.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-light">
                <h4 className="mb-0">Common Use Cases</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <AppIcon iconClass="bi bi-check-circle text-success me-2" />
                        <strong>Online Shopping:</strong> Avoid spam from e-commerce sites
                      </li>
                      <li className="mb-3">
                        <AppIcon iconClass="bi bi-check-circle text-success me-2" />
                        <strong>Social Media:</strong> Test new platforms without exposing your real email
                      </li>
                      <li className="mb-3">
                        <AppIcon iconClass="bi bi-check-circle text-success me-2" />
                        <strong>Software Downloads:</strong> Protect against unwanted newsletters
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <AppIcon iconClass="bi bi-check-circle text-success me-2" />
                        <strong>Forum Registration:</strong> Keep discussions separate from personal email
                      </li>
                      <li className="mb-3">
                        <AppIcon iconClass="bi bi-check-circle text-success me-2" />
                        <strong>Newsletter Testing:</strong> Try services without commitment
                      </li>
                      <li className="mb-3">
                        <AppIcon iconClass="bi bi-check-circle text-success me-2" />
                        <strong>Account Verification:</strong> Secure temporary access to services
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <SectionCard title="For users in the United States">
                <p>
                  TempMail Pro is free and works worldwide, including for users in the United States.
                  US users can use the same features as everyone else: multiple inboxes, custom names,
                  and custom expiry, with no sign-in required.
                </p>
                <p>
                  This is a service description, not a location claim. TempMail Pro does not claim a
                  US office, address, phone number, or company registration here. The same limits
                  apply in the United States as elsewhere: temporary inboxes are not for permanent,
                  recovery, banking, or other sensitive accounts, and some services block disposable
                  domains. For US trial, shopping, job-board, and newsletter signups, and for testing
                  US signup flows, see the free-trials, multiple-inboxes, QA, and legal guides.
                </p>
            </SectionCard>

            <FinalCtaCard
              title="Ready to Protect Your Privacy?"
              description="Join thousands of users who trust TempMail Pro for their temporary email needs."
              primaryTo="/app"
              primaryLabel="Create Temporary Email"
              secondaryTo="/privacy"
              secondaryLabel="Privacy Policy"
            />

            <UpdatedAt date="April 2026" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
