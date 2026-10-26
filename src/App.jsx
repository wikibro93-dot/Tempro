import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import ScrollToTop from "./components/ScrollToTop";
import Landing from "./components/Landing.jsx";
import OfflineIndicator from "./components/OfflineIndicator";

const TempMailApp = lazy(() => import("./components/TempMailApp.jsx"));
const PromoCard = lazy(() => import("./components/PromoCard.jsx"));
const BlogList = lazy(() => import("./components/BlogList"));
const BlogPost = lazy(() => import("./components/BlogPost"));
const Privacy = lazy(() => import("./components/Privacy"));
const PrivacyStack = lazy(() => import("./components/PrivacyStack"));
const About = lazy(() => import("./components/About.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PROMO_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function isPromoSuppressed() {
  const dismissedAtRaw = localStorage.getItem("promoDismissedAt");
  const legacyClosed = localStorage.getItem("promoClosed") === "true";

  if (!dismissedAtRaw && legacyClosed) {
    localStorage.setItem("promoDismissedAt", String(Date.now()));
    localStorage.removeItem("promoClosed");
    return true;
  }

  if (!dismissedAtRaw) {
    return false;
  }

  const dismissedAt = Number(dismissedAtRaw);
  if (Number.isNaN(dismissedAt)) {
    localStorage.removeItem("promoDismissedAt");
    return false;
  }

  return Date.now() - dismissedAt < PROMO_COOLDOWN_MS;
}

function AppContent() {
  const location = useLocation();
  const [showPromoCard, setShowPromoCard] = useState(false);
  const [promoSuppressed, setPromoSuppressed] = useState(() => isPromoSuppressed());
  const shouldAutoShowPromo = location.pathname !== "/app";

  const promotablePage = ["/", "/blog"].includes(location.pathname) ||
    location.pathname.startsWith("/blog/") ||
    location.pathname === "/app";

  useEffect(() => {
    if (!promoSuppressed) {
      return;
    }

    if (!isPromoSuppressed()) {
      setPromoSuppressed(false);
      localStorage.removeItem("promoDismissedAt");
    }
  }, [location.pathname, promoSuppressed]);

  useEffect(() => {
    if (!promotablePage || promoSuppressed || !shouldAutoShowPromo) {
      return undefined;
    }

    const timer = setTimeout(() => setShowPromoCard(true), 7000);
    return () => clearTimeout(timer);
  }, [promotablePage, promoSuppressed, shouldAutoShowPromo]);

  const handlePromoClose = () => {
    setShowPromoCard(false);
    setPromoSuppressed(true);
    localStorage.setItem("promoDismissedAt", String(Date.now()));
  };

  const handleEmailCopied = () => {
    if (!promoSuppressed) {
      setShowPromoCard(true);
    }
  };

  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="container py-5">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
              <div className="spinner-border text-primary" role="status" aria-label="Loading page">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<TempMailApp onEmailCopied={handleEmailCopied} />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog" element={<BlogList showSEO={true} />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-stack" element={<PrivacyStack />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <OfflineIndicator />
      <Suspense fallback={null}>
        <PromoCard
          visible={showPromoCard && !promoSuppressed && promotablePage}
          onClose={handlePromoClose}
        />
      </Suspense>
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-5">
          <div className="alert alert-danger">
            <h2>Something went wrong.</h2>
            <p>{this.state.error?.message || "An unexpected error occurred"}</p>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App component without useLocation
function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
