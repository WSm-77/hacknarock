import type { MeetingJoinResponse } from '../../api/meetings';

interface ParticipantAvailabilityClosedStateProps {
  meeting: MeetingJoinResponse;
}

export function ParticipantAvailabilityClosedState({
  meeting,
}: ParticipantAvailabilityClosedStateProps) {
  return (
    <section className="availability-card">
      <header className="availability-header">
        <p className="availability-overline">Meeting finalized</p>
        <h1>Availability collection is closed</h1>
        <p>
          This meeting is no longer accepting availability updates.
        </p>
      </header>

      <div className="availability-grid">
        <article className="availability-row">
          <div className="availability-row__meta">Title</div>
          <p>{meeting.meeting_title}</p>
        </article>
        <article className="availability-row">
          <div className="availability-row__meta">Location</div>
          <p>{meeting.location}</p>
        </article>
        <article className="availability-row">
          <div className="availability-row__meta">Availability deadline</div>
          <p>{new Date(meeting.availability_deadline).toLocaleString()}</p>
        </article>
      </div>

      {meeting.ai_recommendation && (
        <p className="availability-message availability-message--success">
          Recommendation: {meeting.ai_recommendation}
        </p>
      )}
      <p className="availability-message availability-message--warning">
        If you need changes, please contact the organizer directly.
      </p>
    </section>
  );
}

