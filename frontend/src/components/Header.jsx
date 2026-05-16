import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-inner">

        <div className="logo" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
          Flash<span>Learn</span>
        </div>

        <nav className="nav-links">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={{ color: isActive('/dashboard') ? 'var(--blue)' : undefined,
                         fontWeight: isActive('/dashboard') ? 700 : undefined }}
              >
                Dashboard
              </Link>
              <Link
                to="/decks"
                style={{ color: isActive('/decks') ? 'var(--blue)' : undefined,
                         fontWeight: isActive('/decks') ? 700 : undefined }}
              >
                Decks
              </Link>
              <Link
                to="/analytics"
                style={{ color: isActive('/analytics') ? 'var(--blue)' : undefined,
                         fontWeight: isActive('/analytics') ? 700 : undefined }}
              >
                Analytics
              </Link>
              <div style={styles.userChip}>
                {user?.email?.split('@')[0]}
              </div>
              <button className="btn btn-outline" onClick={logout} style={{ marginLeft: 4 }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ marginLeft: 8 }}>
                Log in
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Get started free
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}

const styles = {
  userChip: {
    background: 'var(--blue-light)',
    color: 'var(--blue)',
    fontSize: 13,
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: 999,
    marginLeft: 8,
    fontFamily: 'DM Sans, sans-serif',
  },
};
