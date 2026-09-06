import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AiroErrorBoundaryProps {
  children: ReactNode;
  captureGlobalErrors?: boolean;
}

interface State {
  error: Error | null;
}

/**
 * Production-safe error boundary. The exported project previously used a passthrough
 * component, so a render crash could leave the Capacitor WebView completely white.
 */
export default class AiroErrorBoundary extends Component<AiroErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sodafom render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#fff', color: '#111', padding: 20, fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#b91c1c', fontSize: 22, fontWeight: 700 }}>Sodafom could not start</h1>
          <p style={{ marginTop: 12 }}>A startup error was caught instead of showing a blank white screen.</p>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.message}</pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 18, padding: '10px 16px', border: 0, borderRadius: 8, background: '#0284c7', color: '#fff', fontWeight: 700 }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}
