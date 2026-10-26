import React from "react";

const ErrorAlert = ({ error, setError, onRetry }) => {
  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert" aria-live="polite">
      <strong>Error:</strong> {error.message}
      <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
      {onRetry && (
        <button className="btn btn-sm btn-warning ms-2" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;