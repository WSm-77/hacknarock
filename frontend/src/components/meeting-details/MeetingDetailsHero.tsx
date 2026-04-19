import type { MeetingDetailsData } from './types';

interface MeetingDetailsHeroProps {
  details?: MeetingDetailsData | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}

function formatDeadline(deadline?: string): string {
  if (!deadline) {
    return 'Unknown deadline';
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return deadline;
  }

  return parsed.toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function MeetingDetailsHero({ details, isLoading, errorMessage }: MeetingDetailsHeroProps) {
  const firstBlock = details?.proposed_blocks[0];
  const isCollectingAvailability = details?.status === 'collecting_availability';
  const descriptionLabel = details?.description?.trim() || 'No description provided.';

  return (
    <section className="bg-surface-container-lowest py-24 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="font-headline text-on-surface mb-8 font-medium leading-[1.08]">
          <span className="block text-3xl md:text-4xl lg:text-5xl">
            {isLoading ? 'Loading meeting details…' : details?.title || 'Meeting Details'}
          </span>
          {isCollectingAvailability ? (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-base md:text-lg font-semibold text-amber-900">
              <span className="material-symbols-outlined text-base">schedule</span>
              Pending availability
            </span>
          ) : (
            <span className="block mt-6 text-primary italic text-5xl md:text-6xl font-serif">
              {firstBlock ? `${firstBlock.start_time} - ${firstBlock.end_time}` : formatDeadline(details?.availability_deadline)}
            </span>
          )}
        </h1>

        <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-4">
          {errorMessage || descriptionLabel}
        </p>

        {details && (
          <div className="mx-auto mb-8 max-w-4xl rounded-2xl border border-outline-variant/30 bg-surface px-6 py-6 text-left">
            <h2 className="font-headline text-2xl text-on-surface mb-4">Meeting Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
                <h3 className="font-semibold text-on-surface mb-3">Meeting Info</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Title:</span> {details.title || 'Not available'}</p>
                  <p><span className="font-semibold">Organizer:</span> {details.organizer_name?.trim() || details.organizer_id || 'Not available'}</p>
                  <p><span className="font-semibold">Location:</span> {details.location?.trim() || 'Not specified'}</p>
                  <p><span className="font-semibold">Participants:</span> {details.participants_count ?? 'Not specified'}</p>
                  <p><span className="font-semibold">Votes:</span> {details.votes_count}</p>
                  <p><span className="font-semibold">Auto venue:</span> {details.auto_find_venue ? 'Enabled' : 'Disabled'}</p>
                  <p><span className="font-semibold">Venue recommendations:</span> {details.venue_recommendations_count ?? 'Not specified'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
                <h3 className="font-semibold text-on-surface mb-3">Time Details</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Created:</span> {formatDateTime(details.created_at)}</p>
                  <p><span className="font-semibold">Deadline:</span> {formatDeadline(details.availability_deadline)}</p>
                  <p><span className="font-semibold">Duration:</span> {details.duration_minutes ? `${details.duration_minutes} min` : 'Not specified'}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-on-surface-variant"><span className="font-semibold text-on-surface">Description:</span> {descriptionLabel}</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            className={`font-label text-title-lg font-semibold rounded-lg px-[32px] py-[16px] flex items-center gap-2 shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.15)] transition-all duration-300 ${
              isCollectingAvailability
                ? 'bg-outline-variant/40 text-on-surface-variant cursor-not-allowed'
                : 'bg-primary text-on-primary hover:scale-[1.02] bg-gradient-to-r from-primary to-[#b95837]'
            }`}
            type="button"
            disabled={isCollectingAvailability}
            title={isCollectingAvailability ? 'Calendar is available after availability collection is complete.' : 'Add this meeting to your calendar'}
          >
            <span className="material-symbols-outlined">event_available</span>
            {isCollectingAvailability ? 'Pending availability' : 'Add to Calendar'}
          </button>
        </div>
      </div>
    </section>
  );
}
