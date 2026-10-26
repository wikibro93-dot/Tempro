// // import React from "react";
// // import { Link } from "react-router-dom";
// // import FAQSection from "./FAQSection";
// // import BlogList from "./BlogList";
// // import Footer from "./Footer";

// // const Landing = () => {
// //   // Smooth scroll function for anchor links
// //   const scrollToSection = (id) => {
// //     const element = document.getElementById(id);
// //     if (element) {
// //       element.scrollIntoView({ behavior: "smooth" });
// //     }
// //   };

// //   return (
// //     <div className="landing-page">
// //       {/* Navigation */}
// //       <nav className="navbar navbar-expand-lg navbar-dark sticky-top py-3">
// //         <div className="container">
// //           <Link className="navbar-brand d-flex align-items-center" to="/">
// //             <i className="fas fa-envelope me-2"></i>
// //             <strong>TempMail<span className="brand-highlight">Pro</span></strong>
// //           </Link>
// //           <button 
// //             className="navbar-toggler" 
// //             type="button" 
// //             data-bs-toggle="collapse" 
// //             data-bs-target="#navbarNav"
// //             aria-label="Toggle navigation"
// //           >
// //             <span className="navbar-toggler-icon"></span>
// //           </button>
// //           <div className="collapse navbar-collapse" id="navbarNav">
// //             <ul className="navbar-nav ms-auto">
// //               <li className="nav-item">
// //                 <Link className="nav-link active" to="/">Home</Link>
// //               </li>
// //               <li className="nav-item">
// //                 <button 
// //                   className="nav-link btn btn-link" 
// //                   onClick={() => scrollToSection('features')}
// //                 >
// //                   Features
// //                 </button>
// //               </li>
// //               <li className="nav-item">
// //                 <button 
// //                   className="nav-link btn btn-link" 
// //                   onClick={() => scrollToSection('how-it-works')}
// //                 >
// //                   How It Works
// //                 </button>
// //               </li>
// //               <li className="nav-item">
// //                 <button 
// //                   className="nav-link btn btn-link" 
// //                   onClick={() => scrollToSection('faq')}
// //                 >
// //                   FAQ
// //                 </button>
// //               </li>
// //               <li className="nav-item">
// //                 <button 
// //                   className="nav-link btn btn-link" 
// //                   onClick={() => scrollToSection('blog')}
// //                 >
// //                   Blog
// //                 </button>
// //               </li>
// //               <li className="nav-item">
// //                 <Link className="nav-link" to="/app">Use App</Link>
// //               </li>
// //             </ul>
// //           </div>
// //         </div>
// //       </nav>

// //       {/* Hero Section */}
// //       <section className="hero-section">
// //         <div className="container">
// //           <div className="row align-items-center">
// //             <div className="col-lg-6">
// //               <h1 className="display-4 fw-bold mb-4">Secure Your Privacy with <span className="brand-highlight">Temporary Email</span></h1>
// //               <p className="lead mb-5">TempMail Pro provides free disposable email addresses to protect your personal inbox from spam, phishing, and unwanted marketing emails. No registration required!</p>
// //               <div className="d-flex flex-wrap gap-3">
// //                 <Link to="/app" className="btn cta-button">
// //                   <i className="fas fa-bolt me-2"></i>Generate Temp Email
// //                 </Link>
// //                 <button 
// //                   className="btn btn-outline-light"
// //                   onClick={() => scrollToSection('features')}
// //                 >
// //                   <i className="fas fa-question-circle me-2"></i>Learn More
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="col-lg-6 mt-5 mt-lg-0 text-center">
// //               <img 
// //                 src="/images/temp-mail-promo.png" 
// //                 alt="TempMail Pro - Free Temporary Email Service" 
// //                 className="promo-image img-fluid" 
// //                 onError={(e) => {
// //                   e.target.src = "https://images.unsplash.com/photo-1515942405154-483d35a4fe5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
// //                 }}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Features Section */}
// //       <section id="features" className="py-5">
// //         <div className="container">
// //           <div className="text-center mb-5">
// //             <h2 className="fw-bold section-title d-inline-block">Why Choose TempMail Pro?</h2>
// //             <p className="text-muted">The best temporary email service for protecting your privacy</p>
// //           </div>
          
