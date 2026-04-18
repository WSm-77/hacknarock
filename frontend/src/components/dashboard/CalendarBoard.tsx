const dayHeaders = [
  { day: 'Mon', date: '14' },
  { day: 'Tue', date: '15', highlighted: true },
  { day: 'Wed', date: '16' },
  { day: 'Thu', date: '17' },
  { day: 'Fri', date: '18' },
  { day: 'Sat', date: '19', muted: true },
  { day: 'Sun', date: '20', muted: true },
];

const timeRows = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

export function CalendarBoard() {
  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] ring-1 ring-on-surface/5">
      <div className="calendar-grid bg-surface-container-low/50 border-b border-surface-variant/30">
        <div className="p-4" />
        {dayHeaders.map((item) => (
          <div
            key={`${item.day}-${item.date}`}
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
        <div className="absolute inset-0 calendar-grid pointer-events-none"><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10 bg-primary/[0.02]" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div /></div>
        <div className="relative z-10">
          {timeRows.map((time) => (
            <div key={time} className="calendar-grid border-b border-surface-variant/10 group">
              <div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">{time}</div>
              <div className="col-span-7 h-16 relative">
                {time === '10:00 AM' && (
                  <div className="absolute left-[0.5%] w-[13.5%] top-2 bottom-[-40px] bg-[#fdf2f0] border-l-2 border-primary p-3 rounded-r-lg shadow-sm">
                    <h4 className="text-xs font-bold text-primary truncate">Curatorial Sync</h4>
                    <p className="text-[10px] text-primary-container leading-tight mt-1">10:00 - 11:30 AM</p>
                  </div>
                )}
                {time === '11:00 AM' && (
                  <div className="absolute left-[15%] w-[13.5%] top-2 bottom-[-20px] bg-primary text-on-primary p-3 rounded-lg shadow-md z-20">
                    <h4 className="text-xs font-bold truncate">Study Session</h4>
                    <p className="text-[10px] text-primary-fixed leading-tight mt-1">11:00 - 12:15 PM</p>
                    <div className="mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span><span className="text-[9px] uppercase tracking-tighter">Main Archive</span></div>
                  </div>
                )}
                {time === '1:00 PM' && (
                  <div className="absolute left-[29.5%] w-[13.5%] top-4 bottom-[-10px] bg-tertiary-fixed border-l-2 border-tertiary p-3 rounded-r-lg">
                    <h4 className="text-xs font-bold text-on-tertiary-fixed truncate">Manifesto Draft</h4>
                    <p className="text-[10px] text-on-tertiary-fixed-variant leading-tight mt-1">1:15 - 2:00 PM</p>
                  </div>
                )}
                {time === '2:00 PM' && (
                  <div className="absolute left-[58.5%] w-[13.5%] top-0 bottom-[-30px] bg-[#fdf2f0] border-l-2 border-primary p-3 rounded-r-lg shadow-sm">
                    <h4 className="text-xs font-bold text-primary truncate">Weekly Retro</h4>
                    <p className="text-[10px] text-primary-container leading-tight mt-1">2:00 - 3:30 PM</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
