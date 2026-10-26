import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppIcon from './AppIcon';
import { AFFILIATE_REL, getAffiliateLink } from '../utils/affiliateLinks';
import { trackAffiliateClick } from '../utils/affiliateTracking';

const Footer = () => {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  const handleAffiliateClick = (partner, placement) => {
    trackAffiliateClick({
      partner,
      placement,
      href: getAffiliateLink(partner, placement),
      source: 'footer',
    });
  };

  const handleAppCtaClick = (e) => {
    if (pathname === '/app') {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">

          {/* Brand column */}
          <div className="site-footer__brand-col">
            <Link to="/" className="site-footer__brand">
              <span className="site-footer__brand-icon">
                <AppIcon iconClass="fas fa-shield-alt" />
              </span>
              <span className="site-footer__brand-name">
                TempMail<span>Pro</span>
              </span>
            </Link>
            <p className="site-footer__tagline">
              Free disposable email service — protect your real inbox from spam, tracking, and data leaks.
              No registration. No storage. No nonsense.
            </p>
            <Link to="/app" className="site-footer__cta" onClick={handleAppCtaClick}>
              <AppIcon iconClass="fas fa-bolt me-2" />Get Free Temp Email
            </Link>
            <p className="site-footer__disclaimer">
              <AppIcon iconClass="fas fa-info-circle me-1 opacity-50" />
              Partner notice: We may include optional partner links (e.g. Yesim, NordVPN, NordPass) for privacy and account-security tools.
              TempMail Pro and partner services are separate products.
            </p>
          </div>

          {/* Quick Links */}
          <div className="site-footer__col">
            <h3 className="site-footer__heading">Quick Links</h3>
            <ul className="site-footer__links">
              <li><Link to="/"><AppIcon iconClass="fas fa-home me-2" />Home</Link></li>
              <li><Link to="/app"><AppIcon iconClass="fas fa-envelope me-2" />Use App</Link></li>
              <li><Link to="/privacy-stack"><AppIcon iconClass="fas fa-layer-group me-2" />Privacy Stack</Link></li>
              <li><Link to="/blog"><AppIcon iconClass="fas fa-newspaper me-2" />Blog</Link></li>
              <li><Link to="/about"><AppIcon iconClass="fas fa-info-circle me-2" />About</Link></li>
              <li><Link to="/privacy"><AppIcon iconClass="fas fa-shield-alt me-2" />Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="site-footer__col">
            <h3 className="site-footer__heading">Resources</h3>
            <ul className="site-footer__links">
              <li>
                <a
                  href={getAffiliateLink('yesim', 'footer_yesim')}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() => handleAffiliateClick('yesim', 'footer_yesim')}
                >
                  <AppIcon iconClass="fas fa-sim-card me-2" />Get Virtual Number
                  <span className="site-footer__badge">via Yesim</span>
                </a>
              </li>
              <li>
                <a
                  href={getAffiliateLink('nordvpn', 'footer_nordvpn')}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() => handleAffiliateClick('nordvpn', 'footer_nordvpn')}
                >
                  <AppIcon iconClass="fas fa-shield-alt me-2" />Get VPN Privacy
                  <span className="site-footer__badge">via NordVPN</span>
                </a>
              </li>
              <li>
                <a
                  href={getAffiliateLink('nordpass', 'footer_nordpass')}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() => handleAffiliateClick('nordpass', 'footer_nordpass')}
                >
                  <AppIcon iconClass="fas fa-key me-2" />Manage Passwords
                  <span className="site-footer__badge">via NordPass</span>
                </a>
              </li>
              <li><Link to="/blog/how-to-use-temp-email-for-free-trials"><AppIcon iconClass="fas fa-book me-2" />How to Use Temp Email</Link></li>
              <li><Link to="/blog/is-free-temp-mail-legal"><AppIcon iconClass="fas fa-balance-scale me-2" />Is Temp Mail Legal?</Link></li>
                <li><Link to="/privacy-stack"><AppIcon iconClass="fas fa-shield-virus me-2" />Privacy Stack Guide</Link></li>
              <li><Link to="/blog/temp-email-vs-email-alias"><AppIcon iconClass="fas fa-code-branch me-2" />Temp Mail vs Alias</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="site-footer__bottom">
          <p className="site-footer__copyright">
            &copy; {year} TempMail Pro &mdash; All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;