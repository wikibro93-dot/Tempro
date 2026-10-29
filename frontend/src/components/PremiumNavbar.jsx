import React from 'react';
import AppIcon from './AppIcon';

const PremiumNavbar = () => {
  return (
    <nav className="premium-navbar">
      <div className="nav-container">
        <div className="logo-brand">
          <div className="logo-icon">
            <AppIcon iconClass="fas fa-envelope" />
          </div>
          <div className="logo-text">Temp<span>Mail</span> Pro</div>
        </div>
        
        <div className="nav-menu">
          <div className="nav-links">
            <a href="#"><AppIcon iconClass="fas fa-home" /> Home</a>
            <a href="#"><AppIcon iconClass="fas fa-inbox" /> Inbox</a>
            <a href="#"><AppIcon iconClass="fas fa-history" /> History</a>
            <a href="#"><AppIcon iconClass="fas fa-cog" /> Settings</a>
          </div>
          
          <div className="nav-actions">
            <button className="upgrade-btn">
              <AppIcon iconClass="fas fa-crown" />
              <span>Upgrade to Premium</span>
            </button>
            
            <div className="user-profile">
              <div className="avatar">JD</div>
              <div className="username">John Doe</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PremiumNavbar;
