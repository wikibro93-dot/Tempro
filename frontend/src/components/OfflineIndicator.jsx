import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import AppIcon from './AppIcon';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="offline-banner position-fixed bottom-0 start-50 translate-middle-x mb-3 px-3 py-2 rounded-pill shadow-lg border d-flex align-items-center gap-2"
      style={{
        zIndex: 10060,
        backgroundColor: '#f59e0b',
        color: '#ffffff',
        fontSize: '0.86rem',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
      }}
      role="status"
      aria-live="polite"
    >
      <span
        className="rounded-circle bg-white"
        style={{ width: '8px', height: '8px', display: 'inline-block', animation: 'spin 1.2s infinite' }}
      ></span>
      <AppIcon iconClass="bi bi-wifi-off me-1" />
      <span>Offline Mode — Cached emails and active address available.</span>
    </div>
  );
};

export default OfflineIndicator;
