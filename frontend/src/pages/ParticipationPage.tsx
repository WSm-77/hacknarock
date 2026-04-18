/**
 * Participation Page - Public Link View
 *
 * Converted from the provided mixed HTML/template content into a React component.
 */

export function ParticipationPage() {
  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <nav className="bg-[#fbf9f2]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0px_1px_0px_0px_rgba(20,20,19,0.05)] h-20 px-8">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center h-full">
          <div className="flex items-center gap-12">
            <span className="font-serif text-2xl font-medium tracking-tight text-[#141413]">SnapSlot</span>
            <div className="hidden md:flex gap-8">
              <a className="text-stone-600 font-sans hover:text-[#141413] transition-all duration-300" href="#">Dashboard</a>
              <a className="text-[#9a4021] font-semibold border-b-2 border-[#9a4021] pb-1 transition-all duration-300" href="#">Meetings</a>
              <a className="text-stone-600 font-sans hover:text-[#141413] transition-all duration-300" href="#">Availability</a>
              <a className="text-stone-600 font-sans hover:text-[#141413] transition-all duration-300" href="#">Archives</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="px-6 py-2.5 text-stone-600 hover:bg-stone-100/50 rounded-lg transition-all duration-300">Help</button>
            <button type="button" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow-sm hover:bg-primary-container transition-all duration-300">Create New</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <header className="mb-16">
          <h1 className="font-serif italic text-5xl text-[#141413] mb-4">The Meeting Architect</h1>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed text-lg">
            Curate your next gathering with intentionality. Every slot is a moment of potential collaboration.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-24">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">01</span>
                <h2 className="font-serif text-2xl text-[#141413]">The Essentials</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block px-1" htmlFor="meeting-title">Meeting Title</label>
                  <input id="meeting-title" className="w-full bg-surface-container-highest border-0 rounded-lg py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-stone-400" placeholder="e.g. Editorial Strategy Review" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block px-1" htmlFor="meeting-duration">Duration</label>
                  <select id="meeting-duration" className="w-full bg-surface-container-highest border-0 rounded-lg py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface appearance-none" defaultValue="45 Minutes">
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                    <option>90 Minutes</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block px-1" htmlFor="context-brief">Contextual Brief</label>
                  <textarea id="context-brief" className="w-full bg-surface-container-highest border-0 rounded-lg py-4 px-5 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-stone-400" placeholder="Define the objective and desired outcome..." rows={3} />
                </div>
              </div>
            </section>

            <section className="space-y-12">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">02</span>
                <h2 className="font-serif text-2xl text-[#141413]">Temporal Planning</h2>
              </div>

              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-serif text-xl italic text-on-surface-variant">Step A: Select Possible Dates</h3>
                  <div className="flex gap-2">
                    <button type="button" className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                    <button type="button" className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-4">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sun</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Mon</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tue</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Wed</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Thu</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Fri</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  <div className="h-14 rounded-lg bg-transparent" />
                  <div className="h-14 rounded-lg bg-transparent" />
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all text-stone-400">1</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">2</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">3</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-md">4</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">5</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">6</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-md">7</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">8</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">9</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-md">10</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">11</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">12</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">13</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">14</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">15</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">16</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">17</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">18</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">19</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">20</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">21</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">22</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">23</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">24</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">25</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">26</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">27</button>
                  <button type="button" className="h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all">28</button>
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

            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">03</span>
                <h2 className="font-serif text-2xl text-[#141413]">Curation Parameters</h2>
              </div>
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="pt-1"><input defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" /></div>
                      <div>
                        <label className="font-bold text-on-surface">Buffer Intervals</label>
                        <p className="text-sm text-on-surface-variant">Add 15 minutes of recovery between meetings.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="pt-1"><input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" /></div>
                      <div>
                        <label className="font-bold text-on-surface">Public Visibility</label>
                        <p className="text-sm text-on-surface-variant">Allow others to see the attendee list before joining.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant" htmlFor="timezone-lock">Time Zone Lock</label>
                      <select id="timezone-lock" className="w-full bg-surface border-0 rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/40" defaultValue="GMT -05:00 (Eastern Time)">
                        <option>GMT -05:00 (Eastern Time)</option>
                        <option>GMT +00:00 (London)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant" htmlFor="max-attendees">Max Attendees</label>
                      <input id="max-attendees" className="w-full bg-surface border-0 rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/40" type="number" defaultValue={12} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-6 pt-8">
              <button type="button" className="px-8 py-4 text-[#141413] font-medium hover:bg-stone-100 rounded-lg transition-all duration-300">Save as Draft</button>
              <button type="button" className="px-10 py-4 bg-primary text-on-primary rounded-lg font-bold shadow-lg hover:bg-primary-container transition-all duration-300 flex items-center gap-3">
                Launch Meeting
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>

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
        </div>
      </main>

      <footer className="bg-[#f5f4ed] mt-32 border-t border-[#dcc1b8]/20 py-12 px-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-stone-800 font-serif italic text-lg">SnapSlot</div>
          <div className="flex gap-8 text-sm tracking-wide">
            <a className="text-stone-500 hover:text-stone-800 transition-colors duration-300" href="#">Privacy Policy</a>
            <a className="text-stone-500 hover:text-stone-800 transition-colors duration-300" href="#">Terms of Service</a>
            <a className="text-stone-500 hover:text-stone-800 transition-colors duration-300" href="#">The Archive Blog</a>
            <a className="text-stone-500 hover:text-stone-800 transition-colors duration-300" href="#">Support</a>
          </div>
          <p className="text-stone-500 text-xs text-center md:text-right">
            {"© 2024 SnapSlot Editorial Scheduling."}
            <br />
            Crafted for the unhurried professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
