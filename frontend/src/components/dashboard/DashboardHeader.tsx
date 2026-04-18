export function DashboardHeader() {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-2">This Week</h1>
        <p className="font-body text-on-surface-variant opacity-80 italic">October 14 - October 20, 2024</p>
      </div>
      <div className="flex gap-2">
        <button type="button" className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
        <button type="button" className="px-4 py-2 font-label font-medium text-sm rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors">Today</button>
        <button type="button" className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
      </div>
    </div>
  );
}
