import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, LogOut, User, Menu, ChevronDown } from "lucide-react";

export default function Topbar({ onMenu, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role?.toLowerCase();
  
  // State to manage whether the profile menu is open or closed
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        <div className="flex items-center gap-4">
          {/* Notification Button
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-all">
            <Bell className="w-5 h-5" />
          </button> */}

          {/* Profile Section Container */}
          <div className="relative">
            {/* Clickable Profile Trigger Button */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">
                {user?.name || "My Profile"}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu displaying Logged Person's Details */}
            {isProfileOpen && (
              <>
                {/* Invisible backdrop layer to close the dropdown if clicking outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 transform origin-top-right transition-all">
                  
                  {/* User Detailed Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Logged In As</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "User Name"}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || "user@example.com"}</p>
                    
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded">
                      {userRole || "User"}
                    </span>
                  </div>

                  {/* Context Actions List */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to={userRole === "admin" ? "/admin" : `/${userRole}/profile`}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      View Full Profile
                    </Link>

                    <hr className="border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
}