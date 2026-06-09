import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh bg-white text-slate-800">
      <div className="lg:flex">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/30 sm:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex-1 lg:ml-72">
          <Topbar onMenu={() => setMobileOpen(true)} user={user} />

          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

