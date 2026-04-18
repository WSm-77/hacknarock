export function WizardCurationSection() {
  return (
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
  );
}
