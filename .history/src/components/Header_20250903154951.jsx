import React from "react";

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="text-center mb-5 position-relative pt-5 pt-md-0">
      <button
        onClick={toggleDarkMode}
        className="theme-toggle-btn position-absolute top-0 end-0 mt-3 me-3"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
      </button>

      <h1 className="fw-bold display-5">TempMail Pro</h1>
      <p className="text-muted lead">Disposable Email Service</p>
    </header>
  );
};

export default Header;