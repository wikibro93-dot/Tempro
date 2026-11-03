import React from 'react';

/**
 * Per-message error boundary (Phase A, Nov 2026).
 *
 * The app already has an app-level ErrorBoundary in App.jsx, but a single
 * malformed message body tripping it would replace the whole app view with
 * a generic fallback. Wrapping only the message viewer isolates the failure:
 * the inbox list, header and actions stay usable, and the user gets a
 * message-specific recovery path (plain text or the raw .eml download).
 *
 * Usage: give it a key that changes per message and per view mode
 * (e.g. `${messageId}-${viewMode}`) so switching to plain text, or opening
 * another message, remounts it and clears the error state.
 */
class MessageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MessageErrorBoundary] Message render failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { onShowPlainText, emlUrl } = this.props;
      return (
        <div className="alert alert-warning" role="alert">
          <strong>This message contains malformed markup and could not be displayed.</strong>
          <p className="mb-2 mt-1 small">
            The rest of the app is unaffected. You can still read this message as plain text
            or download the original email file.
          </p>
          <div className="d-flex flex-wrap gap-2">
            {onShowPlainText && (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ minHeight: '44px' }}
                onClick={onShowPlainText}
              >
                View Plain Text
              </button>
            )}
            {emlUrl && (
              <a
                href={emlUrl}
                download
                className="btn btn-sm btn-outline-secondary"
                style={{ minHeight: '44px' }}
              >
                Download .eml
              </a>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default MessageErrorBoundary;
