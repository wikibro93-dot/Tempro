import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top py-3">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="fas fa-envelope me-2"></i>
            <strong>TempMail<span className="brand-highlight">PK</span></strong>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link active" to="/">Home</Link></li>
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#how-it-works">How It Works</a></li>
              <li className="nav-item"><a className="nav-link" href="#faq">FAQ</a></li>
              <li className="nav-item"><Link className="nav-link" to="/app">Use App</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Secure Your Privacy with <span className="brand-highlight">Temporary Email</span></h1>
              <p className="lead mb-5">TempMailPK provides free disposable email addresses to protect your personal inbox from spam, phishing, and unwanted marketing emails. No registration required!</p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/app" className="btn cta-button">
                  <i className="fas fa-bolt me-2"></i>Generate Temp Email
                </Link>
                <a href="#features" className="btn btn-outline-light">
                  <i className="fas fa-question-circle me-2"></i>Learn More
                </a>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0 text-center">
              <img src="/images/temp-mail-promo.png" alt="TempMailPK - Free Temporary Email Service" className="promo-image img-fluid" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">Why Choose TempMailPK?</h2>
            <p className="text-muted">The best temporary email service for protecting your privacy in Pakistan</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <h4 className="card-title">Complete Anonymity</h4>
                  <p className="card-text">No personal information required. Use our service without revealing your identity or providing any personal details.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card feature-card h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h4 className="card-title">Spam Protection</h4>
                  <p className="card-text">Keep your primary inbox clean by using disposable addresses for sign-ups, downloads, and online registrations.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card feature-card h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <h4 className="card-title">Instant Setup</h4>
                  <p className="card-text">Get a temporary email address instantly with just one click. No registration or credit card required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      

      {/* How It Works */}
      <section id="how-it-works" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">How It Works</h2>
            <p className="text-muted">Get started with TempMailPK in three simple steps</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
                <span className="fs-1 fw-bold">1</span>
              </div>
              <h4>Generate Address</h4>
              <p>Click the generate button to create a random email address instantly</p>
            </div>
            
            <div className="col-md-4 text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
                <span className="fs-1 fw-bold">2</span>
              </div>
              <h4>Use It Anywhere</h4>
              <p>Use this email for sign-ups, downloads, or any temporary need across the web</p>
            </div>
            
            <div className="col-md-4 text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
                <span className="fs-1 fw-bold">3</span>
              </div>
              <h4>Stay Protected</h4>
              <p>All spam stays in your temporary inbox, protecting your main email account</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">Frequently Asked Questions</h2>
            <p className="text-muted">Get answers to common questions about TempMailPK</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      Is TempMailPK completely free to use?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, TempMailPK is completely free to use. We don't charge any fees and there are no premium plans. Our service is supported by non-intrusive advertisements.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      How long do temporary emails last?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Your temporary email address will remain active for 24 hours. After this period, the address expires and all emails are permanently deleted from our system.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      Is TempMailPK service secure?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, we prioritize your security and privacy. We don't require any personal information, and all emails are automatically deleted after 24 hours. We don't store any logs of your activity.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-dark text-white py-5 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <h5>TempMailPK</h5>
              <p>The best temporary email service to protect your privacy online. Designed specifically for users in Pakistan.</p>
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
                <li className="mb-2"><Link to="/" className="text-white text-decoration-none">Home</Link></li>
                <li className="mb-2"><a href="#features" className="text-white text-decoration-none">Features</a></li>
                <li className="mb-2"><a href="#how-it-works" className="text-white text-decoration-none">How It Works</a></li>
                <li className="mb-2"><a href="#faq" className="text-white text-decoration-none">FAQ</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4 mb-4">
              <h5>Legal</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/privacy" className="text-white text-decoration-none">Privacy Policy</Link></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">Terms of Service</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">Disclaimer</a></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-4 mb-4">
              <h5>Contact Us</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><i className="fas fa-envelope me-2"></i> support@tempmailpk.com</li>
                <li className="mb-2"><i className="fas fa-globe me-2"></i> https://tempmailpk.com</li>
              </ul>
            </div>
          </div>
          <hr className="bg-light my-4" />
          <div className="text-center py-3">
            <p className="mb-0">&copy; 2023 TempMailPK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;