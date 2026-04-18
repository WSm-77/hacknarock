/**
 * Dashboard - Home View
 *
 * Converted from static HTML into a React component.
 */
import { PageFooter } from '../components/common/PageFooter';
import { TopNav } from '../components/common/TopNav';
import { ActivePollsPanel } from '../components/dashboard/ActivePollsPanel';
import { CalendarBoard } from '../components/dashboard/CalendarBoard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardLegend } from '../components/dashboard/DashboardLegend';

export function Dashboard() {
  const navLinks = [
    {
      label: 'Archive',
      className: 'font-serif tracking-tight text-[#56423c] dark:text-[#e3e3dc] opacity-70 hover:text-[#9a4021] transition-colors duration-300 ease-in-out',
    },
    {
      label: 'Study',
      className: 'font-serif tracking-tight text-[#56423c] dark:text-[#e3e3dc] opacity-70 hover:text-[#9a4021] transition-colors duration-300 ease-in-out',
    },
    {
      label: 'Curations',
      className: 'font-serif tracking-tight text-[#56423c] dark:text-[#e3e3dc] opacity-70 hover:text-[#9a4021] transition-colors duration-300 ease-in-out',
    },
    {
      label: 'Schedule',
      className: 'font-serif tracking-tight text-[#9a4021] dark:text-[#c96442] font-semibold border-b-2 border-[#9a4021] pb-1',
    },
  ];

  const footerLinks = [
    {
      label: 'The Manifesto',
      className: 'font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all',
    },
    {
      label: 'Privacy',
      className: 'font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all',
    },
    {
      label: 'Terms of Service',
      className: 'font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all',
    },
    {
      label: 'Help Study',
      className: 'font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] hover:text-[#9a4021] hover:underline transition-all',
    },
  ];

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

      <TopNav
        brand="SnapSlot"
        links={navLinks}
        className="bg-[#fbf9f2]/80 dark:bg-[#141413]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)]"
        containerClassName="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto"
        leftClassName="flex items-center gap-8"
        rightClassName="flex items-center gap-4"
        brandClassName="font-serif text-2xl italic text-[#9a4021] dark:text-[#c96442]"
        navClassName="hidden md:flex gap-6 items-center"
        navListClassName="hidden md:flex gap-6 items-center"
        actionArea={(
          <>
            <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">settings</button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/30">
              <img alt="User Librarian Profile" data-alt="close-up portrait of a thoughtful man with glasses in a library setting, warm natural lighting, intellectual aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJSfcdnsyAh93F_7fDKt4C-v0mEu97AMS7yUAd_c6JQe-dceNT3cOV9KTGyD82jZYel0GPI7APNE5Wa6IQc9vvaSRXUqF88-NdzWR3JuFgjoX5PTsZdOGLID-AVSKc7MPTPsJsX0Dl-eGFUwzb_fdq6IxLGukLAPBLgN6IIGirgKB6CighGCC6zlD6gj0uO54-VjoUUn6QR46LkEODyp688o1-Qa3ciTUoUHvmd-5ni9IcWUtvumDMb_V-dOTPNpUdHPz5jQsZOVE8" />
            </div>
            <button type="button" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label font-medium shadow-sm hover:brightness-110 transition-all scale-95 active:scale-90">New Slot</button>
          </>
        )}
      />

      <main className="flex-grow max-w-screen-2xl mx-auto w-full px-8 py-12 grid grid-cols-12 gap-8">
        <ActivePollsPanel />

        <section className="col-span-12 lg:col-span-9">
          <DashboardHeader />
          <CalendarBoard />
          <DashboardLegend />
        </section>
      </main>

      <PageFooter
        className="bg-[#f5f4ed] dark:bg-[#141413] border-t-0 py-12"
        dividerClassName="bg-[#e3e3dc] dark:bg-[#30312c] h-[1px] mb-8 max-w-screen-2xl mx-auto w-[90%]"
        containerClassName="flex flex-col md:flex-row justify-between items-center w-full px-12 max-w-screen-2xl mx-auto"
        brandClassName="font-serif text-lg text-[#9a4021]"
        descriptionClassName="font-sans text-sm leading-relaxed tracking-wide text-[#56423c] dark:text-[#e3e3dc] mt-2"
        linksClassName="flex gap-8"
        links={footerLinks}
        brand="SnapSlot"
        description="© 2024 SnapSlot Editorial Archive. All hours curated with intent."
      />

      <button type="button" className="fixed bottom-8 right-8 h-16 w-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
