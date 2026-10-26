import React from "react";

const EmailCard = ({ email, expiration, isActive = false, onDelete, onSwitch }) => {
  const formatTimeRemaining = (expirationDate) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffMs = expiry - now;

    if (diffMs <= 0) return "Expired";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <div className={`card h-100 ${isActive ? 'border-primary' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-title text-truncate flex-grow-1 me-2">{email}</h6>
          {onDelete && (
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={onDelete}
              title="Delete this email"
              aria-label="Delete email"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Expires:</small>
          <small className={expiration && new Date(expiration) < new Date() ? 'text-danger' : 'text-success'}>
            {expiration ? formatTimeRemaining(expiration) : 'Unknown'}
          </small>
        </div>
        {isActive && (
          <div className="badge bg-success w-100">Active Email</div>
        )}
        {!isActive && onSwitch && (
          <button 
            className="btn btn-outline-primary btn-sm w-100 mt-2"
            onClick={onSwitch}
          >
            Switch to this email
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailCard;