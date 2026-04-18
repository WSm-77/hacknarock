/**
 * Dashboard - Home View
 *
 * Converted from static HTML into a React component.
 */
export function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed bg-[#fbf9f2] text-[#1b1c18]">
      <style>{`
        .font-serif { font-family: 'Newsreader', serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: 80px repeat(7, 1fr);
        }
      `}</style>

      <header className="bg-[#fbf9f2]/80 dark:bg-[#141413]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-serif text-2xl italic text-[#9a4021] dark:text-[#c96442]">SnapSlot</span>
            <nav className="hidden md:flex gap-6 items-center">
              <a className="font-serif tracking-tight text-[#56423c] dark:text-[#e3e3dc] opacity-70 hover:text-[#9a4021] transition-colors duration-300 ease-in-out" href="#">Archive</a>
              <a className="font-serif tracking-tight text-[#56423c] dark:text-[#e3e3dc] opacity-70 hover:text-[#9a4021] transition-colors duration-300 ease-in-out" href="#">Study</a>
              <a className="font-serif tracking-tight text-[#56423c] dark:text-[#e3e3dc] opacity-70 hover:text-[#9a4021] transition-colors duration-300 ease-in-out" href="#">Curations</a>
              <a className="font-serif tracking-tight text-[#9a4021] dark:text-[#c96442] font-semibold border-b-2 border-[#9a4021] pb-1" href="#">Schedule</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">settings</button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/30">
              <img alt="User Librarian Profile" data-alt="close-up portrait of a thoughtful man with glasses in a library setting, warm natural lighting, intellectual aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJSfcdnsyAh93F_7fDKt4C-v0mEu97AMS7yUAd_c6JQe-dceNT3cOV9KTGyD82jZYel0GPI7APNE5Wa6IQc9vvaSRXUqF88-NdzWR3JuFgjoX5PTsZdOGLID-AVSKc7MPTPsJsX0Dl-eGFUwzb_fdq6IxLGukLAPBLgN6IIGirgKB6CighGCC6zlD6gj0uO54-VjoUUn6QR46LkEODyp688o1-Qa3ciTUoUHvmd-5ni9IcWUtvumDMb_V-dOTPNpUdHPz5jQsZOVE8" />
            </div>
            <button type="button" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label font-medium shadow-sm hover:brightness-110 transition-all scale-95 active:scale-90">New Slot</button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-screen-2xl mx-auto w-full px-8 py-12 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 space-y-8">
          <section>
            <h2 className="font-serif text-2xl text-on-surface-variant mb-6">Active Polls</h2>
            <div className="space-y-4">
              <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary transition-transform hover:translate-x-1 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-label uppercase tracking-widest text-primary font-bold">In Progress</span>
                  <span className="text-xs text-on-surface-variant/60">4/5 voted</span>
                </div>
                <h3 className="font-serif text-lg text-on-surface leading-tight mb-3">Quarterly Archive Review</h3>
                <div className="flex -space-x-2 mb-4">
                  <img className="h-7 w-7 rounded-full border-2 border-surface-container-low" data-alt="professional woman headshot, clean background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhxCX0vEYMvBtEpB3BLqzUZqxPMcE3ZvYGc0uWJ9zcHSG7HVhcWEXhUQ8e2nOkJgToIF3rieGW091v7Xk3F-Kyk7mmRZGXst9lJVS_XuVkEchlnyRgBJGw2ZUqyHZtYNZxysZpyPRF8YOYorJLRPTcgNzr5IYs7W0-BFfC9F1I0yGx7OfaULV00xTOK1Ow6Y5qgXyy4K3AmcVwZ7ZqIf3eYhElcmeTzPaKZg0ikMR1O1bQS7AWi9HSVAvtkqO5dmPSAwx21neaXE8c" />
                  <img className="h-7 w-7 rounded-full border-2 border-surface-container-low" data-alt="casual man headshot, soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuqGN4GBqdF7cE24qIFbP7JaGebq7NyPyiTygQrDuemSHnzxNxB5-67nhvMUfDvljh1JX8niVsvzhIs5I9ijo4F7B81jirOaTG6pPFWMgOEuDTbZwO9nv87tzS7z5SDXfWJVRZNWjF1XoQ_ofQd47iFTGJGgl3yTW-QyAovOvmTkyV8uH4c6lW2CdqVE7_n2m5uQaqiUoCFmO5-gowlJRIkAC28WlPi9QKm_g7zVIHdfTbzU5fq4nUX7X1094Qe7-oSDO9QsXSY-RI" />
                  <div className="h-7 w-7 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold border-2 border-surface-container-low">+2</div>
                </div>
                <button type="button" className="w-full py-2 text-sm font-label font-semibold text-primary hover:bg-primary/5 rounded transition-colors">View Details</button>
              </div>

              <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-outline-variant transition-transform hover:translate-x-1 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60 font-bold">Draft</span>
                  <span className="text-xs text-on-surface-variant/60">No votes</span>
                </div>
                <h3 className="font-serif text-lg text-on-surface leading-tight mb-3">Sunlit Reading Circle</h3>
                <button type="button" className="w-full py-2 text-sm font-label font-semibold text-on-surface-variant hover:bg-surface-variant/50 rounded transition-colors">Complete Draft</button>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h4 className="font-serif text-xl text-primary mb-2">Editorial Tip</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">Consider leaving a "buffer slot" between intense curations to maintain your intellectual flow.</p>
          </section>
        </aside>

        <section className="col-span-12 lg:col-span-9">
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

          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] ring-1 ring-on-surface/5">
            <div className="calendar-grid bg-surface-container-low/50 border-b border-surface-variant/30">
              <div className="p-4" />
              <div className="p-4 text-center border-l border-surface-variant/20"><span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Mon</span><span className="text-xl font-serif text-on-surface">14</span></div>
              <div className="p-4 text-center border-l border-surface-variant/20 bg-primary/5"><span className="block text-xs font-label uppercase tracking-widest text-primary mb-1">Tue</span><span className="text-xl font-serif text-primary font-bold">15</span></div>
              <div className="p-4 text-center border-l border-surface-variant/20"><span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Wed</span><span className="text-xl font-serif text-on-surface">16</span></div>
              <div className="p-4 text-center border-l border-surface-variant/20"><span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Thu</span><span className="text-xl font-serif text-on-surface">17</span></div>
              <div className="p-4 text-center border-l border-surface-variant/20"><span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Fri</span><span className="text-xl font-serif text-on-surface">18</span></div>
              <div className="p-4 text-center border-l border-surface-variant/20 italic opacity-50"><span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Sat</span><span className="text-xl font-serif text-on-surface">19</span></div>
              <div className="p-4 text-center border-l border-surface-variant/20 italic opacity-50"><span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Sun</span><span className="text-xl font-serif text-on-surface">20</span></div>
            </div>

            <div className="relative h-[600px] overflow-y-auto">
              <div className="absolute inset-0 calendar-grid pointer-events-none"><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10 bg-primary/[0.02]" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div className="border-r border-surface-variant/10" /><div /></div>
              <div className="relative z-10">
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">9:00 AM</div><div className="col-span-7" /></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">10:00 AM</div><div className="col-span-7 h-16 relative"><div className="absolute left-[0.5%] w-[13.5%] top-2 bottom-[-40px] bg-[#fdf2f0] border-l-2 border-primary p-3 rounded-r-lg shadow-sm"><h4 className="text-xs font-bold text-primary truncate">Curatorial Sync</h4><p className="text-[10px] text-primary-container leading-tight mt-1">10:00 - 11:30 AM</p></div></div></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">11:00 AM</div><div className="col-span-7 h-16 relative"><div className="absolute left-[15%] w-[13.5%] top-2 bottom-[-20px] bg-primary text-on-primary p-3 rounded-lg shadow-md z-20"><h4 className="text-xs font-bold truncate">Study Session</h4><p className="text-[10px] text-primary-fixed leading-tight mt-1">11:00 - 12:15 PM</p><div className="mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span><span className="text-[9px] uppercase tracking-tighter">Main Archive</span></div></div></div></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">12:00 PM</div><div className="col-span-7" /></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">1:00 PM</div><div className="col-span-7 h-16 relative"><div className="absolute left-[29.5%] w-[13.5%] top-4 bottom-[-10px] bg-tertiary-fixed border-l-2 border-tertiary p-3 rounded-r-lg"><h4 className="text-xs font-bold text-on-tertiary-fixed truncate">Manifesto Draft</h4><p className="text-[10px] text-on-tertiary-fixed-variant leading-tight mt-1">1:15 - 2:00 PM</p></div></div></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">2:00 PM</div><div className="col-span-7 h-16 relative"><div className="absolute left-[58.5%] w-[13.5%] top-0 bottom-[-30px] bg-[#fdf2f0] border-l-2 border-primary p-3 rounded-r-lg shadow-sm"><h4 className="text-xs font-bold text-primary truncate">Weekly Retro</h4><p className="text-[10px] text-primary-container leading-tight mt-1">2:00 - 3:30 PM</p></div></div></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">3:00 PM</div><div className="col-span-7" /></div>
                <div className="calendar-grid border-b border-surface-variant/10 group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">4:00 PM</div><div className="col-span-7" /></div>
                <div className="calendar-grid group"><div className="p-4 text-right text-[10px] font-label text-on-surface-variant/50 uppercase">5:00 PM</div><div className="col-span-7" /></div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-6 items-center px-4"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant/60">Confirmed Meetings</span></div><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-tertiary" /><span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant/60">Study Blocks</span></div><div className="flex items-center gap-2 opacity-30"><div className="w-2.5 h-2.5 rounded-full bg-outline-variant" /><span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant/60">External Feeds</span></div></div>
        </section>
      </main>

      <footer className="bg-[#f5f4ed] dark:bg-[#141413] border-t-0 py-12">
        <div className="bg-[#e3e3dc] dark:bg-[#30312c] h-[1px] mb-8 max-w-screen-2xl mx-auto w-[90%]" />
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 max-w-screen-2xl mx-auto">
          <div className="mb-6 md:mb-0">
            <span className="font-serif text-lg text-[#9a4021]">SnapSlot</span>
            <p className="font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] mt-2">© 2024 SnapSlot Editorial Archive. All hours curated with intent.</p>
          </div>
          <div className="flex gap-8">
            <a className="font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all" href="#">The Manifesto</a>
            <a className="font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all" href="#">Privacy</a>
            <a className="font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all" href="#">Terms of Service</a>
            <a className="font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all" href="#">Help Study</a>
          </div>
        </div>
      </footer>

      <button type="button" className="fixed bottom-8 right-8 h-16 w-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
