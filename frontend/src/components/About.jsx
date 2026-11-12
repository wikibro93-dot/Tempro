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
        "Temporary email addresses are created in your browser through the TempMail Pro service, on Mail.tm infrastructure.",
    },
    {
      iconClass: "bi bi-database-x",
      iconColor: "text-danger",
      title: "No Permanent Storage of Your Inboxes",
      description:
        "TempMail Pro keeps no permanent storage of your inboxes. Expiry hides an inbox from the app, but only explicit delete removes the underlying Mail.tm account.",
    },
    {
      iconClass: "bi bi-eye-slash",
      iconColor: "text-warning",
      title: "No Sign-In Required",
      description:
        "No sign-in is required to create an inbox, and no card is needed for the free service.",
    },
    {
      iconClass: "bi bi-clock",
      iconColor: "text-info",
      title: "Expiry You Choose",
      description:
        "Pick an expiry when you create an inbox: 10 minutes, 1 hour, 24 hours, 7 days, or a custom duration up to 365 days.",
    },
  ];

  const steps = [
    {
      title: "Generate",
      description: "Click to create a temporary email address instantly — no sign-in, no card",
    },
    {
      title: "Use Anywhere",
      description: "Use it for sign-ups, downloads, trials, or any service that asks for an address",
    },
    {
      title: "Delete or Let It Expire",
      description: "Delete the inbox explicitly when done — only explicit delete removes the underlying Mail.tm account",
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

            <SectionCard title="What TempMail Pro is">
              <p>
                TempMail Pro is a free temporary email service. You open the app, generate a
                disposable email address, and use it wherever a website asks for an email
                before it will let you in: a free trial, a download, a newsletter signup, or
                a one-time verification code. Mail sent to that address arrives in a temporary
                inbox in your browser, and the follow-up marketing and renewal reminders go
                to the disposable address, not to the inbox you check every day.
              </p>
              <p>
                The free service is powered by Mail.tm, a free public email API. TempMail Pro
                provides the app, the multiple-inbox interface, the custom names, and the expiry
                controls, while the mail itself is handled by Mail.tm infrastructure. We say so
                plainly here and in the site footer, because a service that hides where your mail
                lives is not one you can judge honestly.
              </p>
              <p>
                You can run several inboxes at once — one per signup, trial, or test case — and
                give each one a custom name. A custom-name inbox appends a random 4-character
                suffix, so the exact name you type is not guaranteed, but a named inbox is still
                far easier to recognise than a random string weeks later.
              </p>
            </SectionCard>

            <SectionCard title="What it does — and what it does not do">
              <p>
                TempMail Pro does a small number of things, and it does them openly. It gives
                you a working email address in seconds, with no sign-in and no card, receives
                verification emails and activation links for signups you are evaluating, keeps
                each signup in its own inbox, and lets you choose how long an inbox stays
                usable — 10 minutes, 1 hour, 24 hours, 7 days, or a custom duration up to
                365 days.
              </p>
              <p>
                What it does not do is just as important. A temporary inbox is not a permanent
                email account: lose the inbox and you cannot receive a password reset or a
                login code for anything tied to it. It does not provide phone numbers or SMS
                verification, and some websites block disposable domains at signup.
              </p>
              <p>
                One point deserves to be stated exactly, because an earlier version of this
                page stated it wrongly. When an inbox expires in the app, it disappears from
                your view — but that expiry does <strong>not</strong> delete the underlying
                Mail.tm account. Only deleting the inbox explicitly deletes that account.
              </p>
            </SectionCard>

            <SectionCard title="Who it is for">
              <p>
                TempMail Pro is for anyone who has to hand over an email address to try
                something, and would rather not hand over the address they actually live in:
                people trying a free trial, shoppers unlocking a coupon, students trying a
                course platform for an assignment, and developers who need a fresh address
                for every signup test. It is for anyone who wants a boundary — one inbox for
                trying things, and a separate personal inbox that stays quiet.
              </p>
              <p>
                It is not for accounts you cannot afford to lose. Banking, government
                services, password recovery for an account you rely on, and paid subscriptions
                you intend to keep belong on a permanent, recoverable address from the start.
                If a trial convinces you to keep a service, move the account to a permanent
                address you control before the temporary inbox expires.
              </p>
            </SectionCard>

            <SectionCard title="How it works">
              <StepsGrid steps={steps} />
              <p>
                When you generate an inbox, the app requests an address from the mail server
                and shows it to you immediately. Mail sent to that address arrives in the
                inbox, where you can follow its verification link or copy its code. There is
                no TempMail Pro login to forget — your inboxes live in your browser session,
                so keep an inbox's address somewhere you control.
              </p>
              <p>
                For users who need more, TempMail Pro Premium is $5 a month or $48 a year for
                one bring-your-own domain, with 10 inboxes per domain and 50 emails per key
                per calendar month, and a 14-day full refund on first payment.
              </p>
            </SectionCard>

            <SectionCard title="Our mission">
                <p>
                  In today's digital world, maintaining privacy online has become increasingly challenging.
                  Websites and services collect email addresses for various purposes, often leading to
                  unwanted spam, marketing emails, and potential security risks. TempMail Pro was created
                  to give users back control: privacy should be the default, not an optional feature, and
                  a simple temporary address protects your primary email while still letting you access
                  services that require verification. A temporary inbox is a boundary for trying things,
                  not a vault for keeping them.
                </p>
            </SectionCard>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-3">New: Yesim Virtual Number Service</h4>
                <p>
                  Through our affiliate partnership with Yesim, a separate external service, you can explore Yesim virtual numbers as an optional way to receive SMS verification. Yesim is not part of the TempMail Pro app, which handles email only.
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

            <SectionCard title="What we don't do">
              <p>
                TempMail Pro does not offer permanent email accounts, and a temporary inbox
                should never be treated as one. We do not recover accounts after an inbox
                expires, we do not restore messages from an inbox you have deleted or let
                expire, and we do not provide SMS codes inside the app. We do not recommend
                temp mail for banking, government, or other important accounts, or for
                evading a ban, abusing a promotion, or working around a block on disposable domains.
              </p>
            </SectionCard>

            <SectionCard title="For users in the United States">
                <p>
                  TempMail Pro is free and works worldwide, including for users in the United States.
                  US users can use the same features as everyone else: multiple inboxes, custom names,
                  and custom expiry, with no sign-in required. The most common US use is the free-trial
                  signup — a streaming service, a shopping site, a job board, an AI tool, or a
                  newsletter offered in the United States asks for an email before you can try it, and
                  then keeps sending follow-up campaigns long after the trial ends.
                </p>
                <p>
                  US trials deserve the same discipline as any other trial. Pick an expiry that
                  matches the trial — 10 minutes to 1 hour for a quick demo, 24 hours to 7 days
                  if the trial sends follow-ups, a custom duration for a 14-day or 30-day trial —
                  and save the trial end date and cancellation steps in your own notes, outside
                  the temporary inbox. Check that dates, prices, and times read sensibly in US
                  format, and that the renewal reminder states the price in dollars clearly
                  before the trial converts. Some US services block disposable domains, and some
                  — Netflix and Disney+ among them — offer no free trial at all, so always check
                  the service's own signup page before starting.
                </p>
                <p>
                  This is a service description, not a location claim: TempMail Pro does not
                  claim a US office, address, phone number, or company registration. The same
                  limits apply in the United States as elsewhere.
                </p>
            </SectionCard>

            <FinalCtaCard
              title="Ready to Protect Your Privacy?"
              description="Create a free temporary inbox in seconds — no sign-in, no card."
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
