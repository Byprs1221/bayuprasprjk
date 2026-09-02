import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount (or when token changes), fetch the current user to validate the session.
  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { user } = await authApi.me(token);
        if (active) setUser(user);
      } catch {
        // Token invalid/expired — clear it.
        if (active) {
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user } = await authApi.login(credentials);
    persistSession(token, user);
    return user;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const { token, user } = await authApi.register(payload);
    persistSession(token, user);
    return user;
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
