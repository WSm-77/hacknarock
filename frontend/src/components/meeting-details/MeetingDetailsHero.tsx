import { MEETING_DECOR_IMAGE } from './data';

interface MeetingDetailsHeroProps {
  meetingId?: string;
}

export function MeetingDetailsHero({ meetingId }: MeetingDetailsHeroProps) {
  return (
    <section className="bg-surface-container-lowest py-24 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none overflow-hidden">
        <img
          alt="decorative illustration"
          className="w-full h-full object-contain object-right-top grayscale scale-150 rotate-12"
          src={MEETING_DECOR_IMAGE}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="relative inline-block">
            <div className="stamp border-4 border-tertiary-container/40 rounded-full px-6 py-2 text-tertiary-container/60 font-serif font-bold text-xl uppercase tracking-widest mb-4 inline-block">
              Approved
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary-fixed rounded-full">
            <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="font-label text-label-md text-on-tertiary-fixed">Consensus Reached</span>
          </div>
        </div>

        <h1 className="font-headline text-display-lg text-on-surface mb-6 font-medium leading-tight">
          Tuesday, Oct 12th <br /> <span className="text-primary italic text-6xl font-serif">@ 2:00 PM</span>
        </h1>

        <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-4">
          A definitive alignment of schedules. The greedy algorithm finalized this slot based on 80% interest from key stakeholders.
        </p>

        {meetingId && (
          <p className="font-body text-sm text-on-surface-variant/70 mb-12">
            Meeting reference: {meetingId}
          </p>
        )}

        <div className="flex justify-center gap-4">
          <button className="bg-primary text-on-primary font-label text-title-lg font-semibold rounded-lg px-[32px] py-[16px] flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.15)] bg-gradient-to-r from-primary to-[#b95837]" type="button">
            <span className="material-symbols-outlined">event_available</span>
            Add to Calendar
          </button>
        </div>
      </div>
    </section>
  );
}
