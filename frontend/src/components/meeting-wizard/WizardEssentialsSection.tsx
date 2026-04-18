export function WizardEssentialsSection() {
  return (
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
  );
}
