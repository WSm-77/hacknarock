/**
 * Header Component
 * 
 * Shared navigation header for all pages.
 * Includes product logo, nav links, and role switcher.
 */

import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/" className="logo">
            <span className="logo-text">HackNaRock</span>
          </Link>
        </div>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/">Calendar</Link>
            </li>
            <li>
              <Link to="/create">Create Meeting</Link>
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
        </div>
      </div>
    </header>
  );
}