// //           <div className="row g-4">
// //             <div className="col-md-4">
// //               <div className="card feature-card h-100">
// //                 <div className="card-body text-center p-4">
// //                   <div className="feature-icon">
// //                     <i className="fas fa-user-shield"></i>
// //                   </div>
// //                   <h4 className="card-title">Complete Anonymity</h4>
// //                   <p className="card-text">No personal information required. Use our service without revealing your identity or providing any personal details.</p>
// //                 </div>
// //               </div>
// //             </div>
            
// //             <div className="col-md-4">
// //               <div className="card feature-card h-100">
// //                 <div className="card-body text-center p-4">
// //                   <div className="feature-icon">
// //                     <i className="fas fa-shield-alt"></i>
// //                   </div>
// //                   <h4 className="card-title">Spam Protection</h4>
// //                   <p className="card-text">Keep your primary inbox clean by using disposable addresses for sign-ups, downloads, and online registrations.</p>
// //                 </div>
// //               </div>
// //             </div>
            
// //             <div className="col-md-4">
// //               <div className="card feature-card h-100">
// //                 <div className="card-body text-center p-4">
// //                   <div className="feature-icon">
// //                     <i className="fas fa-bolt"></i>
// //                   </div>
// //                   <h4 className="card-title">Instant Setup</h4>
// //                   <p className="card-text">Get a temporary email address instantly with just one click. No registration or credit card required.</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* How It Works */}
// //       <section id="how-it-works" className="py-5 bg-light">
// //         <div className="container">
// //           <div className="text-center mb-5">
// //             <h2 className="fw-bold section-title d-inline-block">How It Works</h2>
// //             <p className="text-muted">Get started with TempMail Pro in three simple steps</p>
// //           </div>
          
// //           <div className="row g-4">
// //             <div className="col-md-4 text-center">
// //               <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
// //                 <span className="fs-1 fw-bold">1</span>
// //               </div>
// //               <h4>Generate Address</h4>
// //               <p>Click the generate button to create a random email address instantly</p>
// //             </div>
            
// //             <div className="col-md-4 text-center">
// //               <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
// //                 <span className="fs-1 fw-bold">2</span>
// //               </div>
// //               <h4>Use It Anywhere</h4>
// //               <p>Use this email for sign-ups, downloads, or any temporary need across the web</p>
// //             </div>
            
// //             <div className="col-md-4 text-center">
// //               <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
// //                 <span className="fs-1 fw-bold">3</span>
// //               </div>
// //               <h4>Stay Protected</h4>
// //               <p>All spam stays in your temporary inbox, protecting your main email account</p>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* FAQ Section */}
// //       <section id="faq" className="py-5">
// //         <div className="container">
// //           <div className="text-center mb-5">
// //             <h2 className="fw-bold section-title d-inline-block">Frequently Asked Questions</h2>
// //             <p className="text-muted">Get answers to common questions about TempMail Pro</p>
// //           </div>
          
// //           <FAQSection />
// //         </div>
// //       </section>

// //       {/* Blog Section */}
// //       <section id="blog" className="py-5 bg-light">
// //         <div className="container">
// //           <div className="text-center mb-5">
// //             <h2 className="fw-bold section-title d-inline-block">Latest from Our Blog</h2>
// //             <p className="text-muted">Helpful articles about email privacy and security</p>
// //           </div>
          
// //           <BlogList />
// //         </div>
// //       </section>

// //       {/* Footer */}
// //       <Footer />
// //     </div>
// //   );
// // };

// // export default Landing;




// import React from "react";
// import { Link } from "react-router-dom";
// import FAQSection from "./FAQSection";
// import BlogList from "./BlogList";
// import Footer from "./Footer";

