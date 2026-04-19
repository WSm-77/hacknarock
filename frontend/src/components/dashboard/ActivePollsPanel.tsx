import type { DashboardPoll } from '../../api/integration';
import { useNavigate } from 'react-router-dom';

interface ActivePollCard {
  status: string;
  rawStatus: string;
  statusClassName: string;
  votes: string;
  title: string;
  pollId?: string;
  meetingId?: string;
  cardClassName: string;
  actionLabel: string;
  actionClassName: string;
}

const STATUS_LABELS: Record<string, string> = {
  collecting_votes: 'Collecting Votes',
  waiting_for_confirmation: 'Waiting for Confirmation',
};

interface ActivePollsPanelProps {
  polls?: DashboardPoll[];
  isLoading?: boolean;
  openPollCount?: number;
}

function toCard(poll: DashboardPoll): ActivePollCard {
  const isPrimaryStatus = poll.status === 'collecting_votes';
  const friendlyStatus = STATUS_LABELS[poll.status] ?? poll.status.replaceAll('_', ' ');

  return {
    status: friendlyStatus,
    rawStatus: poll.status,
    statusClassName: isPrimaryStatus
      ? 'text-xs font-label uppercase tracking-widest text-primary font-bold'
      : 'text-xs font-label uppercase tracking-widest text-on-surface-variant/60 font-bold',
    votes: `${poll.participants} participants`,
    title: poll.title,
    pollId: poll.poll_id ?? undefined,
    meetingId: poll.meeting_id ?? undefined,
    cardClassName: isPrimaryStatus
      ? 'bg-surface-container-low p-5 rounded-xl border-l-4 border-primary transition-transform hover:translate-x-1 duration-300'
      : 'bg-surface-container-low p-5 rounded-xl border-l-4 border-outline-variant transition-transform hover:translate-x-1 duration-300',
    actionLabel: poll.status === 'waiting_for_confirmation' ? 'Open Confirmation' : poll.poll_id ? 'View Details' : 'Link Pending',
    actionClassName: isPrimaryStatus
      ? 'w-full py-2 text-sm font-label font-semibold text-primary hover:bg-primary/5 rounded transition-colors'
      : 'w-full py-2 text-sm font-label font-semibold text-on-surface-variant hover:bg-surface-variant/50 rounded transition-colors',
  };
}

export function ActivePollsPanel({ polls, isLoading = false, openPollCount }: ActivePollsPanelProps) {
  const navigate = useNavigate();
  const cards = polls ? polls.map(toCard) : [];

  return (
    <aside className="col-span-12 lg:col-span-3 space-y-8">
      <section className="lg:max-h-[72vh] lg:overflow-y-auto lg:pr-2">
        <h2 className="font-serif text-2xl text-on-surface-variant mb-2">Active Polls</h2>
        {openPollCount !== undefined && (
          <p className="text-xs uppercase tracking-widest text-on-surface-variant/60 mb-4">{openPollCount} open</p>
        )}
        {isLoading && <p className="text-sm text-on-surface-variant mb-4">Loading dashboard data...</p>}
        <div className="space-y-4">
          {cards.length === 0 && !isLoading && (
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/50">
              <p className="text-sm text-on-surface-variant">No active polls right now. New polls will appear here automatically.</p>
            </div>
          )}
          {cards.map((card) => (
            <div key={`${card.title}-${card.pollId ?? 'no-poll-id'}`} className={card.cardClassName}>
              <div className="flex justify-between items-start mb-2">
                <span className={card.statusClassName}>{card.status}</span>
                <span className="text-xs text-on-surface-variant/60">{card.votes}</span>
              </div>
              <h3 className="font-serif text-lg text-on-surface leading-tight mb-3">{card.title}</h3>
              <button
                type="button"
                className={card.actionClassName}
                disabled={card.rawStatus === 'waiting_for_confirmation' ? !card.meetingId : !card.pollId}
                onClick={() => {
                  if (card.rawStatus === 'waiting_for_confirmation' && card.meetingId) {
                    navigate(`/meeting-confirmation/${card.meetingId}`);
                    return;
                  }

                  if (card.pollId) {
                    navigate(`/vote/${card.pollId}`);
                  }
                }}
              >
                {card.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <h4 className="font-serif text-xl text-primary mb-2">Editorial Tip</h4>
        <p className="text-sm text-on-surface-variant leading-relaxed">Consider leaving a &quot;buffer slot&quot; between intense curations to maintain your intellectual flow.</p>
      </section>
    </aside>
  );
}
