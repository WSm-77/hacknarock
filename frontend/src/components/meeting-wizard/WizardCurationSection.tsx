import { useMemo, useState } from 'react';

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function WizardCurationSection() {
  const tomorrowISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  }, []);

  const [expirationPreset, setExpirationPreset] = useState<'1' | '3' | '7' | '14' | 'custom'>('7');
  const [customDate, setCustomDate] = useState(tomorrowISO);
  const [autoVenueEnabled, setAutoVenueEnabled] = useState(false);

  const resolvedExpirationDate = useMemo(() => {
    if (expirationPreset === 'custom') {
      return customDate;
    }

    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + parseInt(expirationPreset, 10));
    return formatDateISO(d);
  }, [expirationPreset, customDate]);

  return (
    <section>
      <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">III. Curation Parameters</h2>
      <div className="space-y-8">
        <div>
          <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="expiration">Link Expiration</label>
          <p className="font-body text-xs text-on-surface-variant mb-3">Encourage timely responses by setting a deadline for submissions.</p>
          <input type="hidden" id="expiration" name="expiration" value={resolvedExpirationDate} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-xs text-on-surface-variant mb-2" htmlFor="expiration-preset">Quick set</label>
              <select
                id="expiration-preset"
                className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow font-body"
                value={expirationPreset}
                onChange={(e) => {
                  const value = e.target.value as '1' | '3' | '7' | '14' | 'custom';
                  setExpirationPreset(value);
                  if (value === 'custom' && !customDate) {
                    setCustomDate(tomorrowISO);
                  }
                }}
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="custom">Pick a specific date</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-xs text-on-surface-variant mb-2" htmlFor="expiration-custom-date">Or pick date</label>
              <input
                id="expiration-custom-date"
                className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow font-body cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                type="date"
                min={tomorrowISO}
                value={customDate}
                onFocus={() => setExpirationPreset('custom')}
                onChange={(e) => {
                  setExpirationPreset('custom');
                  setCustomDate(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 pt-4 border-t border-outline-variant/10">
          <label className="relative flex items-center h-6 mt-1 cursor-pointer" htmlFor="auto-venue">
            <input
              className="peer sr-only"
              id="auto-venue"
              name="auto-venue"
              type="checkbox"
              checked={autoVenueEnabled}
              onChange={(e) => setAutoVenueEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none shadow-sm" />
          </label>
          <div>
            <label className="font-label text-sm font-medium text-on-surface cursor-pointer" htmlFor="auto-venue">Auto-find Venue</label>
            <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed">Let the system analyze participant locations and suggest a neutral venue. You will get few proposals of venues that fit your meeting elements (like participants locations, preferred location, description and number of participants)</p>
          </div>
        </div>
        {autoVenueEnabled && (
          <div>
            <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="venue-recommendations-count">
              Venue recommendations to prepare
            </label>
            <input
              id="venue-recommendations-count"
              name="venue-recommendations-count"
              type="number"
              min={1}
              className="w-full md:w-1/2 bg-surface-container-highest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50 font-body"
              placeholder="e.g., 5"
            />
          </div>
        )}
      </div>
    </section>
  );
}
