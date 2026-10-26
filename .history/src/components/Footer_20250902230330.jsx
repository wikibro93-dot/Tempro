import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ isDarkMode = false }) => {
  return (
    <footer className={`${isDarkMode ? 'bg-dark text-white' : 'bg-light'} py-5 mt-5`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5>TempMail Pro</h5>
            <p>Free temporary email service to protect your privacy online. No registration required.</p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 mb-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/app" className="text-decoration-none">Use App</Link></li>
              <li className="mb-2"><Link to="/privacy" className="text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-4 mb-4">
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><i className="fas fa-envelope me-2"></i> support@tempmailpro.com</li>
              <li className="mb-2"><i className="fas fa-globe me-2"></i> https://tempmailpro.com</li>
            </ul>
          </div>
        </div>
        <hr className={`${isDarkMode ? 'bg-light' : 'bg-dark'} my-4`} />
        <div className="text-center py-3">
          <p className="mb-0">&copy; {new Date().getFullYear()} TempMail Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;