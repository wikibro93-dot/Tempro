// src/components/Inbox.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Inbox({ messages, onRetry }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [messageContent, setMessageContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(null);

  useEffect(() => {
    if (selectedMsg) {
      fetchMessageContent(selectedMsg);
    }
  }, [selectedMsg]);

  const fetchMessageContent = async (msg) => {
    setLoadingContent(true);
    setContentError(null);
    
    try {
      const res = await axios.get(`${API_BASE}/inbox/content/${msg.token}/${msg.id}`);
      setMessageContent(res.data);
    } catch (err) {
      setContentError(err.message);
      setMessageContent({
        text: 'Failed to load content: ' + err.message,
        html: '<p>Failed to load content. Please try again.</p>',
      });
    } finally {
      setLoadingContent(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  // If there's an error in the parent component, show error state
  if (messages === null) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <h5 className="text-danger">Failed to load inbox</h5>
          <p className="text-muted">Could not retrieve your messages</p>
          {onRetry && (
            <button 
              className="btn btn-primary mt-3"
              onClick={onRetry}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="text-muted mb-3">
            <i className="bi bi-inbox fs-1"></i>
          </div>
          <h5 className="text-muted">Your inbox is empty</h5>
          <p className="text-muted">Emails will appear here automatically</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Inbox ({messages.length})</h5>
          {onRetry && (
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={onRetry}
              title="Refresh inbox"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
        </div>
        <div className="list-group list-group-flush">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="list-group-item list-group-item-action py-3"
              onClick={() => setSelectedMsg(msg)}
              style={{ cursor: 'pointer' }}
            >
              {/* Custom message-item layout */}
              <div className="message-item d-flex align-items-center">
                <div className="message-icon me-3 d-flex justify-content-center align-items-center bg-primary text-white rounded-circle" style={{ width: 40, height: 40 }}>
                  {msg.from?.address ? msg.from.address[0].toUpperCase() : '?'}
                </div>
                <div className="message-content flex-grow-1">
                  <div className="message-subject fw-bold text-truncate">
                    {msg.subject || '(No Subject)'}
                  </div>
                  <div className="message-preview text-muted small text-truncate">
                    From: {msg.from?.address || msg.from || 'Unknown sender'}
                  </div>
                  <div className="message-meta text-muted small">
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMsg && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          onClick={() => setSelectedMsg(null)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedMsg.subject || '(No Subject)'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMsg(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <p>
                    <strong>From:</strong>{' '}
                    {selectedMsg.from?.address || selectedMsg.from || 'Unknown'}
                  </p>
                  <p>
                    <strong>To:</strong>{' '}
                    {selectedMsg.to?.[0]?.address ||
                      selectedMsg.to ||
                      'Unknown'}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedMsg.createdAt)}
                  </p>
                </div>

                <div className="border-top pt-3">
                  {loadingContent ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p>Loading message content...</p>
                    </div>
                  ) : contentError ? (
                    <div className="alert alert-danger">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Error loading content: {contentError}</span>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => fetchMessageContent(selectedMsg)}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>Retry
                        </button>
                      </div>
                    </div>
                  ) : messageContent?.html ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: messageContent.html }}
                    />
                  ) : (
                    <pre className="email-content bg-light p-3 rounded">
                      {messageContent?.text || 'No message content'}
                    </pre>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedMsg(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}