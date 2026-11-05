import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";

/**
 * DMCA / Copyright Policy — written from the real architecture: the service
 * is receive-only, publishes nothing, and permanently hosts nothing. Messages
 * are transient and live on Mail.tm under Mail.tm's retention, so a notice
 * may arrive after the material is already gone. The only working contact
 * channel is the /contact form (there is no support mailbox).
 */
const Dmca = () => {
  return (
    <div className="about-container">
      <PageNavbar />
      <Helmet>
        <title>DMCA Policy – TempMail Pro</title>
        <meta
          name="description"
          content="DMCA and copyright policy for TempMail Pro: how to report allegedly infringing material processed through the temporary email service, and the limits of what can be removed."
        />
        <link rel="canonical" href="https://tempmailpk.com/dmca" />
        <meta property="og:title" content="DMCA Policy – TempMail Pro" />
        <meta property="og:description" content="DMCA and copyright policy for TempMail Pro: how to report allegedly infringing material processed through the temporary email service, and the limits of what can be removed." />
        <meta property="og:url" content="https://tempmailpk.com/dmca" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="text-center mb-2">DMCA &amp; Copyright Policy</h1>
            <p className="text-muted text-center mb-5">
              Last updated: November 2026
            </p>
            <p className="lead">
              TempMail Pro respects the intellectual property rights of
              others. This page explains how to report allegedly infringing
              material, and what can actually be done about it given how the
              service works.
            </p>

            <h2 className="mt-5">1. What the Service Does and Does Not Do</h2>
            <p>
              TempMail Pro provides temporary inboxes that receive email. It
              does not publish user content, does not offer downloads, and
              does not permanently host anything. Messages are transient: they
              arrive through our mail infrastructure provider,{" "}
              <a href="https://mail.tm" target="_blank" rel="noopener noreferrer">
                Mail.tm
              </a>
              , and exist on Mail.tm&apos;s servers under Mail.tm&apos;s
              retention and deletion policies until the inbox expires or is
              deleted.
            </p>

            <h2 className="mt-5">2. Reporting Alleged Infringement</h2>
            <p>
              If you believe material processed through the service infringes
              your copyright, please send a notice through the{" "}
              <Link to="/contact">Contact Us</Link> form, including:
            </p>
            <p>
              Notices sent through the Contact Us form are our designated
              channel for copyright reports; there is no separate copyright
              email address.
            </p>
            <ul>
              <li>your signature (physical or electronic) and authority to act on behalf of the copyright owner;</li>
              <li>identification of the copyrighted work claimed to have been infringed;</li>
              <li>identification of the material claimed to be infringing, with enough detail to locate it — for example, the temporary address involved and, if known, the message details;</li>
              <li>your contact details, including an email address where you can be reached;</li>
              <li>a statement that you have a good-faith belief that the use is not authorized by the copyright owner;</li>
              <li>a statement, under penalty of perjury, that the information in the notice is accurate and that you are authorized to act on behalf of the copyright owner.</li>
            </ul>

            <h2 className="mt-5">3. Honest Limits</h2>
            <p>
              Because inboxes are transient, the material in a notice may
              already be expired or deleted by the time the notice is read,
              and we cannot retrieve or remove what we no longer hold or what
              lives only on Mail.tm&apos;s servers. Where we can act — for
              example, by restricting abusive use of the service — we will do
              so promptly. Knowingly false notices, and repeat abusive use of
              the service, may lead to restriction of access.
            </p>

            <h2 className="mt-5">4. Counter-Notices</h2>
            <p>
              If you believe material was restricted in error, you may send a
              counter-notice through the{" "}
              <Link to="/contact">Contact Us</Link> form, including:
            </p>
            <ul>
              <li>identification of the material that was restricted, with enough detail to locate it — for example, the temporary address involved and, if known, the message details;</li>
              <li>a statement, under penalty of perjury, that you have a good-faith belief the material was restricted by mistake or misidentification;</li>
              <li>your name and contact details, including an email address where you can be reached.</li>
            </ul>
            <p>
              Because inboxes are transient, material that has already expired
              or been deleted cannot be restored, even if a counter-notice is
              accepted.
            </p>

            <h2 className="mt-5">5. A Note on This Page</h2>
            <p>
              This page is provided as a clear reporting channel for rights
              holders and hosting providers. It does not claim any particular
              legal status for the service. For other questions, including
              abuse that is not copyright-related, please use the{" "}
              <Link to="/contact">Contact Us</Link> form and choose the
              closest topic. The{" "}
              <Link to="/terms">Terms of Service</Link> apply to all use of
              the service.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dmca;
