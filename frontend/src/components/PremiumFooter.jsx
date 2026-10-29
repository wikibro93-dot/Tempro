import React from 'react';
import AppIcon from './AppIcon';
const PremiumFooter = () => {
  return (
    <footer className="premium-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-text">Temp<span>Mail</span> Pro</div>
          </div>
          <p className="footer-description">
            Premium temporary email service for secure and anonymous communication. 
            Protect your privacy with our disposable email solution.
          </p>
          <div className="social-links">
            <a href="#"><AppIcon iconClass="fab fa-twitter" /></a>
            <a href="#"><AppIcon iconClass="fab fa-facebook-f" /></a>
            <a href="#"><AppIcon iconClass="fab fa-instagram" /></a>
            <a href="#"><AppIcon iconClass="fab fa-linkedin-in" /></a>
            <a href="#"><AppIcon iconClass="fab fa-github" /></a>
          </div>
        </div>
        
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Home</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Features</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> How It Works</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Pricing</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Testimonials</a></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Features</h3>
          <ul className="footer-links">
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Disposable Email</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Email Forwarding</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Spam Protection</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Attachment Support</a></li>
            <li><a href="#"><AppIcon iconClass="fas fa-chevron-right" /> Custom Domains</a></li>
          </ul>
        </div>
        
        <div className="footer-column footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to our newsletter to receive updates and security tips.</p>
          <form className="newsletter-form">
            <input type="email" className="newsletter-input" placeholder="Your email address" />
            <button type="submit" className="subscribe-btn"><AppIcon iconClass="fas fa-paper-plane" /></button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="copyright">
          &copy; {new Date().getFullYear()} TempMail Pro. All rights reserved.
        </div>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
          <a href="#">GDPR</a>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
