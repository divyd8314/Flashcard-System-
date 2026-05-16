import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production: send to Sentry, Datadog, etc.
    // Sentry.captureException(error, { extra: info });
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={styles.wrap}>
        <div style={styles.box}>
          <span style={styles.icon}>⚠️</span>
          <h2 style={styles.heading}>Something went wrong</h2>
          <p style={styles.msg}>
            {this.props.message || "An unexpected error occurred. We've been notified."}
          </p>
          <div style={styles.actions}>
            <button className="btn btn-primary" onClick={this.reset}>
              Try again
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </button>
          </div>
          {/* Only show raw error in development */}
          {import.meta.env.DEV && (
            <pre style={styles.devErr}>{this.state.error?.toString()}</pre>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  wrap: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 },
  box: { maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '48px 40px' },
  icon: { fontSize: 40, display: 'block', marginBottom: 16 },
  heading: { fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 10 },
  msg: { fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  devErr: { marginTop: 24, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 11, color: '#dc2626', textAlign: 'left', overflowX: 'auto', fontFamily: 'monospace' },
};
