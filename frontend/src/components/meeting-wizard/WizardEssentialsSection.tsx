export function WizardEssentialsSection() {
  return (
    <section>
      <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">I. The Essentials</h2>
      <div className="space-y-6">
        <div>
          <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="meeting-title">Meeting Title</label>
          <input className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body" id="meeting-title" name="meeting-title" placeholder="e.g., Monthly business meeting" type="text" required />
        </div>
        <div>
          <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="description">Context & Agenda</label>
          <p className="font-body text-xs text-on-surface-variant mb-2">Provide meeting purpose, description or key topics. This helps us propose to you an appropriate venue.</p>
          <textarea className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body resize-none" id="description" name="description" placeholder="e.g., Planning with budget discussion, team creative brainstorm, client presentation..." rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="duration">Duration (Optional)</label>
            <div className="relative">
              <select className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 pr-10 text-on-surface focus:ring-2 focus:ring-primary transition-shadow appearance-none font-body" defaultValue="" id="duration" name="duration" style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}>
                <option value="">No minimum duration</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
                <option value="120">2 Hours</option>
                <option value="180">3 Hours</option>
                <option value="240">Half Day (4 Hours)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="location">Preferred Location (Optional)</label>
            <input className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body" id="location" name="location" placeholder="Zoom link or Room Name" type="text" />
            <p className="font-body text-xs text-on-surface-variant mt-2">City, specific place in the city (like city centre)</p>
          </div>
        </div>
        <div>
          <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="participants">Participants (Optional)</label>
          <input
            className="w-full md:w-1/2 bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body"
            id="participants"
            name="participants"
            placeholder="Projected number of participants"
            type="number"
            min={1}
          />
        </div>
      </div>
    </section>
  );
}
