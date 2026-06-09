import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

export default function Topbar({ onMenu, user }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border bg-white hover:bg-slate-50"
            onClick={onMenu}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <div>
            <div className="text-sm font-semibold text-slate-900">College Management</div>
            <div className="text-xs text-slate-500">SaaS ERP Dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-md border border-border bg-white hover:bg-slate-50"
            aria-label="Notifications"
          >
            🔔
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
              3
            </span>
          </Link>

          <Link
            to="/profile"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-white hover:bg-slate-50 px-3 py-2"
          >
            <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              👤
            </span>
            <span className="hidden sm:inline text-sm font-medium text-slate-800">{user?.name || 'User'}</span>
          </Link>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </header>
  );
}

