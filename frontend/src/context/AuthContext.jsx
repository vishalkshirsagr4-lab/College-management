import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [pendingAuth, setPendingAuth] = useState(() => {
    const stored = localStorage.getItem('pendingAuth');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (pendingAuth) {
      localStorage.setItem('pendingAuth', JSON.stringify(pendingAuth));
    } else {
      localStorage.removeItem('pendingAuth');
    }
  }, [pendingAuth]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.getProfile();
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const setAuthState = ({ user: authUser, token: authToken }) => {
    setUser(authUser);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPendingAuth(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingAuth');
  };

  const startPendingAuth = ({ email, mode }) => {
    const next = { email, mode };
    setPendingAuth(next);
    return next;
  };

  const clearPendingAuth = () => setPendingAuth(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        pendingAuth,
        setAuthState,
        logout,
        startPendingAuth,
        clearPendingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
