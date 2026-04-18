/**
 * Dashboard - Home View
 * 
 * High-level overview of all confirmed meetings.
 * Shows status indicators for pending polls vs confirmed meetings.
 * Main entry point for organizers and participants.
 */

export function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Meeting Dashboard</h1>
        <p>Overview of your scheduled meetings</p>
      </div>

      <div className="dashboard-content">
        {/* Status Summary Section */}
        <section className="status-section">
          <h2>Status Overview</h2>
          <div className="status-cards">
            <div className="status-card pending">
              <h3>Pending Polls</h3>
              <p className="status-count">0</p>
              <p className="status-description">Awaiting participant votes</p>
            </div>
            <div className="status-card confirmed">
              <h3>Confirmed Meetings</h3>
              <p className="status-count">0</p>
              <p className="status-description">Finalized meeting slots</p>
            </div>
          </div>
        </section>

        {/* Upcoming Meetings Section */}
        <section className="upcoming-section">
          <h2>Upcoming Confirmed Meetings</h2>
          <div className="meetings-list">
            <p className="empty-state">
              No confirmed meetings yet. Create a new poll to get started.
            </p>
          </div>
        </section>

        {/* Recent Polls Section */}
        <section className="recent-section">
          <h2>Recent Polls</h2>
          <div className="polls-list">
            <p className="empty-state">
              No active polls. Create a new meeting poll to begin.
            </p>
          </div>
        </section>

        {/* Primary CTA */}
        <section className="cta-section">
          <button className="primary-cta">
            + Create New Meeting Poll
          </button>
        </section>
      </div>
    </div>
  );
}
