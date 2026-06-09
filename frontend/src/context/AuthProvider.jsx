import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { ROLES } from '../utils/roles';
import { safeParseJSON } from '../utils/authStorage';

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => safeParseJSON(localStorage.getItem('user')));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const login = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    setUser(nextUser);
  };

  const value = useMemo(() => {
    const role = user?.role;
    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      role,
      isAdmin: role === ROLES.ADMIN,
      isFaculty: role === ROLES.FACULTY,
      isStudent: role === ROLES.STUDENT,
      login,
      logout,
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

