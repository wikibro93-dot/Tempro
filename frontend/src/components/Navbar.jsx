import React from "react";
import AppIcon from "./AppIcon";

const Navbar = ({ emailDuration, setDuration, isNavExpanded, setIsNavExpanded }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded px-3 py-2 border">
      <div className="container-fluid p-0">
        <span className="navbar-brand me-3 small fw-bold">
          <AppIcon iconClass="fas fa-clock me-2" />
          Duration:
        </span>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isNavExpanded ? 'show' : ''}`}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between w-100 gap-2">
            <div className="d-flex flex-wrap gap-2">
              <button 
                className={`btn btn-sm ${emailDuration === "10min" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDuration("10min")}
              >
                10 min
              </button>
              <button 
                className={`btn btn-sm ${emailDuration === "1hour" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDuration("1hour")}
              >
                1 hour
              </button>
              <button 
                className={`btn btn-sm ${emailDuration === "24hour" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDuration("24hour")}
              >
                24 hours
              </button>
              <button 
                className={`btn btn-sm ${emailDuration === "max" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDuration("max")}
              >
                Max Time
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;