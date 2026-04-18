import { SectionTitle } from '../common/SectionTitle';

export function ParticipationCurationSection() {
  return (
    <section>
      <SectionTitle
        number="03"
        title="Curation Parameters"
        wrapperClassName="flex items-center gap-4 mb-8"
        badgeClassName="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container"
        titleClassName="font-serif text-2xl text-[#141413]"
      />
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
  );
}
