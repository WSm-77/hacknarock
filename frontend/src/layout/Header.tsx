/**
 * Header Component
 *
 * Shared navigation header for all pages.
 * Includes product logo, nav links, and role switcher.
 */

import { Link, useNavigate } from 'react-router-dom';
import { clearAuthSession, logout } from '../api/auth';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Best-effort server revoke; always clear local auth state.
    }

    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/" className="logo">
            <span className="logo-text">SnapSlot</span>
          </Link>
        </div>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/polls">Polls</Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="role-switcher">
            <button className="role-btn organizer-btn active">
              Organizer
            </button>
            <button className="role-btn participant-btn">
              Participant
            </button>
          </div>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
