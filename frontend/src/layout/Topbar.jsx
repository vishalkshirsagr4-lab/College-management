import { useState } from "react";

const Topbar = ({
  onMenuClick,
  onLogout,
  user,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="text-xl text-slate-700 hover:text-blue-600 transition-colors"
            title="Toggle sidebar"
          >
            ☰
          </button>

          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-slate-900">
              CampusHub Portal
            </h1>
            <p className="text-xs text-slate-500">
              Smart College Management
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 shadow-sm flex items-center justify-center">
            🔔
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold"
            >
              {user?.name?.charAt(0) || "U"}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
                <p className="font-semibold">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role}
                </p>

                <button
                  onClick={onLogout}
                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Topbar;