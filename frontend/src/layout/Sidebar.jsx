import { useMemo } from 'react';

import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/roles';

const NavItem = ({ to, label, icon, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-slate-700 transition',
          'hover:bg-slate-50 hover:border-border',
          isActive && 'bg-primary/5 text-primary border-primary/20',
        ].join(' ')
      }
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white border border-border group-hover:bg-slate-50">
        {icon}
      </span>
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  );
};

const Icon = ({ children }) => (
  <span className="text-primary/90" aria-hidden="true">
    {children}
  </span>
);

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const role = user?.role;

  const items = useMemo(() => {
    if (role === ROLES.ADMIN) {
      return [
        { to: '/admin', label: 'Dashboard', icon: <Icon>🏛️</Icon> },
        { to: '/admin/students', label: 'Manage Students', icon: <Icon>🎓</Icon> },
        { to: '/admin/faculty', label: 'Manage Faculty', icon: <Icon>🧑‍🏫</Icon> },
        { to: '/admin/assign-faculty', label: 'Assign Faculty', icon: <Icon>🗺️</Icon> },
        { to: '/admin/timetable', label: 'Timetable', icon: <Icon>🗓️</Icon> },
        { to: '/admin/exams', label: 'Exams', icon: <Icon>🧪</Icon> },
        { to: '/admin/notifications', label: 'Notifications', icon: <Icon>🔔</Icon> },
      ];
    }
    if (role === ROLES.FACULTY) {
      return [
        { to: '/faculty', label: 'Dashboard', icon: <Icon>📚</Icon> },
        { to: '/faculty/subjects', label: 'My Subjects', icon: <Icon>📖</Icon> },
        { to: '/faculty/attendance', label: 'Attendance', icon: <Icon>✅</Icon> },
        { to: '/faculty/assignments', label: 'Assignments', icon: <Icon>📝</Icon> },
        { to: '/faculty/marks', label: 'Marks Entry', icon: <Icon>🧾</Icon> },
        { to: '/faculty/exams-syllabus', label: 'Exams + Syllabus', icon: <Icon>📌</Icon> },
        { to: '/faculty/notifications', label: 'Notifications', icon: <Icon>🔔</Icon> },
      ];
    }
    return [
      { to: '/student', label: 'Dashboard', icon: <Icon>🎒</Icon> },
      { to: '/student/attendance', label: 'Attendance', icon: <Icon>📊</Icon> },
      { to: '/student/assignments', label: 'Assignments', icon: <Icon>🗂️</Icon> },
      { to: '/student/timetable', label: 'Timetable', icon: <Icon>🕒</Icon> },
      { to: '/student/exams', label: 'Exams Schedule', icon: <Icon>🗓️</Icon> },
      { to: '/student/results', label: 'Results', icon: <Icon>🏆</Icon> },
      { to: '/student/notifications', label: 'Notifications', icon: <Icon>🔔</Icon> },
    ];
  }, [role]);

  const close = () => setMobileOpen?.(false);

  return (
    <aside
      className={
        [
          'fixed z-40 inset-y-0 left-0 w-72 bg-white border-r border-border',
          'transform transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0 lg:w-72 lg:block',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'sm:hidden',
        ].join(' ')
      }
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary">
              🎓
            </span>
            <span className="hidden lg:inline">College ERP</span>
          </Link>
          <div className="mt-1 text-xs text-slate-500">
            {role ? role.toUpperCase() : ''}
          </div>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {items.map((it) => (
              <NavItem key={it.to} to={it.to} label={it.label} icon={it.icon} onClick={close} />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            to="/profile"
            onClick={close}
            className="group flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white border border-border group-hover:bg-slate-50">
              <span aria-hidden>👤</span>
            </span>
            <span className="hidden lg:inline">Profile</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

