import React, { useState, useEffect } from 'react';
import AppIcon from './AppIcon';

const EmailCard = ({ email, expiration, isActive = false, onDelete, onSwitch, onRenew }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Calculate time remaining and check if expired
  useEffect(() => {
    if (!expiration) return;

    const updateTimeState = () => {
      const now = new Date();
      const exp = new Date(expiration);
      const diffMs = exp - now;
      
      if (diffMs <= 0) {
        setIsExpired(true);
        setTimeRemaining("Expired");
        setProgressPercentage(100);
        return;
      }
      
      setIsExpired(false);
      
      // Calculate time components
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      
      if (diffHrs > 0) {
        setTimeRemaining(`${diffHrs}h ${diffMins % 60}m`);
      } else if (diffMins > 0) {
        setTimeRemaining(`${diffMins}m ${diffSecs}s`);
      } else {
        setTimeRemaining(`${diffSecs}s`);
      }
      
      // Calculate progress percentage (for 10-minute emails)
      const totalDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
      const elapsed = totalDuration - diffMs;
      const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgressPercentage(percentage);
    };

    // Update immediately
    updateTimeState();

    // Update every second for real-time countdown
    const intervalId = setInterval(updateTimeState, 1000);
    
    return () => clearInterval(intervalId);
  }, [expiration]);

  return (
    <div className={`card ${isActive ? 'border-primary' : ''} ${isExpired ? 'border-danger' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="card-title">{email}</h6>
          {isActive && (
            <span className={`badge ${isExpired ? 'bg-danger' : 'bg-success'}`}>
              {isExpired ? 'Expired' : 'Active'}
            </span>
          )}
        </div>
        
        {expiration && (
          <div className="mt-2">
            <div className="d-flex justify-content-between align-items-center">
              <small className={isExpired ? 'text-danger' : 'text-muted'}>
                {isExpired ? 'Expired' : 'Expires:'}
              </small>
              <small className={isExpired ? 'text-danger fw-bold' : 'text-muted'}>
                {timeRemaining}
              </small>
            </div>
            {!isExpired && (
              <div className="progress mt-1" style={{ height: '3px' }}>
                <div 
                  className={`progress-bar ${progressPercentage > 90 ? 'bg-danger' : progressPercentage > 70 ? 'bg-warning' : 'bg-info'}`}
                  role="progressbar" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        
        <div className="d-flex gap-2 mt-3">
          {isActive && isExpired && onRenew && (
            <button 
              className="btn btn-sm btn-success"
              onClick={onRenew}
            >
              <AppIcon iconClass="fas fa-sync-alt me-1" /> Renew
            </button>
          )}
          
          {!isActive && onSwitch && !isExpired && (
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={onSwitch}
            >
              <AppIcon iconClass="fas fa-exchange-alt me-1" /> Switch
            </button>
          )}
          
          {onDelete && (
            <button 
              className="btn btn-sm btn-outline-danger ms-auto"
              onClick={onDelete}
            >
              <AppIcon iconClass="fas fa-trash-alt me-1" /> Delete
            </button>
          )}
        </div>

        {isExpired && (
          <div className="mt-2">
            <small className="text-muted">
              This temporary email has expired and can no longer receive messages.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailCard;