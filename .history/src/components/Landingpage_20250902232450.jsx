import React from "react";
import { Link } from "react-router-dom";
import FAQSection from "./components/FAQSection";
import BlogList from "./components/BlogList";
import BlogPost from "./components/BlogPost";
import Footer from "./components/Footer";

const LandingPage = () => {
  // Smooth scroll function for anchor links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top py-3">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="fas fa-envelope me-2"></i>
            <strong>TempMail<span className="brand-highlight">Pro</span></strong>
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => scrollToSection('features')}
                >
                  Features
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => scrollToSection('how-it-works')}
                >
                  How It Works
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => scrollToSection('faq')}
                >
                  FAQ
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => scrollToSection('blog')}
                >
                  Blog
                </button>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/app">Use App</Link>
              </li>
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
              <p className="lead mb-5">TempMail Pro provides free disposable email addresses to protect your personal inbox from spam, phishing, and unwanted marketing emails. No registration required!</p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/app" className="btn cta-button">
                  <i className="fas fa-bolt me-2"></i>Generate Temp Email
                </Link>
                <button 
                  className="btn btn-outline-light"
                  onClick={() => scrollToSection('features')}
                >
                  <i className="fas fa-question-circle me-2"></i>Learn More
                </button>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0 text-center">
              <img 
                src="/images/temp-mail-promo.png" 
                alt="TempMail Pro - Free Temporary Email Service" 
                className="promo-image img-fluid" 
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1515942405154-483d35a4fe5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">Why Choose TempMail Pro?</h2>
            <p className="text-muted">The best temporary email service for protecting your privacy</p>
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
            <p className="text-muted">Get started with TempMail Pro in three simple steps</p>
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
            <p className="text-muted">Get answers to common questions about TempMail Pro</p>
          </div>
          
          <FAQSection />
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">Latest from Our Blog</h2>
            <p className="text-muted">Helpful articles about email privacy and security</p>
          </div>
          
          <BlogList />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;