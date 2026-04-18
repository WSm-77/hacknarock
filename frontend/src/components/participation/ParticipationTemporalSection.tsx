import { SectionTitle } from '../common/SectionTitle';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarCells = [
  { type: 'empty' },
  { type: 'empty' },
  { label: '1', muted: true },
  { label: '2' },
  { label: '3' },
  { label: '4', selected: true },
  { label: '5' },
  { label: '6' },
  { label: '7', selected: true },
  { label: '8' },
  { label: '9' },
  { label: '10', selected: true },
  { label: '11' },
  { label: '12' },
  { label: '13' },
  { label: '14' },
  { label: '15' },
  { label: '16' },
  { label: '17' },
  { label: '18' },
  { label: '19' },
  { label: '20' },
  { label: '21' },
  { label: '22' },
  { label: '23' },
  { label: '24' },
  { label: '25' },
  { label: '26' },
  { label: '27' },
  { label: '28' },
];

export function ParticipationTemporalSection() {
  return (
    <section className="space-y-12">
      <SectionTitle
        number="02"
        title="Temporal Planning"
        wrapperClassName="flex items-center gap-4 mb-8"
        badgeClassName="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container"
        titleClassName="font-serif text-2xl text-[#141413]"
      />

      <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-serif text-xl italic text-on-surface-variant">Step A: Select Possible Dates</h3>
          <div className="flex gap-2">
            <button type="button" className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
            <button type="button" className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {weekDays.map((day) => (
            <span key={day} className="text-xs font-bold text-stone-400 uppercase tracking-widest">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, index) => {
            if (cell.type === 'empty') {
              return <div key={`empty-${index}`} className="h-14 rounded-lg bg-transparent" />;
            }

            return (
              <button
                key={cell.label}
                type="button"
                className={`h-14 flex items-center justify-center rounded-lg transition-all ${cell.selected ? 'bg-primary text-on-primary font-bold shadow-md' : 'hover:bg-surface-container-high'} ${cell.muted ? 'text-stone-400' : ''}`}
              >
                {cell.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h3 className="font-serif text-xl italic text-on-surface-variant">Step B: Define Windows for Selected Days</h3>
          <button type="button" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline">
            <span className="material-symbols-outlined text-lg">sync</span>
            Match all selected days
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-container-high/40 p-6 rounded-xl flex flex-wrap items-center gap-6">
            <div className="w-32">
              <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Wednesday</span>
              <span className="font-serif text-lg">Oct 4th</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-outline-variant/10">
                <input className="w-16 bg-transparent border-0 p-0 text-center focus:ring-0" type="text" defaultValue="09:00" />
                <span className="text-stone-300">-</span>
                <input className="w-16 bg-transparent border-0 p-0 text-center focus:ring-0" type="text" defaultValue="11:30" />
              </div>
              <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-outline-variant/10">
                <input className="w-16 bg-transparent border-0 p-0 text-center focus:ring-0" type="text" defaultValue="14:00" />
                <span className="text-stone-300">-</span>
                <input className="w-16 bg-transparent border-0 p-0 text-center focus:ring-0" type="text" defaultValue="17:00" />
              </div>
              <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-tertiary-fixed text-on-tertiary-fixed hover:shadow-sm transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-high/40 p-6 rounded-xl flex flex-wrap items-center gap-6">
            <div className="w-32">
              <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Saturday</span>
              <span className="font-serif text-lg">Oct 7th</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-outline-variant/10">
                <input className="w-16 bg-transparent border-0 p-0 text-center focus:ring-0" type="text" defaultValue="10:00" />
                <span className="text-stone-300">-</span>
                <input className="w-16 bg-transparent border-0 p-0 text-center focus:ring-0" type="text" defaultValue="12:00" />
              </div>
              <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-tertiary-fixed text-on-tertiary-fixed hover:shadow-sm transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-high/40 p-6 rounded-xl flex flex-wrap items-center gap-6">
            <div className="w-32">
              <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Tuesday</span>
              <span className="font-serif text-lg">Oct 10th</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-4">
              <span className="text-stone-400 text-sm italic">No slots defined yet.</span>
              <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-outline-variant/30 text-sm font-medium hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Add First Window
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
