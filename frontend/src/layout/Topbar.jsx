import { useState } from 'react';

const Topbar = ({ onMenuClick, onLogout, user, onToggleTheme, isDarkMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenuClick} aria-label="Open navigation">
          ☰
        </button>
        <div className="topbar-brand">
          <strong>CampusHub</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-button" title="Notifications">
          🔔
        </button>
        <button className="theme-toggle button-ghost" onClick={onToggleTheme} title="Toggle dark mode">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className="profile-menu">
          <button className="avatar-button" onClick={() => setDropdownOpen((state) => !state)}>
            <span>{user?.name?.slice(0, 1) || 'S'}</span>
          </button>
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="profile-summary">
                <strong>{user?.name || 'Student'}</strong>
                <span>{user?.role || 'student'}</span>
              </div>
              <button className="button button-secondary" onClick={onLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
