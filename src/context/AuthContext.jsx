import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hs_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('hs_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('hs_token', token); else localStorage.removeItem('hs_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('hs_user', JSON.stringify(user)); else localStorage.removeItem('hs_user');
  }, [user]);

  // Listen for token expiration events from API interceptor
  useEffect(() => {
    const handleTokenExpired = () => {
      setToken('');
      setUser(null);
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    return () => window.removeEventListener('auth:token-expired', handleTokenExpired);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login: ({ token: t, user: u }) => {
      setToken(t);
      setUser(u);
    },
    logout: () => {
      setToken('');
      setUser(null);
    }
  }), [token, user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
