import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Component error caught by boundary:", error);
    console.error("Component stack trace:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary" style={{
          padding: '20px',
          margin: '20px 0',
          backgroundColor: '#fff5f5',
          border: '1px solid #fcc',
          borderRadius: '4px'
        }}>
          <h3 style={{ color: '#d32f2f' }}>Something went wrong</h3>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>View component stack trace</summary>
            {this.state.errorInfo?.componentStack}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 