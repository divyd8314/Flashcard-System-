import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();         // prevent browser page reload
    setError('');
    setSubmitting(true);

    try {
      /*
        POST /api/users/login
        Returns: { message: "login successful", user_id: 1, email: "..." }
      */
      const res = await authAPI.login(email, password);

      /*
        login() from AuthContext:
        - stores user in localStorage
        - sets user in React state
        - navigates to /dashboard
      */
      login(res.data);

    } catch (err) {
      /*
        FastAPI sends errors as: { detail: "Invalid credentials" }
        err.response.data.detail is the message from your backend.
      */
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div className="logo" style={{ marginBottom: 24, cursor: 'default' }}>
          Flash<span style={{ color: 'var(--text)' }}>Learn</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Log in to continue studying</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, borderColor: error ? '#ef4444' : 'var(--border)' }}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Inline error from backend */}
          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 4, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>

        </form>

        <p style={styles.switch}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--surface)' },
  card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  heading: { fontSize: 28, fontWeight: 800, marginBottom: 6 },
  sub: { fontSize: 15, color: 'var(--muted)', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  input: { padding: '11px 14px', fontSize: 15, border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--text)', background: '#fff', transition: 'border-color .2s' },
  error: { fontSize: 13, color: '#ef4444', fontWeight: 500, marginTop: -8 },
  switch: { textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 24 },
};
