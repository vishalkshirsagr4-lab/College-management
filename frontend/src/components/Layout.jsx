import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';

const Layout = () => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('dashboard-theme') === 'dark';
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('dashboard-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar role={user?.role} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className="page-shell">
        <Topbar
          onMenuClick={() => setDrawerOpen(true)}
          onLogout={handleLogout}
          user={user}
          onToggleTheme={() => setIsDarkMode((current) => !current)}
          isDarkMode={isDarkMode}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
