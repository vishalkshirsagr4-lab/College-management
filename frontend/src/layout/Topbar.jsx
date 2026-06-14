import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, LogOut, User, Menu, ChevronDown } from "lucide-react";

export default function Topbar({ onMenu, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role?.toLowerCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left: Mobile Menu & Breadcrumb hint */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dashboard</span>
            <span className="text-sm font-semibold text-slate-900 capitalize">{userRole} Portal</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-all">
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <Link
            to={userRole === "admin" ? "/admin" : `/${userRole}/profile`}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700">
              {user?.name || "My Profile"}
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}