import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";

/**
 * Terms of Service — written from the real architecture, not a template:
 * inboxes/tokens live in the visitor's browser, messages live on Mail.tm
 * under Mail.tm's retention, in-app expiry hides an inbox but does not by
 * itself delete the Mail.tm account (only an explicit inbox delete requests
 * that). The service is receive-only and runs no inbox database.
 */
const Terms = () => {
  return (
    <div className="about-container">
      <PageNavbar />
      <Helmet>
        <title>Terms of Service – TempMail Pro</title>
        <meta
          name="description"
          content="Terms of Service for TempMail Pro: what the free temporary email service is, how inboxes and messages are handled, acceptable use, and limits of liability."
        />
        <link rel="canonical" href="https://tempmailpk.com/terms" />
        <meta property="og:title" content="Terms of Service – TempMail Pro" />
        <meta property="og:description" content="Terms of Service for TempMail Pro: what the free temporary email service is, how inboxes and messages are handled, acceptable use, and limits of liability." />
        <meta property="og:url" content="https://tempmailpk.com/terms" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="text-center mb-5">Terms of Service</h1>
            <p className="lead">
              By accessing or using TempMail Pro (tempmailpk.com), you agree to
              these Terms of Service. If you do not agree, please do not use
              the service.
            </p>

            <h2 className="mt-5">1. The Service</h2>
            <p>
              TempMail Pro provides free temporary, disposable email addresses
              to protect your personal inbox from spam and unwanted marketing.
              You can create multiple inboxes, choose custom names, and pick an
              expiry (10 minutes, 1 hour, 24 hours, 7 days, or a custom
              duration). No sign-in is required. The service is{" "}
              <strong>receive-only</strong>: you cannot send email from a
              TempMail Pro address.
            </p>

            <h2 className="mt-5">2. How Inboxes and Messages Are Handled</h2>
            <p>
              Inbox addresses and access tokens are stored in your own browser
              (local storage) on your device. TempMail Pro runs no database of
              inboxes, so an inbox cannot be recovered from another browser,
              device, or incognito window, or after browser data is cleared.
            </p>
            <p>
              Messages are delivered by{" "}
              <a href="https://mail.tm" target="_blank" rel="noopener noreferrer">
                Mail.tm
              </a>
              , our mail infrastructure provider, and exist on Mail.tm&apos;s
              servers under Mail.tm&apos;s retention and deletion policies.
              Choosing an expiry removes the inbox from your view when it
              expires; expiry alone does not delete the Mail.tm account. When
              you delete an inbox in the app, deletion of its Mail.tm account
              is requested. Expired inboxes and their messages are assumed
              unrecoverable, so save anything important before an inbox
              expires.
            </p>

            <h2 className="mt-5">3. Acceptable Use</h2>
            <p>You agree to use the service only for lawful purposes. You must not use it to:</p>
            <ul>
              <li>commit fraud, phishing, spamming, harassment, or impersonation;</li>
              <li>evade bans, abuse promotions, or bypass the security measures of third-party platforms;</li>
              <li>create accounts on financial, banking, government, healthcare, or other sensitive services;</li>
              <li>overload, abuse, or circumvent the service&apos;s rate limits or security measures.</li>
            </ul>

            <h2 className="mt-5">4. Not for Important Accounts</h2>
            <p>
              Do not use temporary email for anything you need to recover
              later — banking, government, healthcare, long-term accounts, or
              password recovery. If an inbox expires or is deleted, access to
              anything tied to it is lost, and that loss is your
              responsibility.
            </p>

            <h2 className="mt-5">5. Service “As Is” and Limitation of Liability</h2>
            <p>
              The service is provided “as is” and “as available”, without
              warranties of any kind. TempMail Pro is not liable for:
            </p>
            <ul>
              <li>loss of inboxes, messages, or accounts due to expiry, deletion, or cleared browser data;</li>
              <li>service interruptions, downtime, or technical errors;</li>
              <li>actions by third-party services, such as a site rejecting or banning a temporary address;</li>
              <li>misuse of the service by other users.</li>
            </ul>
            <p>
              We may modify, suspend, restrict, or terminate access to the
              service, including for abuse, at any time without prior notice.
            </p>

            <h2 className="mt-5">6. Third Parties</h2>
            <p>
              Mail.tm provides the mail infrastructure and has its own
              policies. The partners listed on the Privacy Stack page (Yesim,
              NordVPN, NordPass) are separate affiliate services with their own
              policies; following a partner link leaves TempMail Pro.
            </p>

            <h2 className="mt-5">7. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of
              the service after an update means you accept the updated terms.
            </p>

            <h2 className="mt-5">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of Pakistan. Any dispute
              arising from the use of the service shall be handled under the
              jurisdiction of the local courts.
            </p>

            <h2 className="mt-5">9. Contact</h2>
            <p>
              For questions about these terms, or to report abuse of the
              service, please use the{" "}
              <Link to="/contact">Contact Us</Link> form.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
