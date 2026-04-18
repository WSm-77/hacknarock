/**
 * Meeting Creation Wizard - Organizer Only
 * 
 * Multi-step form where organizers:
 * - Set meeting title, duration, description
 * - Paint available time slots on calendar
 * - Configure algorithm settings (interest threshold, expiration date)
 * - Toggle venue search and email draft generation
 */

export function MeetingCreationWizard() {
  return (
    <div className="wizard-page">
      <div className="wizard-header">
        <h1>Create New Meeting Poll</h1>
        <p>Set up availability and meeting parameters</p>
      </div>

      <div className="wizard-container">
        {/* Step Indicator */}
        <div className="wizard-steps">
          <div className="step active">
            <span className="step-number">1</span>
            <span className="step-label">Meeting Details</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span className="step-label">Availability</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-label">Settings</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span className="step-label">Review & Publish</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="wizard-form">
          {/* Step 1: Meeting Details */}
          <section className="form-section">
            <h2>Meeting Details</h2>
            
            <div className="form-group">
              <label htmlFor="meeting-title">Meeting Title *</label>
              <input
                id="meeting-title"
                type="text"
                placeholder="e.g., Q2 Planning Session"
              />
            </div>

            <div className="form-group">
              <label htmlFor="meeting-duration">Duration *</label>
              <select id="meeting-duration">
                <option value="">Select duration</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="meeting-description">Description</label>
              <textarea
                id="meeting-description"
                placeholder="Add any context or agenda items..."
              />
            </div>
          </section>

          {/* Navigation */}
          <div className="form-actions">
            <button className="secondary-btn">Cancel</button>
            <button className="primary-btn">Next: Add Availability</button>
          </div>
        </div>
      </div>
    </div>
  );
}
