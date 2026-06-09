import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/roles';

const roleToAllowed = (role) => {
  if (!role) return null;
  if (role === ROLES.ADMIN) return [ROLES.ADMIN];
  if (role === ROLES.FACULTY) return [ROLES.FACULTY];
  if (role === ROLES.STUDENT) return [ROLES.STUDENT];
  return null;
};

export default function RequireAuth({ role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowed = roleToAllowed(role);
  if (allowed && user?.role && !allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

