import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";
import AppIcon from "./AppIcon";

/**
 * Contact page — submissions go to Web3Forms (free form-to-email service)
 * and are delivered to wikibro93@gmail.com. There is no TempMail mailbox
 * behind this form: the old Hostinger professional email was never activated
 * for tempmailpk.com, so the footer no longer points users at it.
 *
 * WEB3FORMS_ACCESS_KEY is PUBLIC BY DESIGN (Web3Forms' own wording): it is
 * an alias for the destination inbox, not a secret, and it ships in the HTML.
 * It is emailed to wikibro93@gmail.com when the key is created on
 * web3forms.com. If it is still the placeholder below, the form refuses to
 * submit rather than silently dropping messages.
 */
const WEB3FORMS_ACCESS_KEY = "8fdc441f-719c-44aa-b586-eb27a0353db1";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const TOPICS = [
  "General question",
  "Problem with the app",
  "Feedback or suggestion",
  "Privacy question",
  "Advertise / Sponsorship enquiry",
  "Something else",
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorText, setErrorText] = useState("");

  const keyConfigured = WEB3FORMS_ACCESS_KEY && !WEB3FORMS_ACCESS_KEY.startsWith("PASTE_");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyConfigured) {
      setStatus("error");
      setErrorText("The contact form is still being connected. Please try again shortly.");
      return;
    }
    setStatus("sending");
    setErrorText("");

    const formData = new FormData();
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("subject", `[TempMail Pro Contact] ${topic}`);
    formData.append("from_name", "TempMail Pro Contact Form");
    formData.append("replyto", email.trim());
    formData.append("message", message.trim());
    // Spam protection: Web3Forms runs a server-side spam check on every
    // submission on all plans; hCaptcha can additionally be switched on for
    // this form in the Web3Forms dashboard if spam ever appears. No honeypot
    // field is sent here because this form posts via fetch with a hand-built
    // FormData object — an unchecked honeypot checkbox is simply absent.

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setTopic(TOPICS[0]);
        setMessage("");
      } else {
        setStatus("error");
        setErrorText(data.message || "Your message could not be sent. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorText("Could not reach the form service. Please check your connection and try again.");
    }
  };

  return (
    <div className="about-container">
      <PageNavbar />
      <Helmet>
        <title>Contact TempMail Pro – Support &amp; Feedback</title>
        <meta
          name="description"
          content="Contact TempMail Pro support with questions, feedback, or problems using the app. Fill in the form and we will reply to your email address."
        />
        <link rel="canonical" href="https://tempmailpk.com/contact" />
        <meta property="og:title" content="Contact TempMail Pro – Support & Feedback" />
        <meta
          property="og:description"
          content="Contact TempMail Pro support with questions, feedback, or problems using the app. Fill in the form and we will reply to your email address."
        />
        <meta property="og:url" content="https://tempmailpk.com/contact" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="text-center mb-3">Contact TempMail Pro</h1>
            <p className="text-center text-muted mb-5">
              Questions, a problem with the app, or feedback — send it here and
              we will reply to the email address you give below.
            </p>

            {status === "success" && (
              <div className="alert alert-success" role="alert">
                <AppIcon iconClass="bi bi-check-circle-fill me-2" />
                Message sent. Thank you — we will reply to your email address.
              </div>
            )}
            {status === "error" && (
              <div className="alert alert-danger" role="alert">
                <AppIcon iconClass="bi bi-exclamation-triangle-fill me-2" />
                {errorText}
              </div>
            )}
            {!keyConfigured && (
              <div className="alert alert-warning" role="alert">
                <AppIcon iconClass="bi bi-info-circle-fill me-2" />
                The contact form is still being connected. Please check back shortly.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="contact-name" className="form-label">Your name (optional)</label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={100}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="contact-email" className="form-label">Your email address</label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  maxLength={254}
                />
                <div className="form-text">
                  We use your email only to reply to your message. It is not
                  added to any mailing list.
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="contact-topic" className="form-label">Topic</label>
                <select
                  id="contact-topic"
                  className="form-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="contact-message" className="form-label">Message</label>
                {topic === "Advertise / Sponsorship enquiry" && (
                  <div className="form-text mb-2">
                    For sponsorships, please include your website, what you want
                    to promote, the placement and duration you have in mind,
                    and your budget. You can also share banner or logo links
                    (Google Drive, Imgur, or similar) in your message.
                  </div>
                )}
                <textarea
                  id="contact-message"
                  className="form-control"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={5000}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={status === "sending" || !keyConfigured}
                style={{ minHeight: "44px" }}
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
