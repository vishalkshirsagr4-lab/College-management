import { NavLink } from 'react-router-dom';

const routesByRole = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/teachers', label: 'Teachers', icon: '👩‍🏫' },
    { to: '/admin/students', label: 'Students', icon: '🎓' },
    { to: '/admin/subjects', label: 'Subjects', icon: '📚' },
    { to: '/admin/assign-teacher', label: 'Assign Teacher', icon: '🧑‍🏫' },
    { to: '/admin/attendance', label: 'Attendance', icon: '🗓️' },
    { to: '/admin/assignments', label: 'Assignments', icon: '📝' },
    { to: '/admin/exams', label: 'Exams', icon: '📌' },
    { to: '/admin/results', label: 'Results', icon: '✅' },
    { to: '/admin/fees', label: 'Fees', icon: '💳' },
    { to: '/admin/notices', label: 'Notices', icon: '📢' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ],
  teacher: [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/teacher/subjects', label: 'My Subjects', icon: '📚' },
    { to: '/teacher/attendance', label: 'Attendance', icon: '🗓️' },
    { to: '/teacher/attendance/today', label: "Today's Classes", icon: '🕒' },
    { to: '/teacher/assignments', label: 'Assignments', icon: '📝' },
    { to: '/teacher/exams', label: 'Exams', icon: '📌' },
    { to: '/teacher/results', label: 'Results', icon: '✅' },
    { to: '/teacher/students', label: 'Students', icon: '👥' },
    { to: '/teacher/profile', label: 'Profile', icon: '👤' },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: '📊' },
    { to: '/student/subjects', label: 'Subjects', icon: '📚' },
    { to: '/student/attendance', label: 'Attendance', icon: '🗓️' },
    { to: '/student/assignments', label: 'Assignments', icon: '📝' },
    { to: '/student/results', label: 'Results', icon: '✅' },
    { to: '/student/fees', label: 'Fees', icon: '💳' },
    { to: '/student/notices', label: 'Notices', icon: '📢' },
    { to: '/student/profile', label: 'Profile', icon: '👤' },
  ],
};

const Sidebar = ({ role, open, onClose }) => {
  const navItems = routesByRole[role] || routesByRole.student;

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top">
        <div className="brand-signature">
          <span className="brand-mark">C</span>
          <div>
            <h1>CampusHub</h1>
            <p>College management</p>
          </div>
        </div>
        <button className="icon-button close-button" onClick={onClose} aria-label="Close navigation">
          ×
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Powered by your college backend APIs.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