// const Landing = () => {
//   // Smooth scroll function for anchor links
//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <div className="landing-page">
//       {/* Navigation */}
//       <nav className="navbar navbar-expand-lg navbar-dark sticky-top py-3">
//         <div className="container">
//           <Link className="navbar-brand d-flex align-items-center" to="/">
//             <i className="fas fa-envelope me-2"></i>
//             <strong>TempMail<span className="brand-highlight">Pro</span></strong>
//           </Link>
//           <button 
//             className="navbar-toggler" 
//             type="button" 
//             data-bs-toggle="collapse" 
//             data-bs-target="#navbarNav"
//             aria-label="Toggle navigation"
//           >
//             <span className="navbar-toggler-icon"></span>
//           </button>
//           <div className="collapse navbar-collapse" id="navbarNav">
//             <ul className="navbar-nav ms-auto">
//               <li className="nav-item">
//                 <Link className="nav-link active" to="/">Home</Link>
//               </li>
//               <li className="nav-item">
//                 <button 
//                   className="nav-link btn btn-link" 
//                   onClick={() => scrollToSection('features')}
//                 >
//                   Features
//                 </button>
//               </li>
//               <li className="nav-item">
//                 <button 
//                   className="nav-link btn btn-link" 
//                   onClick={() => scrollToSection('how-it-works')}
//                 >
//                   How It Works
//                 </button>
//               </li>
//               <li className="nav-item">
//                 <button 
//                   className="nav-link btn btn-link" 
//                   onClick={() => scrollToSection('faq')}
//                 >
//                   FAQ
//                 </button>
//               </li>
//               <li className="nav-item">
//                 <button 
//                   className="nav-link btn btn-link" 
//                   onClick={() => scrollToSection('blog')}
//                 >
//                   Blog
//                 </button>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link" to="/app">Use App</Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="hero-section">
//         <div className="container">
//           <div className="row align-items-center">
//             <div className="col-lg-6">
//               <h1 className="display-4 fw-bold mb-4">Secure Your Privacy with <span className="brand-highlight">Temporary Email</span></h1>
//               <p className="lead mb-5">TempMail Pro provides free disposable email addresses to protect your personal inbox from spam, phishing, and unwanted marketing emails. No registration required!</p>
//               <div className="d-flex flex-wrap gap-3">
//                 <Link to="/app" className="btn cta-button">
//                   <i className="fas fa-bolt me-2"></i>Generate Temp Email
//                 </Link>
//                 <button 
//                   className="btn btn-outline-light"
//                   onClick={() => scrollToSection('features')}
//                 >
//                   <i className="fas fa-question-circle me-2"></i>Learn More
//                 </button>
//               </div>
//             </div>
//             <div className="col-lg-6 mt-5 mt-lg-0 text-center">
//               <img 
//                 src="/images/temp-mail-promo.png" 
//                 alt="TempMail Pro - Free Temporary Email Service" 
//                 className="promo-image img-fluid" 
//                 onError={(e) => {
//                   e.target.src = "https://images.unsplash.com/photo-1515942405154-483d35a4fe5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-5">
//         <div className="container">
//           <div className="text-center mb-5">
//             <h2 className="fw-bold section-title d-inline-block">Why Choose TempMail Pro?</h2>
//             <p className="text-muted">The best temporary email service for protecting your privacy</p>
//           </div>
          
//           <div className="row g-4">
//             <div className="col-md-4">
//               <div className="card feature-card h-100">
//                 <div className="card-body text-center p-4">
//                   <div className="feature-icon">
//                     <i className="fas fa-user-shield"></i>
//                   </div>
//                   <h4 className="card-title">Complete Anonymity</h4>
//                   <p className="card-text">No personal information required. Use our service without revealing your identity or providing any personal details.</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="col-md-4">
//               <div className="card feature-card h-100">
//                 <div className="card-body text-center p-4">
//                   <div className="feature-icon">
//                     <i className="fas fa-shield-alt"></i>
//                   </div>
//                   <h4 className="card-title">Spam Protection</h4>
//                   <p className="card-text">Keep your primary inbox clean by using disposable addresses for sign-ups, downloads, and online registrations.</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="col-md-4">
//               <div className="card feature-card h-100">
//                 <div className="card-body text-center p-4">
//                   <div className="feature-icon">
//                     <i className="fas fa-bolt"></i>
//                   </div>
//                   <h4 className="card-title">Instant Setup</h4>
//                   <p className="card-text">Get a temporary email address instantly with just one click. No registration or credit card required.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section id="how-it-works" className="py-5 bg-light">
//         <div className="container">
//           <div className="text-center mb-5">
//             <h2 className="fw-bold section-title d-inline-block">How It Works</h2>
//             <p className="text-muted">Get started with TempMail Pro in three simple steps</p>
//           </div>
          
