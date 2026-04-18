import type { DashboardMeeting } from '../../api/integration';
import { useNavigate } from 'react-router-dom';

const MEETING_POLL_MAPPING_KEY = 'snapslot:meeting-poll-map';

interface ActivePollCard {
  status: string;
  statusClassName: string;
  votes: string;
  title: string;
  pollId?: string;
  cardClassName: string;
  actionLabel: string;
  actionClassName: string;
  showAvatars?: boolean;
}

const activePollCards: ActivePollCard[] = [
  {
    status: 'In Progress',
    statusClassName: 'text-xs font-label uppercase tracking-widest text-primary font-bold',
    votes: '4/5 voted',
    title: 'Quarterly Archive Review',
    cardClassName: 'bg-surface-container-low p-5 rounded-xl border-l-4 border-primary transition-transform hover:translate-x-1 duration-300',
    actionLabel: 'View Details',
    actionClassName: 'w-full py-2 text-sm font-label font-semibold text-primary hover:bg-primary/5 rounded transition-colors',
    showAvatars: true,
  },
  {
    status: 'Draft',
    statusClassName: 'text-xs font-label uppercase tracking-widest text-on-surface-variant/60 font-bold',
    votes: 'No votes',
    title: 'Sunlit Reading Circle',
    cardClassName: 'bg-surface-container-low p-5 rounded-xl border-l-4 border-outline-variant transition-transform hover:translate-x-1 duration-300',
    actionLabel: 'Complete Draft',
    actionClassName: 'w-full py-2 text-sm font-label font-semibold text-on-surface-variant hover:bg-surface-variant/50 rounded transition-colors',
  },
];

interface ActivePollsPanelProps {
  recentMeetings?: DashboardMeeting[];
  isLoading?: boolean;
  openPollCount?: number;
}

function toCard(meeting: DashboardMeeting): ActivePollCard {
  const meetingPollMapRaw = sessionStorage.getItem(MEETING_POLL_MAPPING_KEY);
  const meetingPollMap = meetingPollMapRaw ? JSON.parse(meetingPollMapRaw) as Record<string, string> : {};
  const isInProgress = meeting.status === 'collecting_votes';
  const resolvedPollId = meeting.poll_id ?? meetingPollMap[meeting.meeting_id];

  return {
    status: isInProgress ? 'In Progress' : meeting.status,
    statusClassName: isInProgress
      ? 'text-xs font-label uppercase tracking-widest text-primary font-bold'
      : 'text-xs font-label uppercase tracking-widest text-on-surface-variant/60 font-bold',
    votes: `${meeting.participants} voted`,
    title: meeting.title,
    pollId: resolvedPollId,
    cardClassName: isInProgress
      ? 'bg-surface-container-low p-5 rounded-xl border-l-4 border-primary transition-transform hover:translate-x-1 duration-300'
      : 'bg-surface-container-low p-5 rounded-xl border-l-4 border-outline-variant transition-transform hover:translate-x-1 duration-300',
    actionLabel: 'View Details',
    actionClassName: isInProgress
      ? 'w-full py-2 text-sm font-label font-semibold text-primary hover:bg-primary/5 rounded transition-colors'
      : 'w-full py-2 text-sm font-label font-semibold text-on-surface-variant hover:bg-surface-variant/50 rounded transition-colors',
    showAvatars: false,
  };
}

export function ActivePollsPanel({ recentMeetings, isLoading = false, openPollCount }: ActivePollsPanelProps) {
  const navigate = useNavigate();
  const cards = recentMeetings && recentMeetings.length > 0 ? recentMeetings.map(toCard) : activePollCards;

  return (
    <aside className="col-span-12 lg:col-span-3 space-y-8">
      <section>
        <h2 className="font-serif text-2xl text-on-surface-variant mb-2">Active Polls</h2>
        {openPollCount !== undefined && (
          <p className="text-xs uppercase tracking-widest text-on-surface-variant/60 mb-4">{openPollCount} open</p>
        )}
        {isLoading && <p className="text-sm text-on-surface-variant mb-4">Loading dashboard data...</p>}
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.title} className={card.cardClassName}>
              <div className="flex justify-between items-start mb-2">
                <span className={card.statusClassName}>{card.status}</span>
                <span className="text-xs text-on-surface-variant/60">{card.votes}</span>
              </div>
              <h3 className="font-serif text-lg text-on-surface leading-tight mb-3">{card.title}</h3>
              {card.showAvatars && (
                <div className="flex -space-x-2 mb-4">
                  <img className="h-7 w-7 rounded-full border-2 border-surface-container-low" data-alt="professional woman headshot, clean background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhxCX0vEYMvBtEpB3BLqzUZqxPMcE3ZvYGc0uWJ9zcHSG7HVhcWEXhUQ8e2nOkJgToIF3rieGW091v7Xk3F-Kyk7mmRZGXst9lJVS_XuVkEchlnyRgBJGw2ZUqyHZtYNZxysZpyPRF8YOYorJLRPTcgNzr5IYs7W0-BFfC9F1I0yGx7OfaULV00xTOK1Ow6Y5qgXyy4K3AmcVwZ7ZqIf3eYhElcmeTzPaKZg0ikMR1O1bQS7AWi9HSVAvtkqO5dmPSAwx21neaXE8c" />
                  <img className="h-7 w-7 rounded-full border-2 border-surface-container-low" data-alt="casual man headshot, soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuqGN4GBqdF7cE24qIFbP7JaGebq7NyPyiTygQrDuemSHnzxNxB5-67nhvMUfDvljh1JX8niVsvzhIs5I9ijo4F7B81jirOaTG6pPFWMgOEuDTbZwO9nv87tzS7z5SDXfWJVRZNWjF1XoQ_ofQd47iFTGJGgl3yTW-QyAovOvmTkyV8uH4c6lW2CdqVE7_n2m5uQaqiUoCFmO5-gowlJRIkAC28WlPi9QKm_g7zVIHdfTbzU5fq4nUX7X1094Qe7-oSDO9QsXSY-RI" />
                  <div className="h-7 w-7 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold border-2 border-surface-container-low">+2</div>
                </div>
              )}
              <button
                type="button"
                className={card.actionClassName}
                disabled={!card.pollId}
                onClick={() => {
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
