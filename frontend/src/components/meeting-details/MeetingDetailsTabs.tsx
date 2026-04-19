import type { MeetingTab } from './types';
import type { MeetingDetailsData } from './types';
import { agendaItems, MEETING_DECOR_IMAGE, MEETING_VENUE_IMAGE } from './data';

interface MeetingDetailsTabsProps {
  activeTab: MeetingTab;
  onTabChange: (tab: MeetingTab) => void;
  details?: MeetingDetailsData | null;
}

function formatBlockLabel(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

export function MeetingDetailsTabs({ activeTab, onTabChange, details }: MeetingDetailsTabsProps) {
  const proposedItems = details?.proposed_blocks ?? [];

  return (
    <section className="bg-surface-container-low py-16 px-6 border-t border-outline-variant/20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 relative">
          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-bright p-2">
              <img alt="editor icon" className="w-full h-full object-contain" src={MEETING_DECOR_IMAGE} />
            </div>
            <div className="border-l-2 border-primary/20 pl-6 py-1">
              <h4 className="font-headline text-lg font-medium italic text-on-surface mb-2">Editor&apos;s Note</h4>
              <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
                The stars aligned for Tuesday. Despite the initial spread of conflicting commitments, this specific window emerged as the clear frontrunner, a rare moment of collective availability that we&apos;ve captured for you below.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center -mb-[1px] relative z-10" role="tablist" aria-label="Meeting details tabs">
          <div className="flex">
            <button
              className={`tab-btn px-10 py-4 font-headline text-xl font-medium transition-all duration-300 rounded-t-xl border-t border-l border-r border-outline-variant/30 shadow-sm${activeTab === 'agenda' ? ' active text-on-surface bg-[#f5f4ed]' : ' text-on-surface-variant bg-[#efeee7] hover:bg-[#e8e6dc]'}`}
              id="btn-agenda"
              role="tab"
              aria-selected={activeTab === 'agenda'}
              type="button"
              onClick={() => onTabChange('agenda')}
            >
              Agenda
            </button>
            <button
              className={`tab-btn px-10 py-4 font-headline text-xl font-medium transition-all duration-300 rounded-t-xl border-t border-l border-r border-outline-variant/30 mx-1${activeTab === 'venues' ? ' active text-on-surface bg-[#f5f4ed]' : ' text-on-surface-variant bg-[#efeee7] hover:bg-[#e8e6dc]'}`}
              id="btn-venues"
              role="tab"
              aria-selected={activeTab === 'venues'}
              type="button"
              onClick={() => onTabChange('venues')}
            >
              Venues
            </button>
            <button
              className={`tab-btn px-10 py-4 font-headline text-xl font-medium transition-all duration-300 rounded-t-xl border-t border-l border-r border-outline-variant/30${activeTab === 'email' ? ' active text-on-surface bg-[#f5f4ed]' : ' text-on-surface-variant bg-[#efeee7] hover:bg-[#e8e6dc]'}`}
              id="btn-email"
              role="tab"
              aria-selected={activeTab === 'email'}
              type="button"
              onClick={() => onTabChange('email')}
            >
              Email
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0px_20px_48px_-12px_rgba(86,66,60,0.1)] border border-outline-variant/30 relative" id="tab-container">
          <div className={`tab-content animate-in fade-in duration-500${activeTab === 'agenda' ? ' active' : ''}`} id="agenda" role="tabpanel" aria-labelledby="btn-agenda">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="font-headline text-3xl text-on-surface mb-2 font-medium">Minutes of the Meeting</h2>
                <p className="font-body text-on-surface-variant">
                  {details?.description?.trim() || 'The proposed sequence of events.'}
                </p>
              </div>
              <button className="text-primary/60 hover:text-primary transition-colors" type="button">
                <span className="material-symbols-outlined">edit_note</span>
              </button>
            </div>

            <div className="ledger-line pt-4">
              <ul className="space-y-0">
                {proposedItems.length > 0
                  ? proposedItems.map((item, index) => (
                      <li key={`${item.start_time}-${item.end_time}-${index}`} className="flex gap-8 group">
                        <span className="font-serif italic text-2xl text-primary/80 w-40 shrink-0 text-right">{formatBlockLabel(item.start_time, item.end_time)}</span>
                        <span className="font-headline text-xl text-on-surface py-1">
                          {details?.status === 'ai_recommended' ? 'Recommended window' : 'Proposed window'}
                        </span>
                      </li>
                    ))
                  : agendaItems.map((item) => (
                      <li key={item.time} className="flex gap-8 group">
                        <span className="font-serif italic text-2xl text-primary/80 w-24 shrink-0 text-right">{item.time}</span>
                        <span className="font-headline text-xl text-on-surface py-1">{item.title}</span>
                      </li>
                    ))}
              </ul>
            </div>
          </div>

          <div className={`tab-content space-y-6 animate-in fade-in duration-500${activeTab === 'venues' ? ' active' : ''}`} id="venues" role="tabpanel" aria-labelledby="btn-venues">
            <h2 className="font-headline text-3xl text-on-surface font-medium mb-8">Selected Accommodations</h2>
            <p className="font-body text-on-surface-variant mb-6">
              {details?.location
                ? `Preferred location: ${details.location}${details.participants_count ? ` · ${details.participants_count} participants` : ''}`
                : 'No preferred location provided yet.'}
            </p>
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-surface-bright rounded-lg overflow-hidden flex flex-col sm:row border border-outline-variant/20 hover:border-primary/30 transition-all group">
                <div className="sm:w-56 h-48 sm:h-auto overflow-hidden">
                  <img alt="Cafe interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={MEETING_VENUE_IMAGE} />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <h3 className="font-headline text-2xl text-on-surface font-medium">The Archive Room</h3>
                      <span className="font-body text-xs tracking-widest uppercase text-on-surface-variant">0.4 MILES AWAY</span>
                    </div>
                    <p className="font-body text-body-lg text-on-surface-variant mb-6">
                      {details?.ai_recommendation ?? 'A quiet sanctuary with ample desk space and refined coffee. Ideal for the focused agenda we&apos;ve set.'}
                    </p>
                  </div>
                  <button className="self-start text-primary font-headline text-lg font-medium flex items-center gap-2 group-hover:translate-x-1 transition-transform" type="button">
                    Initiate Reservation <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content space-y-8 animate-in fade-in duration-500${activeTab === 'email' ? ' active' : ''}`} id="email" role="tabpanel" aria-labelledby="btn-email">
            <h2 className="font-headline text-3xl text-on-surface mb-8 font-medium">Formal Notification</h2>
            <div className="bg-surface-bright p-10 rounded-lg border border-outline-variant/20 shadow-inner font-body text-lg text-on-surface-variant relative">
              <button className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors" type="button">
                <span className="material-symbols-outlined">content_copy</span>
              </button>
              <p className="mb-6 pb-4 border-b border-outline-variant/10 font-medium text-on-surface">
                Subject: Notice of Meeting | {details?.title || (details?.id ? `Meeting ${details.id.slice(0, 8)}` : 'Tuesday, Oct 12th')}
              </p>
              <p className="mb-4">Salutations,</p>
              <p className="mb-4">
                I wish to confirm a reservation for {details?.participants_count ? `a party of approximately ${details.participants_count}` : 'the proposed participant group'} on the preferred meeting schedule.
              </p>
              <p className="mb-4">
                {details?.location
                  ? `The preferred location is ${details.location}.`
                  : 'A venue will be selected based on the final meeting details.'}
              </p>
              <p className="mb-8">Your hospitality is much appreciated.</p>
              <p className="font-serif italic text-on-surface">Regards,<br />[Your Name]</p>
            </div>
            <button className="w-full bg-secondary-container text-on-secondary-container font-headline text-lg font-semibold rounded-lg px-[24px] py-[16px] flex justify-center items-center gap-2 hover:bg-secondary-container/80 transition-all border border-secondary-fixed" type="button">
              <span className="material-symbols-outlined">send</span>
              Transmit Correspondence
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
