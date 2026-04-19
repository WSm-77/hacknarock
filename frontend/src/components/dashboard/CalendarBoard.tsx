import type { DashboardCalendarMeeting } from '../../api/integration';
import { useNavigate } from 'react-router-dom';

interface CalendarBoardProps {
  calendarMeetings?: DashboardCalendarMeeting[];
  weekStart: Date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayHeader(date: Date): { day: string; date: string; highlighted: boolean; muted: boolean } {
  const today = startOfDay(new Date());
  const current = startOfDay(date);
  const isToday = current.getTime() === today.getTime();
  const dayOfWeek = current.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    day: current.toLocaleDateString(undefined, { weekday: 'short' }),
    date: current.toLocaleDateString(undefined, { day: 'numeric' }),
    highlighted: isToday,
    muted: isWeekend,
  };
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toStatusLabel(status: string): string {
  return status.replaceAll('_', ' ');
}

function statusClassNames(status: string): { card: string; accent: string; status: string } {
  if (status === 'collecting_votes') {
    return {
      card: 'bg-primary/5 border-primary/20 hover:bg-primary/10',
      accent: 'bg-primary',
      status: 'text-primary',
    };
  }

  if (status === 'finalized') {
    return {
      card: 'bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/80',
      accent: 'bg-emerald-500',
      status: 'text-emerald-700',
    };
  }

  return {
    card: 'bg-surface-container-low border-outline-variant/60 hover:bg-surface-container',
    accent: 'bg-outline',
    status: 'text-on-surface-variant',
  };
}

export function CalendarBoard({ calendarMeetings = [], weekStart }: CalendarBoardProps) {
  const navigate = useNavigate();
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(weekStart), index));
  const dayHeaders = weekDays.map(formatDayHeader);
  const visibleWeekStart = weekDays[0];
  const visibleWeekEnd = addDays(visibleWeekStart, 7);

  const groupedEvents = calendarMeetings
    .map((meeting) => {
      const start = new Date(meeting.start_at);
      const end = new Date(meeting.end_at);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        return null;
      }

      if (end <= visibleWeekStart || start >= visibleWeekEnd) {
        return null;
      }

      const eventDayStart = startOfDay(start);
      const dayIndex = Math.floor((eventDayStart.getTime() - visibleWeekStart.getTime()) / (24 * 60 * 60 * 1000));

      if (dayIndex < 0 || dayIndex > 6) {
        return null;
      }

      const style = statusClassNames(meeting.status);

      return {
        meeting,
        dayIndex,
        start,
        end,
        className: style.card,
        accentClassName: style.accent,
        statusClassName: style.status,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => left.start.getTime() - right.start.getTime());

  const eventsByDay = weekDays.map((_, dayIndex) => groupedEvents.filter((event) => event.dayIndex === dayIndex));

  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] ring-1 ring-on-surface/5">
      <div className="calendar-grid bg-surface-container-low/50 border-b border-surface-variant/30">
        <div className="p-4 text-[11px] uppercase tracking-widest text-on-surface-variant/60">Week</div>
        {dayHeaders.map((item, index) => (
          <div
            key={`${item.day}-${item.date}-${index}`}
            className={`p-4 text-center border-l border-surface-variant/20 ${item.highlighted ? 'bg-primary/5' : ''} ${item.muted ? 'italic opacity-50' : ''}`}
          >
            <span className={`block text-xs font-label uppercase tracking-widest mb-1 ${item.highlighted ? 'text-primary' : 'text-on-surface-variant/60'}`}>
              {item.day}
            </span>
            <span className={`text-xl font-serif ${item.highlighted ? 'text-primary font-bold' : 'text-on-surface'}`}>
              {item.date}
            </span>
          </div>
        ))}
      </div>

      <div className="h-[600px] overflow-y-auto overflow-x-auto">
        <div className="calendar-grid min-w-[920px]">
          <div className="sticky left-0 z-10 bg-surface-container-lowest p-4 text-[11px] text-on-surface-variant/70 border-r border-surface-variant/20">
            <p className="font-label uppercase tracking-widest">Card View</p>
            <p className="mt-2 leading-relaxed">Compact daily cards. Tap a card to open details.</p>
          </div>
          {eventsByDay.map((events, dayIndex) => {
            const date = weekDays[dayIndex];
            const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();

            return (
              <div
                key={`${date.toISOString()}-${dayIndex}`}
                className={`p-3 space-y-2 border-l border-surface-variant/15 ${isToday ? 'bg-primary/[0.015]' : ''}`}
              >
                {events.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-surface-variant/40 bg-surface-container-low/40 p-3 text-xs text-on-surface-variant/60">
                    No meetings
                  </div>
                ) : (
                  events.map((event) => (
                    <button
                      key={`${event.meeting.meeting_id}-${event.meeting.start_at}`}
                      type="button"
                      className={`w-full text-left rounded-xl border p-3 shadow-[0px_4px_12px_-8px_rgba(25,28,27,0.35)] transition-colors ${event.className}`}
                      onClick={() => navigate(`/meeting/${event.meeting.meeting_id}`)}
                    >
                      <div className="flex gap-2 items-start">
                        <span className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${event.accentClassName}`} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant">
                            {formatTimeLabel(event.start)} - {formatTimeLabel(event.end)}
                          </p>
                          <h4 className="mt-1 text-sm font-semibold text-on-surface leading-tight line-clamp-2">{event.meeting.title}</h4>
                          <p className={`mt-1 text-[10px] uppercase tracking-widest font-medium ${event.statusClassName}`}>
                            {toStatusLabel(event.meeting.status)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
