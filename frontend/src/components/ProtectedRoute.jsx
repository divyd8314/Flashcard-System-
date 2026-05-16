import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={styles.wrap}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // replace: prevents back button returning to protected page
    return <Navigate to="/login" replace />;
  }

  return children;
}

const spinStyle = document.createElement('style');
spinStyle.innerHTML = `@keyframes fl-spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

const styles = {
  wrap: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface)',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid var(--border)',
    borderTop: '3px solid var(--blue)',
    borderRadius: '50%',
    animation: 'fl-spin 0.8s linear infinite',
  },
};
