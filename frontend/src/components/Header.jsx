import React from "react";
import { Link } from "react-router-dom";
import AppIcon from "./AppIcon";

const Header = () => {
  return (
    <header className="app-top-header mb-4 pt-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-4 bg-surface border shadow-xs">
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <span className="p-2 rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center">
              <AppIcon iconClass="fas fa-shield-alt" size={18} />
            </span>
            <span className="fs-5 fw-bold text-dark">
              TempMail<span className="text-primary">Pro</span>
            </span>
          </Link>
          <span className="text-muted d-none d-sm-inline">|</span>
          <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-semibold d-none d-sm-inline-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
            <span className="eg-pulse-dot"></span> Live Mail.tm Engine
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
            <AppIcon iconClass="bi bi-house-door" />
            <span className="d-none d-md-inline">Home</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;