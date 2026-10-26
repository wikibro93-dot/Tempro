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
        "All temporary email addresses are generated directly in your browser using secure, random algorithms. No server-side generation or storage.",
    },
    {
      iconClass: "bi bi-database-x",
      iconColor: "text-danger",
      title: "No Database Storage",
      description:
        "We don't maintain any databases or permanent storage systems. Temporary email addresses are generated in your browser and only exist briefly on our mail server.",
    },
    {
      iconClass: "bi bi-eye-slash",
      iconColor: "text-warning",
      title: "Complete Anonymity",
      description:
        "We have no knowledge of what emails you receive or send. Our service operates on a zero-knowledge principle.",
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
          content="Learn about TempMail Pro, the privacy-first temporary email service. Browser-generated emails, no databases, complete anonymity for online privacy protection."
        />
        <meta name="keywords" content="temporary email, disposable email, privacy, anonymous email, spam protection, TempMail Pro" />
        <link rel="canonical" href="https://tempmailpk.com/about" />

        {/* Open Graph */}
        <meta property="og:title" content="About TempMail Pro - Free Temporary Email Service" />
        <meta property="og:description" content="Learn about TempMail Pro, the privacy-first temporary email service. Browser-generated emails, no databases, complete anonymity." />
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
                  By generating temporary email addresses directly in your browser and maintaining
                  zero permanent storage, we ensure that your online activities remain private and secure.
                </p>
            </SectionCard>

            <SectionCard title="How It Works">
              <StepsGrid steps={steps} />
            </SectionCard>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-3">New: Yesim Virtual Number Service</h4>
                <p>
                  TempMail Pro now supports Yesim virtual numbers for secure SMS verification.
                  This privacy-first option helps you receive OTPs without exposing your personal phone number.
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
