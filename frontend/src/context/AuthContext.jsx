import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromStorage, setUserInStorage, clearUserFromStorage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /*
    STARTUP — restore session from localStorage.
    Runs once when the app first loads.
    Critical: while this is running, isLoading = true.
    ProtectedRoute waits for this before deciding to
    redirect or render the page.
  */
  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored?.id && stored?.email) {
      setUser(stored);
    }
    // Always set isLoading false — if we forget this,
    // the entire app stays on a spinner permanently.
    setIsLoading(false);
  }, []);

  /*
    login() — called from Login.jsx after successful API response.
    Receives the user object from the backend response.
  */
  const login = useCallback((userData) => {
    const user = { id: userData.user_id, email: userData.email };
    setUserInStorage(user);   // persist to localStorage
    setUser(user);            // update React state → triggers re-render
    navigate('/dashboard');
  }, [navigate]);

  /*
    logout() — clears everything.
    Called from Header when user clicks "Log out".
  */
  const logout = useCallback(() => {
    clearUserFromStorage();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
