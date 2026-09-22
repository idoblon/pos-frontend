import { Component } from "react";

/**
 * Catches render-time crashes anywhere in the tree and shows a recoverable
 * fallback instead of a blank page.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only a console.error here is intentional: it is the standard
    // React error-reporting hook, not debug logging.
    console.error("Unhandled UI error:", error, errorInfo?.componentStack);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans','Inter',sans-serif",
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: "#6b7280", marginBottom: 20 }}>
              An unexpected error occurred. Reloading the page will usually fix it.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: "#059669",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
