import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const Layout = () => {
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900 overflow-x-hidden">
      <Sidebar
        role={user?.role}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full">
        {/* Overlay (mobile only) */}
        <div
          className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity md:hidden ${
            drawerOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Topbar */}
        <Topbar
          onMenuClick={() => setDrawerOpen(true)}
          onLogout={handleLogout}
          user={user}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
