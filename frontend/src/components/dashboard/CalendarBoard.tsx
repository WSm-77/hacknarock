import type { DashboardCalendarMeeting } from '../../api/integration';

const START_HOUR = 8;
const END_HOUR = 18;
const ROW_HEIGHT = 64;

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

function formatTimeLabel(hour: number): string {
  return new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function CalendarBoard({ calendarMeetings = [], weekStart }: CalendarBoardProps) {
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(weekStart), index));
  const dayHeaders = weekDays.map(formatDayHeader);
  const visibleWeekStart = weekDays[0];
  const visibleWeekEnd = addDays(visibleWeekStart, 7);
  const timeRows = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index);
  const totalHeight = (END_HOUR - START_HOUR) * ROW_HEIGHT;

  const positionedEvents = calendarMeetings
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

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const clampedStartMinutes = Math.max(START_HOUR * 60, Math.min(startMinutes, END_HOUR * 60));
      const clampedEndMinutes = Math.max(clampedStartMinutes + 15, Math.min(endMinutes, END_HOUR * 60));

      const top = ((clampedStartMinutes - START_HOUR * 60) / 60) * ROW_HEIGHT;
      const height = Math.max(26, ((clampedEndMinutes - clampedStartMinutes) / 60) * ROW_HEIGHT - 6);
      const isPrimary = meeting.status === 'collecting_votes';

      return {
        meeting,
        top,
        height,
        left: `calc(${(dayIndex / 7) * 100}% + 6px)`,
        width: `calc(${100 / 7}% - 12px)`,
        className: isPrimary
          ? 'bg-primary text-on-primary p-3 rounded-lg shadow-md z-20'
          : 'bg-[#fdf2f0] border-l-2 border-primary p-3 rounded-r-lg shadow-sm z-10',
        titleClassName: isPrimary ? 'text-xs font-bold truncate' : 'text-xs font-bold text-primary truncate',
        detailClassName: isPrimary ? 'text-[10px] text-primary-fixed leading-tight mt-1' : 'text-[10px] text-primary-container leading-tight mt-1',
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] ring-1 ring-on-surface/5">
      <div className="calendar-grid bg-surface-container-low/50 border-b border-surface-variant/30">
        <div className="p-4" />
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

      <div className="relative h-[600px] overflow-y-auto">
        <div className="absolute inset-0 calendar-grid pointer-events-none"><div className="border-r border-surface-variant/10" />{weekDays.map((date, index) => {
          const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();
          return <div key={`${date.toISOString()}-${index}`} className={`border-r border-surface-variant/10 ${isToday ? 'bg-primary/[0.02]' : ''}`} />;
        })}</div>
        <div className="relative z-10">
          {timeRows.map((hour) => (
            <div key={hour} className="calendar-grid border-b border-surface-variant/10 group">
              <div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">{formatTimeLabel(hour)}</div>
              <div className="col-span-7" style={{ height: `${ROW_HEIGHT}px` }} />
            </div>
          ))}
          <div className="absolute top-0 left-[80px] right-0" style={{ height: `${totalHeight}px` }}>
            {positionedEvents.map((event) => (
              <div
                key={`${event.meeting.meeting_id}-${event.meeting.start_at}`}
                className={`absolute ${event.className}`}
                style={{
                  top: `${event.top}px`,
                  left: event.left,
                  width: event.width,
                  height: `${event.height}px`,
                }}
              >
                <h4 className={event.titleClassName}>{event.meeting.title}</h4>
                <p className={event.detailClassName}>
                  {new Date(event.meeting.start_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  {' - '}
                  {new Date(event.meeting.end_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
