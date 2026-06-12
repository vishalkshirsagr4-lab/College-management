import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onMenu, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Standardize the role string to avoid case-sensitivity issues
  const userRole = user?.role?.toLowerCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Dynamically resolve profile routes based on AppRoutes configuration
  const getProfileLink = () => {
    if (userRole === "admin") return "/admin"; // Or /admin/profile if added later
    if (userRole === "faculty") return "/faculty/profile";
    if (userRole === "student") return "/student/profile";
    return "/login"; // Safe fallback
  };

  // Dynamically resolve notification links matching your AppRoutes configuration
  const getNotificationLink = () => {
    if (userRole === "admin") return "/admin/notifications";
    if (userRole === "faculty") return "/faculty/Notification/Feed";
    if (userRole === "student") return "/student/notifications";
    return "/";
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="h-14 px-4 flex items-center justify-between">

        {/* Left Side */}
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
            <div className="text-xs text-slate-500 capitalize">
              {user?.role || "User"} Dashboard
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Dynamic Notifications */}
          <Link
            to={getNotificationLink()}
            className="relative p-2 rounded-md hover:bg-slate-100"
            aria-label="Notifications"
          >
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] text-white rounded-full flex items-center justify-center">
              {/* Optional dynamic notification count */}
            </span>
          </Link>

          {/* Dynamic Profile Link */}
          {user?.role && (
            <Link
              to={getProfileLink()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                {user?.name?.charAt(0) || "👤"}
              </span>

              <span className="hidden sm:inline text-sm text-slate-700 font-medium">
                {user?.name || "User"}
              </span>
            </Link>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
          >
            <span aria-hidden>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </div>
    </header>
  );
}