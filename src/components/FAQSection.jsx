import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppIcon from "./AppIcon";

const FAQSection = () => {
  const [activeKey, setActiveKey] = useState("core-0");
  const [searchTerm, setSearchTerm] = useState("");

  const coreFaqs = [
    {
      q: "What is a temporary email address?",
      a: "A temporary email address is a short-lived inbox you can use instead of your personal email. It helps you receive messages for sign-ups, trials, and one-off registrations without exposing your main address.",
      icon: "📧"
    },
    {
      q: "Is temp mail safe to use?",
      a: "Yes, for normal low-risk sign-ups. It helps reduce spam and limits how often your real inbox gets shared. You should still avoid using temporary email for banking, government, medical, or other sensitive accounts.",
      icon: "🔒"
    },
    {
      q: "How long do temp mail addresses last?",
      a: "It depends on the service and session. In TempMail Pro, the disposable inbox is meant for temporary use and should not be treated like a permanent account you will rely on long term.",
      icon: "⏱️"
    },
    {
      q: "Do I need to sign up to use temp mail?",
      a: "No. You can instantly create and use a temp mail address without registration, passwords, or personal details.",
      icon: "🚀"
    },
    {
      q: "Can I send emails from a temporary address?",
      a: "Most disposable email services only allow receiving messages, not sending. This ensures privacy and prevents abuse.",
      icon: "📤"
    },
    {
      q: "Can websites block disposable email domains?",
      a: "Yes. Some services block temporary email domains during registration. If an account matters to you long term, use a permanent address that you control.",
      icon: "🚫"
    }
  ];

  const partnerFaqs = [
    {
      q: "What public Yesim details can we safely mention?",
      a: "Yesim publicly promotes travel eSIM plans, Pay and Fly, virtual numbers, 24/7 support, one eSIM for 200+ destinations, and features such as hotspot mode and 1-click installation. Prices and coverage can change, so users should always check Yesim's current pages before purchase.",
      icon: "🌍"
    },
    {
      q: "What is eSIM in Yesim's public FAQ?",
      a: "Yesim describes eSIM as an embedded or digital SIM that lets you activate cellular plans on a compatible device without using a physical SIM card. It can also be useful when you want a travel data plan or a separate line on the same device.",
      icon: "⚖️"
    },
    {
      q: "How do I activate Yesim mobile data?",
      a: "According to Yesim's public FAQ, you turn on the Yesim mobile line in Mobile Data settings, enable Data Roaming, and choose the Yesim line as your main internet line. You should not tap Remove Data Plan unless you want to delete the eSIM profile.",
      icon: "📶"
    },
    {
      q: "Can I make phone calls or send SMS with Yesim eSIM plans?",
      a: "Yesim's public FAQ says its prepaid eSIM plans are data-only. For calls and messages, it recommends using internet apps such as WhatsApp, Messenger, Viber, or similar VoIP services.",
      icon: "📱"
    },
    {
      q: "Is my device compatible with Yesim?",
      a: "Yesim says its service works on compatible Apple and Android devices that support eSIM. It also notes that many users can check eSIM support on their phone with *#06# before buying a plan.",
      icon: "📲"
    },
    {
      q: "When does a Yesim data plan start?",
      a: "Yesim's public FAQ says the data-plan duration starts right after purchase. If you do not want to use it immediately, it says you can choose Activate later and use the plan within the next 12 months.",
      icon: "📅"
    },
    {
      q: "Can I get a refund for Yesim services?",
      a: "Yesim's public refund page says eligible refunds are available within 30 days for unused, unexpired eSIM plans and top-ups. Used services are generally not refunded, and Ycoins are normally non-refundable except in certain technical-malfunction cases described in the policy.",
      icon: "💳"
    },
    {
      q: "Can I use Personal Hotspot or tethering with Yesim?",
      a: "Yesim's public FAQ says hotspot mode is supported. Data shared through tethering is still counted against your plan, so usage comes out of the same available balance.",
      icon: "📡"
    },
    {
      q: "Where does this partner FAQ information come from?",
      a: "These Yesim answers are paraphrased from publicly available product, FAQ, and refund-policy content on Yesim's official website. If you plan to buy a Yesim product, confirm the latest terms directly on their site first.",
      icon: "✅"
    }
  ];

  const toggleFAQ = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  const filterFAQs = (items) => items.filter((faq) => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCoreFaqs = filterFAQs(coreFaqs);
  const filteredPartnerFaqs = filterFAQs(partnerFaqs);
  const hasResults = filteredCoreFaqs.length > 0 || filteredPartnerFaqs.length > 0;

  const renderFaqList = (items, sectionKey) => (
    items.map((item, index) => {
      const itemKey = `${sectionKey}-${index}`;

      return (
        <div 
          key={itemKey} 
          className={`faq-item ${activeKey === itemKey ? 'active' : ''}`}
        >
          <button 
            className="faq-question"
            onClick={() => toggleFAQ(itemKey)}
            aria-expanded={activeKey === itemKey}
          >
            <div className="question-content">
              <span className="faq-icon">{item.icon}</span>
              <span className="question-text">{item.q}</span>
            </div>
            <span className="faq-toggle">
              <AppIcon iconClass={`bi ${activeKey === itemKey ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
            </span>
          </button>
          <div className="faq-answer">
            <div className="answer-content">
              <p>{item.a}</p>
            </div>
          </div>
        </div>
      );
    })
  );

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header text-center">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">Find answers about TempMail Pro first, then a separate partner FAQ based on publicly available Yesim product and policy pages.</p>
          
          <div className="faq-search">
            <div className="search-container">
              <AppIcon iconClass="bi bi-search" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  <AppIcon iconClass="bi bi-x" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="faq-container">
          {hasResults ? (
            <>
              {filteredCoreFaqs.length > 0 && (
                <div className="faq-group">
                  <div className="faq-group-header">
                    <span className="faq-group-eyebrow">Core FAQ</span>
                    <h3 className="faq-group-title">TempMail Pro Basics</h3>
                  </div>
                  {renderFaqList(filteredCoreFaqs, "core")}
                </div>
              )}

              {filteredPartnerFaqs.length > 0 && (
                <div className="faq-group faq-group-partner">
                  <div className="faq-group-header">
                    <span className="faq-group-eyebrow">Partner FAQ</span>
                    <h3 className="faq-group-title">Yesim Public Website Info</h3>
                    <p className="faq-group-note">This section is based on Yesim's public pages and is included for reference. Verify current pricing, coverage, and policies on Yesim before purchase.</p>
                  </div>
                  {renderFaqList(filteredPartnerFaqs, "partner")}
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <AppIcon iconClass="bi bi-search" />
              <p>No results found for "{searchTerm}"</p>
              <button 
                className="btn btn-primary"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <div className="faq-footer text-center">
          <p>Need a temporary inbox right now?</p>
          <Link to="/app" className="btn btn-outline-primary">
            Use TempMail Pro <AppIcon iconClass="bi bi-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