//           <div className="row g-4">
//             <div className="col-md-4 text-center">
//               <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
//                 <span className="fs-1 fw-bold">1</span>
//               </div>
//               <h4>Generate Address</h4>
//               <p>Click the generate button to create a random email address instantly</p>
//             </div>
            
//             <div className="col-md-4 text-center">
//               <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
//                 <span className="fs-1 fw-bold">2</span>
//               </div>
//               <h4>Use It Anywhere</h4>
//               <p>Use this email for sign-ups, downloads, or any temporary need across the web</p>
//             </div>
            
//             <div className="col-md-4 text-center">
//               <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
//                 <span className="fs-1 fw-bold">3</span>
//               </div>
//               <h4>Stay Protected</h4>
//               <p>All spam stays in your temporary inbox, protecting your main email account</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section id="faq" className="py-5">
//         <div className="container">
//           <div className="text-center mb-5">
//             <h2 className="fw-bold section-title d-inline-block">Frequently Asked Questions</h2>
//             <p className="text-muted">Get answers to common questions about TempMail Pro</p>
//           </div>
          
//           <FAQSection />
//         </div>
//       </section>

//       {/* Blog Section */}
//       <section id="blog" className="py-5 bg-light">
//         <div className="container">
//           <div className="text-center mb-5">
//             <h2 className="fw-bold section-title d-inline-block">Latest from Our Blog</h2>
//             <p className="text-muted">Helpful articles about email privacy and security</p>
//           </div>
          
//           <BlogList />
//         </div>
//       </section>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// };

// export default Landing;










































import React from "react";
import { Link } from "react-router-dom";
import FAQSection from "./FAQSection";
import BlogList from "./BlogList";
import Footer from "./Footer";
import { Helmet } from "react-helmet-async";

