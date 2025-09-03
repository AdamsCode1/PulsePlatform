import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log error if needed
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 32, color: 'red', textAlign: 'center' }}>Something went wrong in the dashboard.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
