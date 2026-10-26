

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
// import { Helmet } from "react-helmet";

// import AccountManager from "./components/AccountManager.jsx";
// import Inbox from "./components/Inbox.jsx";
// import MainPage from "./components/MainPage";
// import FAQSection from "./components/FAQSection";
// import BlogList from "./components/BlogList";
// import BlogPost from "./components/BlogPost";

// import Privacy from "./components/Privacy";  // make sure the file exists
// // const API_BASE = import.meta.env.VITE_API_BASE || "/api";
// const API_BASE = import.meta.env.VITE_API_BASE;

// function AppContent() {
//   const [account, setAccount] = useState(() => {
//     const saved = localStorage.getItem("tempMailAccount");
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [darkMode, setDarkMode] = useState(() => {
//     const saved = localStorage.getItem("darkMode");
//     return saved === "true";
//   });

//   const location = useLocation();
//   const isHomePage = location.pathname === "/";

//   const toggleDarkMode = () => {
//     const newMode = !darkMode;
//     setDarkMode(newMode);
//     localStorage.setItem("darkMode", newMode.toString());
//   };

//   useEffect(() => {
//     document.body.classList.toggle("dark-mode", darkMode);
//   }, [darkMode]);

//   useEffect(() => {
//     if (account) {
//       localStorage.setItem("tempMailAccount", JSON.stringify(account));
//       fetchInbox();
//     }
//   }, [account]);

//   const createNewAccount = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await axios.post(`${API_BASE}/accounts/create`);
//       setAccount(res.data);
//       setMessages([]);
//     } catch (err) {
//       setError({ message: err.response?.data?.error || "Account creation failed" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchInbox = async () => {
//     if (!account?.token) return;
//     try {
//       const res = await axios.get(`${API_BASE}/inbox/${account.token}`);
//       const inboxArray = Array.isArray(res.data) ? res.data : res.data?.messages || [];
//       setMessages(inboxArray);
//       setError(null);
//     } catch (err) {
//       let errorMessage = err.response?.data?.error || "Failed to load inbox";
//       if (errorMessage.includes("expired") || err.response?.status === 401) {
//         errorMessage = "Session expired. Please create a new email address.";
//         localStorage.removeItem("tempMailAccount");
//         setAccount(null);
//       }
//       setError({ message: errorMessage });
//     }
//   };

//   useEffect(() => {
//     if (account) {
//       const interval = setInterval(fetchInbox, 5000);
//       return () => clearInterval(interval);
//     }
//   }, [account]);

//   return (
//     <div className={`container py-4 ${darkMode ? "dark-mode" : ""}`}>
//       {/* Header */}
//       <header className="text-center mb-5 position-relative">
      

//         <button
//           onClick={toggleDarkMode}
//           className={`theme-toggle-btn position-absolute top-0 end-0 mt-3 me-3 ${darkMode ? "sun" : "moon"
//             }`}
//           aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//         >
//           {darkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
//         </button>

//         <h1 className="fw-bold">TempMail Pro</h1>
//         <p className="text-muted">Disposable Email Service</p>
//       </header>

//       {/* Error Handler - only shown on home page */}
//       {isHomePage && error && (
//         <div className="alert alert-danger">
//           <strong>Error:</strong> {error.message}
//           <button className="btn btn-sm btn-warning ms-2" onClick={fetchInbox}>
//             Retry
//           </button>
//         </div>
//       )}

//       <Routes>
//         {/* Home Page Route */}
//         <Route path="/" element={
//           <>
//             {/* TempMail Section - only shown on home page */}
//             {!account ? (
//               <div className="d-flex justify-content-center my-5 py-5">
//                 <button
//                   className="btn btn-primary btn-lg px-5 py-3 fw-bold"
//                   onClick={createNewAccount}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Creating..." : "Create Temporary Email"}
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <AccountManager account={account} refreshInbox={fetchInbox} />
//                 <Inbox
//                   messages={messages.map((msg) => ({
//                     ...msg,
//                     token: account.token,
//                   }))}
//                 />
//               </>
//             )}

//             {/* Other Sections */}
//             <MainPage />
//             <FAQSection />
//             <BlogList />
//           </>
//         } />

//         {/* Blog Post Route */}
//         <Route path="/blog/:slug" element={<BlogPost />} />

//         <Route path="/privacy" element={<Privacy />} />
//       </Routes>

//       {/* <Routes> */}
//       {/* ...your other routes... */}

//       {/* </Routes> */}

//       {/* Footer */}
//       <footer className="mt-5 pt-4 border-top text-center text-muted">
//         <div className="container">
//           <p className="mb-1">
//             &copy; {new Date().getFullYear()} TempMail Pro • Powered by Mail.tm API •
//             <Link to="/privacy" className="ms-2 text-decoration-none">
//               Privacy Policy
//             </Link>
//           </p>
//           <p className="mb-0">Free temporary email service • No registration required</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <Helmet>
//         <title>TempMail Pro - Free Temporary Email Service</title>
//         <meta
//           name="description"
//           content="Get a free disposable email address instantly. Protect your inbox from spam & hackers."
//         />
//         <meta
//           name="keywords"
//           content="temporary email, temp mail, disposable email, burner email"
//         />
//       </Helmet>
//       <AppContent />
//     </Router>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

import AccountManager from "./components/AccountManager.jsx";
import Inbox from "./components/Inbox.jsx";
import MainPage from "./components/MainPage";
import FAQSection from "./components/FAQSection";
import BlogList from "./components/BlogList";
import BlogPost from "./components/BlogPost";
import Privacy from "./components/Privacy";

const API_BASE = import.meta.env.VITE_API_BASE;

function AppContent() {
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem("tempMailAccount");
    return saved ? JSON.parse(saved) : null;
  });
  const [preGeneratedAccounts, setPreGeneratedAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreGenerating, setIsPreGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const preGenerateCount = useRef(0);
  const maxPreGenerate = 3; // Number of accounts to pre-generate

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (account) {
      localStorage.setItem("tempMailAccount", JSON.stringify(account));
      fetchInbox();
    }
  }, [account]);

  // Pre-generate email accounts on app load
  useEffect(() => {
    if (isHomePage && !account && preGeneratedAccounts.length === 0) {
      preGenerateAccounts();
    }
  }, [isHomePage, account]);

  const preGenerateAccounts = async () => {
    if (preGenerateCount.current >= maxPreGenerate) return;
    
    setIsPreGenerating(true);
    try {
      const res = await axios.post(`${API_BASE}/accounts/create`);
      setPreGeneratedAccounts(prev => [...prev, res.data]);
      preGenerateCount.current += 1;
      
      // Continue pre-generating until we reach the max count
      if (preGenerateCount.current < maxPreGenerate) {
        setTimeout(preGenerateAccounts, 500); // Small delay to avoid rate limiting
      }
    } catch (err) {
      console.error("Pre-generation failed:", err);
      // Don't show error to user for pre-generation failures
    } finally {
      setIsPreGenerating(false);
    }
  };

  const createNewAccount = async (usePreGenerated = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let accountData;
      
      if (usePreGenerated && preGeneratedAccounts.length > 0) {
        // Use a pre-generated account
        accountData = preGeneratedAccounts[0];
        setPreGeneratedAccounts(prev => prev.slice(1)); // Remove the used account
        // Immediately start generating a replacement
        setTimeout(preGenerateAccounts, 1000);
      } else {
        // Create a new account
        const res = await axios.post(`${API_BASE}/accounts/create`);
        accountData = res.data;
      }
      
      setAccount(accountData);
      setMessages([]);
    } catch (err) {
      setError({ message: err.response?.data?.error || "Account creation failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInbox = async () => {
    if (!account?.token) return;
    try {
      const res = await axios.get(`${API_BASE}/inbox/${account.token}`);
      const inboxArray = Array.isArray(res.data) ? res.data : res.data?.messages || [];
      setMessages(inboxArray);
      setError(null);
    } catch (err) {
      let errorMessage = err.response?.data?.error || "Failed to load inbox";
      if (errorMessage.includes("expired") || err.response?.status === 401) {
        errorMessage = "Session expired. Please create a new email address.";
        localStorage.removeItem("tempMailAccount");
        setAccount(null);
        // Try to use a pre-generated account if available
        if (preGeneratedAccounts.length > 0) {
          setAccount(preGeneratedAccounts[0]);
          setPreGeneratedAccounts(prev => prev.slice(1));
          setTimeout(preGenerateAccounts, 1000);
        }
      }
      setError({ message: errorMessage });
    }
  };

  useEffect(() => {
    if (account) {
      const interval = setInterval(fetchInbox, 5000);
      return () => clearInterval(interval);
    }
  }, [account]);

  return (
    <div className={`container py-4 ${darkMode ? "dark-mode" : ""}`}>
      {/* Header */}
      <header className="text-center mb-5 position-relative">
        <button
          onClick={toggleDarkMode}
          className={`theme-toggle-btn position-absolute top-0 end-0 mt-3 me-3 ${darkMode ? "sun" : "moon"}`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
        </button>

        <h1 className="fw-bold">TempMail Pro</h1>
        <p className="text-muted">Disposable Email Service</p>
      </header>

      {/* Error Handler - only shown on home page */}
      {isHomePage && error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error.message}
          <button className="btn btn-sm btn-warning ms-2" onClick={fetchInbox}>
            Retry
          </button>
        </div>
      )}

      <Routes>
        {/* Home Page Route */}
        <Route path="/" element={
          <>
            {/* TempMail Section - only shown on home page */}
            {!account ? (
              <div className="my-5 py-4">
                <h3 className="text-center mb-4">Choose an Email Address</h3>
                
                {preGeneratedAccounts.length > 0 ? (
                  <div className="row justify-content-center">
                    {preGeneratedAccounts.map((preAccount, index) => (
                      <div key={index} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <h5 className="card-title">{preAccount.email}</h5>
                            <button
                              className="btn btn-primary"
                              onClick={() => createNewAccount(true)}
                              disabled={isLoading}
                            >
                              {isLoading ? "Loading..." : "Use This Email"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="col-12 text-center mt-4">
                      <p className="text-muted">Or generate a new one</p>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => createNewAccount(false)}
                        disabled={isLoading || isPreGenerating}
                      >
                        {isLoading ? "Creating..." : "Generate New Email"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center my-5 py-5">
                    <button
                      className="btn btn-primary btn-lg px-5 py-3 fw-bold"
                      onClick={() => createNewAccount(false)}
                      disabled={isLoading || isPreGenerating}
                    >
                      {isLoading ? "Creating..." : isPreGenerating ? "Preparing emails..." : "Create Temporary Email"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <AccountManager 
                  account={account} 
                  refreshInbox={fetchInbox} 
                  onNewEmail={() => createNewAccount(false)}
                />
                <Inbox
                  messages={messages.map((msg) => ({
                    ...msg,
                    token: account.token,
                  }))}
                />
              </>
            )}

            {/* Other Sections */}
            <MainPage />
            <FAQSection />
            <BlogList />
          </>
        } />

        {/* Blog Post Route */}
        <Route path="/blog/:slug" element={<BlogPost />} />

        <Route path="/privacy" element={<Privacy />} />
      </Routes>

      {/* Footer */}
      <footer className="mt-5 pt-4 border-top text-center text-muted">
        <div className="container">
          <p className="mb-1">
            &copy; {new Date().getFullYear()} TempMail Pro • Powered by Mail.tm API •
            <Link to="/privacy" className="ms-2 text-decoration-none">
              Privacy Policy
            </Link>
          </p>
          <p className="mb-0">Free temporary email service • No registration required</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Helmet>
        <title>TempMail Pro - Free Temporary Email Service</title>
        <meta
          name="description"
          content="Get a free disposable email address instantly. Protect your inbox from spam & hackers."
        />
        <meta
          name="keywords"
          content="temporary email, temp mail, disposable email, burner email"
        />
      </Helmet>
      <AppContent />
    </Router>
  );
}
