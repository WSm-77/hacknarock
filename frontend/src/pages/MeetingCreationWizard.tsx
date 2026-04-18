/**
 * Meeting Creation Wizard - Organizer View
 *
 * Converted from the provided HTML template.
 */

export function MeetingCreationWizard() {
  return (
    <div className="antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed bg-surface text-on-surface">
      <style>{`
        body { font-family: 'Inter', sans-serif; background-color: #fbf9f2; color: #1b1c18; }
        .font-headline { font-family: 'Newsreader', serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f5f4ed; }
        ::-webkit-scrollbar-thumb { background: #dcc1b8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #89726b; }
        .grid-line-x { border-bottom: 1px solid rgba(137, 114, 107, 0.15); }
        .grid-line-y { border-right: 1px solid rgba(137, 114, 107, 0.15); }
        .time-label { transform: translateY(-50%); }
        .slot-selected { background-color: #9a4021 !important; }
      `}</style>

      <header className="sticky top-0 w-full z-50 bg-[#fbf9f2]/80 backdrop-blur-md shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)]">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <a className="font-serif text-2xl font-medium text-[#141413] tracking-tight hover:opacity-80 transition-opacity" href="#">SnapSlot</a>
            <nav className="hidden md:flex gap-6 items-center">
              <a className="text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300" href="#">Dashboard</a>
              <a className="text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300" href="#">My Polls</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300 scale-100 active:scale-[0.98] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] hidden md:inline-flex items-center gap-2">Create New</button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-16 md:py-24">
        <div className="mb-16 max-w-2xl">
          <h1 className="font-headline text-5xl md:text-6xl font-medium leading-[1.1] text-on-surface mb-4">Orchestrate a Gathering</h1>
          <p className="font-body text-lg text-on-surface-variant leading-[1.6]">Define the parameters of your meeting, select potential times, and let the algorithm harmonize schedules.</p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 md:p-12 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
            <svg fill="none" height="200" stroke="#9a4021" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" viewBox="0 0 24 24" width="200">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <form className="space-y-16 relative z-10">
            <section>
              <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">I. The Essentials</h2>
              <div className="space-y-6">
                <div>
                  <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="meeting-title">Meeting Title</label>
                  <input className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body" id="meeting-title" placeholder="e.g., Q3 Strategy Review" type="text" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="duration">Duration</label>
                    <div className="relative">
                      <select className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow appearance-none font-body cursor-pointer" defaultValue="60 Minutes" id="duration">
                        <option>30 Minutes</option>
                        <option>60 Minutes</option>
                        <option>90 Minutes</option>
                        <option>Half Day</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="location">Location (Optional)</label>
                    <input className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body" id="location" placeholder="Zoom link or Room Name" type="text" />
                  </div>
                </div>
                <div>
                  <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="description">Context & Agenda</label>
                  <textarea className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body resize-none" id="description" placeholder="Briefly describe the purpose of this gathering..." rows={3} />
                </div>
              </div>
            </section>

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
                      <div className="text-center"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Mon</div><div className="font-headline text-lg text-on-surface">24</div></div>
                      <div className="text-center"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Tue</div><div className="font-headline text-lg text-on-surface">25</div></div>
                      <div className="text-center"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Wed</div><div className="font-headline text-lg text-on-surface">26</div></div>
                      <div className="text-center"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Thu</div><div className="font-headline text-lg text-on-surface">27</div></div>
                      <div className="text-center"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Fri</div><div className="font-headline text-lg text-on-surface">28</div></div>
                      <div className="text-center opacity-50"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Sat</div><div className="font-headline text-lg text-on-surface">29</div></div>
                      <div className="text-center opacity-50"><div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Sun</div><div className="font-headline text-lg text-on-surface">30</div></div>
                    </div>

                    <div className="relative grid grid-cols-[80px_repeat(7,1fr)] select-none">
                      <div className="space-y-0 h-full">
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">9 AM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">10 AM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">11 AM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">12 PM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">1 PM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">2 PM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">3 PM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">4 PM</span></div>
                        <div className="h-12 relative"><span className="absolute right-4 top-0 time-label text-[10px] uppercase font-bold text-outline">5 PM</span></div>
                      </div>

                      <div className="grid-line-y border-l border-[rgba(137,114,107,0.15)]">
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer hover:bg-secondary-container transition-colors" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer hover:bg-secondary-container transition-colors border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30 cursor-pointer border-b-2 border-outline-variant/20" />
                      </div>

                      <div className="grid-line-y">
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                      </div>

                      <div className="grid-line-y">
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                      </div>

                      <div className="grid-line-y">
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                      </div>

                      <div className="grid-line-y">
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-primary cursor-pointer border-b border-white/10" /><div className="h-6 grid-line-x bg-primary cursor-pointer border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x bg-surface-container-highest/30" /><div className="h-6 grid-line-x bg-surface-container-highest/30 border-b-2 border-outline-variant/20" />
                      </div>

                      <div className="grid-line-y opacity-50 bg-surface-container-high/20">
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                      </div>

                      <div className="grid-line-y opacity-50 bg-surface-container-high/20">
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                        <div className="h-6 grid-line-x" /><div className="h-6 grid-line-x border-b-2 border-outline-variant/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">III. Curation Parameters</h2>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block font-label text-sm font-medium text-on-surface" htmlFor="threshold">Interest Threshold</label>
                    <span className="font-body text-sm text-primary font-medium bg-primary-fixed/30 px-3 py-1 rounded-full">5 Respondents</span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mb-4">The meeting will only trigger scheduling once this minimum number of key participants align on a time.</p>
                  <input className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" id="threshold" max="20" min="2" type="range" defaultValue="5" />
                </div>
                <div>
                  <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="expiration">Link Expiration</label>
                  <p className="font-body text-xs text-on-surface-variant mb-3">Encourage timely responses by setting a deadline for submissions.</p>
                  <input className="w-full md:w-1/2 bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow font-body cursor-pointer" id="expiration" type="date" />
                </div>
                <div className="flex items-start gap-4 pt-4 border-t border-outline-variant/10">
                  <div className="relative flex items-center h-6 mt-1">
                    <input className="peer sr-only" id="auto-venue" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm" />
                  </div>
                  <div>
                    <label className="font-label text-sm font-medium text-on-surface cursor-pointer" htmlFor="auto-venue">Auto-find Venue & Draft Email</label>
                    <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed">Let the system analyze participant locations and suggest a neutral venue, compiling a draft invitation upon consensus.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-end gap-4 border-t border-outline-variant/20">
              <button className="w-full md:w-auto px-[24px] py-[12px] rounded font-label font-medium text-sm text-on-surface-variant hover:bg-surface-container transition-colors duration-300" type="button">Save as Draft</button>
              <button className="w-full md:w-auto bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300 scale-100 active:scale-[0.98] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] bg-gradient-to-r from-primary to-primary-container" type="button">Generate Poll Link</button>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full mt-24 py-12 bg-[#f5f4ed] border-t border-[#dcc1b8]/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="font-serif italic text-xl text-[#141413]">SnapSlot</span>
          <span className="font-sans text-sm leading-relaxed text-[#56423c]">(c) 2024 SnapSlot. Curated with intention.</span>
          <div className="flex gap-6">
            <a className="font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300" href="#">Archive</a>
            <a className="font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300" href="#">Methodology</a>
            <a className="font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300" href="#">Privacy</a>
            <a className="font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
