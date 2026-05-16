/*
  ============================================================
  Layout.jsx
  ============================================================

  The shared shell that wraps every page in the app.
  React Router renders this once and swaps the inner page
  content via <Outlet /> when the route changes.

  Key concepts:
  ─────────────────────────────────────────────────────────
  • <Outlet />  → a React Router placeholder. When you visit
                  /dashboard, React Router renders Layout
                  and replaces <Outlet /> with <Dashboard />.
                  This way Header renders once, not in every page.

  • useLocation() → gives us the current URL path. We use it
                    to decide which nav style to show.

  • isLoggedIn    → right now this is hardcoded to false.
                    In Phase 2 (auth), we'll replace this with
                    a real check (e.g. !!localStorage.getItem('token'))
                    or a value from an AuthContext.

  • onLogout      → also a placeholder. In Phase 2 this will
                    clear the token and redirect to /login.

  Route structure reminder (from App.jsx):
    /            → LandingPage
    /login       → Login
    /signup      → Signup
    /dashboard   → Dashboard  (will be protected)
    /analytics   → Analytics  (will be protected)
    /decks       → Decks      (will be protected)
  ============================================================
*/

import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';

export default function Layout() {
  const location = useLocation();

  /*
    Determine auth state.
    TODO (Phase 2): replace this with real token check, e.g.:
      const isLoggedIn = !!localStorage.getItem('access_token');
  */
  const isLoggedIn = false;

  /*
    Placeholder logout handler.
    TODO (Phase 2): clear token + navigate to /login
  */
  const handleLogout = () => {
    console.log('Logout clicked — implement in Phase 2');
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      {/*
        <Outlet /> renders the matched child route component.
        E.g. visiting /dashboard renders <Dashboard /> here.
      */}
      <Outlet />
    </>
  );
}
