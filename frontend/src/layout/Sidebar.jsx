import { NavLink } from "react-router-dom";

const routesByRole = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/admin/timetable", label: "Timetable", icon: "🗓️" },
    { to: "/admin/teachers", label: "Teachers", icon: "👩‍🏫" },
    { to: "/admin/students", label: "Students", icon: "🎓" },
    { to: "/admin/subjects", label: "Subjects", icon: "📚" },
    { to: "/admin/assign-teacher", label: "Assign Teacher", icon: "🧑‍🏫" },
    { to: "/admin/exams", label: "Exams", icon: "📌" },
    { to: "/admin/results", label: "Results", icon: "✅" },
    { to: "/admin/fees", label: "Fees", icon: "💳" },
    { to: "/admin/notices", label: "Notices", icon: "📢" },
    { to: "/admin/settings", label: "Settings", icon: "⚙️" },
  ],
  teacher: [
    { to: "/teacher/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/teacher/subjects", label: "My Subjects", icon: "📚" },
    { to: "/teacher/timetable", label: "Timetable", icon: "🗓️" },
    { to: "/teacher/attendance", label: "Attendance", icon: "🗓️" },
    { to: "/teacher/attendance/today", label: "Today", icon: "🕒" },
    { to: "/teacher/assignments", label: "Assignments", icon: "📝" },
    { to: "/teacher/results", label: "Results", icon: "📌" },
    { to: "/teacher/students", label: "Students", icon: "👥" },
    { to: "/teacher/profile", label: "Profile", icon: "👤" },
  ],
  student: [
    { to: "/student", label: "Dashboard", icon: "📊" },
    { to: "/student/subjects", label: "Subjects", icon: "📚" },
    { to: "/student/attendance", label: "Attendance", icon: "🗓️" },
    { to: "/student/assignments", label: "Assignments", icon: "📝" },
    { to: "/student/materials", label: "Materials", icon: "📁" },
    { to: "/student/results", label: "Results", icon: "✅" },
    { to: "/student/profile", label: "Profile", icon: "👤" },
  ],
};

const Sidebar = ({ role, open, onClose }) => {
  const navItems = routesByRole[role] || routesByRole.student;

  const slideClasses = open
    ? "translate-x-0"
    : "-translate-x-full";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ${slideClasses} md:static md:block md:w-64 md:min-h-screen md:transform-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
            C
          </div>
          <div>
            <p className="text-xs text-blue-500 tracking-widest">
              CampusHub
            </p>
            <h1 className="text-sm font-semibold">
              College Manager
            </h1>
          </div>
        </div>

        <button
          onClick={onClose}
          className="md:hidden text-gray-500 hover:text-red-500 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 px-5 text-xs text-gray-400">
        Smart Campus Management System
      </div>
    </aside>
  );
};

export default Sidebar;