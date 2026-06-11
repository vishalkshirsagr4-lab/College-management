import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onMenu, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="h-14 px-4 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">
              College Management
            </div>
            <div className="text-xs text-slate-500">
              Dashboard
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-md hover:bg-slate-100"
            aria-label="Notifications"
          >
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-slate-900 text-white rounded-full flex items-center justify-center">
              3
            </span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100"
          >
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-700">
              👤
            </span>

            <span className="hidden sm:inline text-sm text-slate-700 font-medium">
              {user?.name || "User"}
            </span>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 text-sm font-medium text-slate-700"
          >
            <span aria-hidden>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </div>
    </header>
  );
}
