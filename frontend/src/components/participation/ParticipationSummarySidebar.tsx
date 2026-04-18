export function ParticipationSummarySidebar() {
  return (
    <div className="lg:col-span-4">
      <div className="sticky top-32 space-y-8">
        <div className="bg-[#f5f4ed] p-8 rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-primary/10 text-8xl rotate-12 select-none">event_note</span>
          </div>
          <div className="relative z-10">
            <h4 className="font-serif italic text-xl mb-6 text-on-surface-variant">Architect&apos;s Summary</h4>
            <div className="space-y-6">
              <div className="border-l-2 border-primary/20 pl-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Proposed Topic</p>
                <p className="font-serif text-lg leading-snug">New Project Kickoff</p>
              </div>
              <div className="border-l-2 border-primary/20 pl-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Time Investment</p>
                <p className="font-sans text-on-surface">45 Minutes per slot</p>
              </div>
              <div className="border-l-2 border-primary/20 pl-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Selected Canvas</p>
                <p className="font-sans text-on-surface">3 Distinct days targeted</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">Oct 4</span>
                  <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">Oct 7</span>
                  <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">Oct 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-highest p-6 rounded-2xl flex items-start gap-4">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          <div className="space-y-2">
            <p className="text-sm font-bold">Pro-Tip</p>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Mondays and Fridays are often less productive for strategy reviews. Our algorithm suggests targeting Tuesdays through Thursdays for higher engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
