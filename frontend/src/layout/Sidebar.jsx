import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const NavItem = ({ to, label, icon, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
          "hover:bg-slate-100",
          isActive ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600",
        ].join(" ")
      }
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const role = user?.role;
  const close = () => setMobileOpen(false);

  const items = useMemo(() => {
    if (role === ROLES.ADMIN) {
      return [
        { to: "/admin", label: "Dashboard", icon: "🏛️" },
        { to: "/admin/students", label: "Students", icon: "🎓" },
        { to: "/admin/faculty", label: "Faculty", icon: "🧑‍🏫" },
        { to: "/admin/subjects", label: "Subjects", icon: "📖" },
        { to: "/admin/timetable", label: "Timetable", icon: "🗓️" },
        { to: "/admin/exams", label: "Exams", icon: "🧪" },
        { to: "/admin/notifications", label: "Notifications", icon: "🔔" },
      ];
    }
    if (role === ROLES.FACULTY) {
      return [
        { to: "/faculty", label: "Dashboard", icon: "📚" },
        { to: "/faculty/students", label: "Students", icon: "👥" },
        { to: "/faculty/attendance", label: "Attendance", icon: "✅" },
        { to: "/faculty/assignments", label: "Assignments", icon: "📝" },
        { to: "/faculty/marks", label: "Marks", icon: "🧾" },
        { to: "/faculty/Timetable", label: "Time Table", icon: "📅" },
        { to: "/faculty/Notification", label: "Notification", icon: "🔔" },
      ];
    }
    return [
      { to: "/student", label: "Dashboard", icon: "🎒" },
      { to: "/student/attendance", label: "Attendance", icon: "📊" },
      { to: "/student/assignment", label: "Assignment", icon: "📝" },
      { to: "/student/exams", label: "Exams", icon: "🗓️" },
      { to: "/student/Timetable", label: "Time Table", icon: "📅" },
      { to: "/student/results", label: "Results", icon: "🏆" },
    ];
  }, [role]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={close}
        />
      )}

      {/* 1. Added 'h-screen' to lock to viewport height.
        2. Added 'flex flex-col' to manage children vertically.
      */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-200 flex flex-col h-screen
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:h-screen`}
      >
        {/* Header - Fixed height */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 flex-none">
          <Link to="/admin" className="font-semibold text-slate-900" onClick={close}>
            🎓 College ERP
          </Link>
        </div>

        {/* Nav - Scrollable area if content exceeds screen */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => (
            <NavItem key={item.to} {...item} onClick={close} />
          ))}
        </nav>

       {/* { Profile - Footer area, not absolute anymore to prevent overflow
        <div className="p-3 border-t border-slate-200 flex-none">
          <Link
            to="/profile"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <span>👤</span>
            <span>Profile</span>
          </Link>
        </div>} */}
      </aside>
    </>
  );
}