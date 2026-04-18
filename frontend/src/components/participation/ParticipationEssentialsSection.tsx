import { SectionTitle } from '../common/SectionTitle';

export function ParticipationEssentialsSection() {
  return (
    <section>
      <SectionTitle
        number="01"
        title="The Essentials"
        wrapperClassName="flex items-center gap-4 mb-8"
        badgeClassName="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container"
        titleClassName="font-serif text-2xl text-[#141413]"
      />
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
  );
}