const Landing = () => {
  // Smooth scroll function for anchor links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>TempMail Pro - Free Temporary Email Service</title>
        <meta 
          name="description" 
          content="TempMail Pro provides free disposable email addresses to protect your inbox from spam. Create, use, and delete emails instantly." 
        />
        <meta name="keywords" content="temporary email, disposable email, temp mail, spam protection, free email service, anonymous email" />
        
        {/* Open Graph */}
        <meta property="og:title" content="TempMail Pro - Free Disposable Email Service" />
        <meta property="og:description" content="Protect your inbox with free disposable emails from TempMail Pro. No registration required." />
        <meta property="og:image" content="https://tempmailpro.com/images/temp-mail-promo.png" />
        <meta property="og:url" content="https://tempmailpro.com" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TempMail Pro - Free Disposable Email Service" />
        <meta name="twitter:description" content="Protect your inbox with free disposable emails from TempMail Pro." />
        <meta name="twitter:image" content="https://tempmailpro.com/images/temp-mail-promo.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TempMail Pro",
            "url": "https://tempmailpro.com",
            "description": "Free temporary email service for anonymous and secure communication.",
            "applicationCategory": "CommunicationApplication",
            "operatingSystem": "Web Browser",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

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
                  onClick={() => scrollToSection('seo-article')}
                >
                  Email Security Guide
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

      {/* SEO Article Section */}
      <section id="seo-article" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">Complete Guide to Temporary Email Security</h2>
            <p className="text-muted">Everything you need to know about protecting your privacy with temporary emails</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <article className="article-content">
                <h3>Introduction to Email Privacy Challenges</h3>
                <p>In today's digital landscape, your email address is more than just a communication tool—it's a digital identity that's constantly under threat. With the average person receiving over 100 spam emails per week and data breaches exposing billions of records annually, protecting your primary email has never been more critical.</p>
                
                <h3>Why Temporary Email Solutions Matter</h3>
                <p>Temporary email services like TempMail Pro provide a protective barrier between your personal inbox and the digital world. By using disposable addresses for online registrations, newsletter sign-ups, and e-commerce transactions, you shield your primary email from spam, phishing attempts, and potential data breaches.</p>
                
                <h3>How Temporary Email Technology Works</h3>
                <p>When you generate a temporary email address, our system creates a unique inbox that exists for a predetermined period. All messages sent to this address are routed through our secure servers, where they're stripped of identifying metadata before being presented in your temporary inbox. This process ensures complete anonymity while maintaining functionality.</p>
                
                <h3>Key Benefits of Using Temporary Emails</h3>
                <ul>
                  <li><strong>Spam Prevention:</strong> Keep your primary inbox clean by containing promotional emails and spam in disposable accounts</li>
                  <li><strong>Identity Protection:</strong> Prevent your personal email from being added to marketing databases and sold to third parties</li>
                  <li><strong>Phishing Defense:</strong> Reduce exposure to malicious emails by using temporary addresses for unknown services</li>
                  <li><strong>Data Breach Protection:</strong> Limit the impact of service breaches by using unique addresses for each registration</li>
                  <li><strong>Organization:</strong> Create different addresses for different purposes to keep your digital life organized</li>
                </ul>
                
                <h3>Comparing Temporary Email to Other Solutions</h3>
                <p>While spam filters and email aliases offer some protection, they fall short compared to dedicated temporary email services. Traditional spam filters react to threats after they reach your inbox, while temporary emails prevent contact entirely. Email aliases still link back to your primary address, maintaining the connection that temporary emails completely sever.</p>
                
                <h3>Real-World Applications and Use Cases</h3>
                <p>From online shopping and social media registrations to software trials and newsletter subscriptions, temporary emails have countless practical applications. Freelancers use them to create client-specific addresses, journalists use them to protect sources, and privacy-conscious individuals use them for virtually every online interaction that doesn't require a permanent connection.</p>
                
                <h3>Implementing Temporary Email in Your Digital Life</h3>
                <p>Integrating temporary emails into your online routine is simple with TempMail Pro. Our one-click generation process creates instant disposable addresses, and our intuitive interface makes managing multiple inboxes effortless. With customizable expiration times and automatic deletion, you maintain complete control over your digital footprint.</p>
                
                <h3>Addressing Common Concerns</h3>
                <p>Many users wonder about the reliability and security of temporary email services. At TempMail Pro, we utilize enterprise-grade security measures including encryption both in transit and at rest. Our service maintains high deliverability rates while ensuring your anonymity through advanced technical safeguards.</p>
                
                <h3>The Future of Email Privacy</h3>
                <p>As digital privacy concerns continue to grow, temporary email solutions will play an increasingly important role in personal cybersecurity. With advancements in AI and machine learning, these services will become even more sophisticated at filtering unwanted messages while maintaining ease of use.</p>
                
                <div className="text-center mt-5">
                  <Link to="/app" className="btn btn-primary btn-lg px-5">
                    <i className="fas fa-envelope me-2"></i>Start Using TempMail Pro Today
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold section-title d-inline-block">Frequently Asked Questions</h2>
            <p className="text-muted">Get answers to common questions about TempMail Pro</p>
          </div>
          
          <FAQSection />
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-5">
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

      {/* Add CSS styles to fix the mismatch */}
      <style>
        {`
          .article-content {
            font-family: 'Poppins', sans-serif;
            line-height: 1.7;
            color: #495057;
          }
          
          .article-content h3 {
            font-weight: 600;
            color: #4361ee;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }
          
          .article-content p {
            margin-bottom: 1.5rem;
            font-size: 1.05rem;
          }
          
          .article-content ul {
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .article-content li {
            margin-bottom: 0.5rem;
            font-size: 1.05rem;
          }
          
          .article-content strong {
            color: #4361ee;
            font-weight: 600;
          }
          
          /* Ensure consistency with existing styles */
          .section-title {
            position: relative;
            padding-bottom: 15px;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: #4361ee;
            border-radius: 2px;
          }
          
          .brand-highlight {
            color: #f72585;
          }
          
          .hero-section {
            background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
            color: white;
            padding: 100px 0;
          }
          
          .cta-button {
            background-color: #f72585;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            background-color: #e51276;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .feature-icon {
            width: 70px;
            height: 70px;
            background: rgba(67, 97, 238, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 28px;
            color: #4361ee;
          }
          
          .feature-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
          }
          
          .feature-card:hover {
            transform: translateY(-5px);
          }
          
          .promo-image {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </div>
  );
};

export default Landing;