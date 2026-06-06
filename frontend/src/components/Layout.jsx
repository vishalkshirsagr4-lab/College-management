import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/teachers', label: 'Teachers' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/assign', label: 'Assign Teacher' },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard' },
    { to: '/teacher/attendance', label: 'Attendance' },
    { to: '/teacher/assignments', label: 'Assignments' },
    { to: '/teacher/marks', label: 'Marks' },
  ],
  student: [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/attendance', label: 'Attendance' },
    { to: '/student/assignments', label: 'Assignments' },
    { to: '/student/results', label: 'Results' },
    { to: '/student/fees', label: 'Fees' },
  ],
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navItems[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">College Admin</div>
        <div className="nav-group">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1 className="page-title">Welcome back</h1>
            <p className="page-subtitle">{user?.name} · {user?.role}</p>
          </div>
          <div className="topbar-actions">
            <button className="button button-secondary" onClick={() => { logout(); navigate('/login'); }}>
              Log out
            </button>
          </div>
        </header>
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
