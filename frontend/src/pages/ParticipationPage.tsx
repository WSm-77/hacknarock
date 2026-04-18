/**
 * Participation Page - Public Link View
 * 
 * Public page sent to participants via link.
 * High-friction interface for expressing interest in time slots.
 * Shows real-time progress toward interest threshold.
 */

export function ParticipationPage() {
  return (
    <div className="participation-page">
      <div className="participation-header">
        <h1>Meeting Interest Poll</h1>
        <p>Vote on your preferred time slots</p>
      </div>

      <div className="participation-container">
        {/* Poll Info Card */}
        <section className="poll-info">
          <div className="info-card">
            <h2>Meeting Details</h2>
            <div className="info-details">
              <div className="info-row">
                <span className="label">Title:</span>
                <span className="value">Awaiting meeting details...</span>
              </div>
              <div className="info-row">
                <span className="label">Organizer:</span>
                <span className="value">Awaiting organizer info...</span>
              </div>
              <div className="info-row">
                <span className="label">Duration:</span>
                <span className="value">Awaiting duration...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Participant Identity */}
        <section className="participant-section">
          <h2>Your Information</h2>
          <div className="form-group">
            <label htmlFor="participant-name">Name *</label>
            <input
              id="participant-name"
              type="text"
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="participant-email">Email (optional)</label>
            <input
              id="participant-email"
              type="email"
              placeholder="your@email.com"
            />
          </div>
        </section>

        {/* Interest Grid */}
        <section className="interest-section">
          <h2>Available Time Slots</h2>
          <p className="section-description">Click on slots you're interested in</p>
          
          <div className="slots-grid">
            <div className="empty-state">
              No time slots available yet. Check back after the organizer publishes availability.
            </div>
          </div>
        </section>

        {/* Progress Indicator */}
        <section className="progress-section">
          <h3>Poll Progress</h3>
          <div className="progress-card">
            <p className="progress-label">Interest toward confirmation</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <p className="progress-text">0 / ? participants interested</p>
          </div>
        </section>

        {/* Submit */}
        <div className="participation-actions">
          <button className="primary-btn">Submit My Votes</button>
        </div>
      </div>
    </div>
  );
}
