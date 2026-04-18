const weekDays = [
  { day: 'Mon', date: '24' },
  { day: 'Tue', date: '25' },
  { day: 'Wed', date: '26' },
  { day: 'Thu', date: '27' },
  { day: 'Fri', date: '28' },
  { day: 'Sat', date: '29', muted: true },
  { day: 'Sun', date: '30', muted: true },
];

const timeLabels = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

type DayColumnType = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'weekend';

const dayColumns: DayColumnType[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'weekend', 'weekend'];

function renderHalfHourCell(type: DayColumnType, index: number) {
  if (type === 'mon') {
    const selected = index >= 2 && index <= 5;
    return (
      <div
        key={`mon-${index}`}
        className={`h-6 grid-line-x ${selected ? 'bg-primary cursor-pointer border-b border-white/10' : 'bg-surface-container-highest/30 cursor-pointer hover:bg-secondary-container transition-colors'} ${index % 2 === 1 ? 'border-b-2 border-outline-variant/20' : ''}`}
      />
    );
  }

  if (type === 'tue') {
    const selected = index >= 6 && index <= 9;
    return (
      <div
        key={`tue-${index}`}
        className={`h-6 grid-line-x ${selected ? 'bg-primary cursor-pointer border-b border-white/10' : 'bg-surface-container-highest/30'} ${index % 2 === 1 ? 'border-b-2 border-outline-variant/20' : ''}`}
      />
    );
  }

  if (type === 'wed') {
    const selected = index >= 2 && index <= 5;
    return (
      <div
        key={`wed-${index}`}
        className={`h-6 grid-line-x ${selected ? 'bg-primary cursor-pointer border-b border-white/10' : 'bg-surface-container-highest/30'} ${index % 2 === 1 ? 'border-b-2 border-outline-variant/20' : ''}`}
      />
    );
  }

  if (type === 'thu') {
    const selected = index >= 8 && index <= 11;
    return (
      <div
        key={`thu-${index}`}
        className={`h-6 grid-line-x ${selected ? 'bg-primary cursor-pointer border-b border-white/10' : 'bg-surface-container-highest/30'} ${index % 2 === 1 ? 'border-b-2 border-outline-variant/20' : ''}`}
      />
    );
  }

  if (type === 'fri') {
    const selected = index <= 3;
    return (
      <div
        key={`fri-${index}`}
        className={`h-6 grid-line-x ${selected ? 'bg-primary cursor-pointer border-b border-white/10' : 'bg-surface-container-highest/30'} ${index % 2 === 1 ? 'border-b-2 border-outline-variant/20' : ''}`}
      />
    );
  }

  return (
    <div
      key={`weekend-${index}`}
      className={`h-6 grid-line-x ${index % 2 === 1 ? 'border-b-2 border-outline-variant/20' : ''}`}
    />
  );
}

export function WizardTimingSection() {
  return (
    <section>
      <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">II. Propose Timings</h2>
      <p className="font-body text-sm text-on-surface-variant mb-6">Select the specific time blocks across the week that you are offering to participants.</p>

      <div className="bg-surface-container-low rounded-xl p-4 md:p-6 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)] overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors" type="button"><span className="material-symbols-outlined text-on-surface-variant">chevron_left</span></button>
            <h3 className="font-headline text-xl text-on-surface">Oct 24 - Oct 30, 2024</h3>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors" type="button"><span className="material-symbols-outlined text-on-surface-variant">chevron_right</span></button>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>GMT-4</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] mb-4">
              <div />
              {weekDays.map((item) => (
                <div key={`${item.day}-${item.date}`} className={`text-center ${item.muted ? 'opacity-50' : ''}`}>
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{item.day}</div>
                  <div className="font-headline text-lg text-on-surface">{item.date}</div>
                </div>
              ))}
            </div>

            <div className="relative grid grid-cols-[80px_repeat(7,1fr)] select-none">
              <div className="space-y-0 h-full">
                {timeLabels.map((label) => (
                  <div key={label} className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">{label}</span></div>
                ))}
              </div>

              {dayColumns.map((type, index) => (
                <div
                  key={`${type}-${index}`}
                  className={`grid-line-y ${index === 0 ? 'border-l border-[rgba(137,114,107,0.15)]' : ''} ${type === 'weekend' ? 'opacity-50 bg-surface-container-high/20' : ''}`}
                >
                  {Array.from({ length: 18 }).map((_, cellIndex) => renderHalfHourCell(type, cellIndex))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
