import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('bb_token') || null);

  const login = useCallback((userData, authToken) => {
    localStorage.setItem('bb_user', JSON.stringify(userData));
    localStorage.setItem('bb_token', authToken);
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bb_user');
    localStorage.removeItem('bb_token');
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = !!token;
  const isProvider = user?.role === 'provider';
  const isSeeker = user?.role === 'seeker';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isProvider, isSeeker, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
