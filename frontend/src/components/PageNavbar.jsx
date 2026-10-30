import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppIcon from "./AppIcon";
import PWAInstallButton from "./PWAInstallButton";

const PageNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home", icon: "fas fa-home" },
    { to: "/app", label: "Use App", icon: "fas fa-bolt" },
    { to: "/privacy-stack", label: "Privacy Stack", icon: "fas fa-layer-group" },
    { to: "/blog", label: "Blog", icon: "fas fa-newspaper" },
    { to: "/about", label: "About", icon: "fas fa-info-circle" },
    { to: "/privacy", label: "Privacy", icon: "fas fa-shield-alt" },
  ];

  return (
    <nav className="page-navbar">
      <div className="page-navbar__inner">
        {/* Brand */}
        <Link to="/" className="page-navbar__brand">
          <span className="page-navbar__logo-icon">
            <AppIcon iconClass="fas fa-shield-alt" />
          </span>
          <span className="page-navbar__brand-text">
            TempMail<span className="page-navbar__brand-accent">Pro</span>
          </span>
        </Link>

        {/* Hamburger */}
        <div className="d-flex align-items-center gap-2 d-md-none">
          <button
            className={`page-navbar__toggler${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Menu */}
        <div className={`page-navbar__menu${menuOpen ? " is-open" : ""}`}>
          <ul className="page-navbar__nav">
            {links.map(({ to, label, icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`page-navbar__link${pathname === to ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <AppIcon iconClass={`${icon} me-1`} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-2 ms-md-2">
            <PWAInstallButton variant="navbar" label="Install App" />
            <Link to="/app" className="page-navbar__cta" onClick={() => setMenuOpen(false)}>
              <AppIcon iconClass="fas fa-envelope" /> Get Free Email
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PageNavbar;
