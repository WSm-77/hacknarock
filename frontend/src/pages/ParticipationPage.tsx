/**
 * Participation Page - Public Link View
 *
 * Converted from the provided mixed HTML/template content into a React component.
 */
import { PageFooter } from '../components/common/PageFooter';
import { TopNav } from '../components/common/TopNav';
import { ParticipationActions } from '../components/participation/ParticipationActions';
import { ParticipationCurationSection } from '../components/participation/ParticipationCurationSection';
import { ParticipationEssentialsSection } from '../components/participation/ParticipationEssentialsSection';
import { ParticipationHeader } from '../components/participation/ParticipationHeader';
import { ParticipationSummarySidebar } from '../components/participation/ParticipationSummarySidebar';
import { ParticipationTemporalSection } from '../components/participation/ParticipationTemporalSection';

export function ParticipationPage() {
  const navLinks = [
    {
      label: 'Dashboard',
      className: 'text-stone-600 font-sans hover:text-[#141413] transition-all duration-300',
    },
    {
      label: 'Meetings',
      className: 'text-[#9a4021] font-semibold border-b-2 border-[#9a4021] pb-1 transition-all duration-300',
    },
    {
      label: 'Availability',
      className: 'text-stone-600 font-sans hover:text-[#141413] transition-all duration-300',
    },
    {
      label: 'Archives',
      className: 'text-stone-600 font-sans hover:text-[#141413] transition-all duration-300',
    },
  ];

  const footerLinks = [
    {
      label: 'Privacy Policy',
      className: 'text-stone-500 hover:text-stone-800 transition-colors duration-300',
    },
    {
      label: 'Terms of Service',
      className: 'text-stone-500 hover:text-stone-800 transition-colors duration-300',
    },
    {
      label: 'The Archive Blog',
      className: 'text-stone-500 hover:text-stone-800 transition-colors duration-300',
    },
    {
      label: 'Support',
      className: 'text-stone-500 hover:text-stone-800 transition-colors duration-300',
    },
  ];

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <TopNav
        brand="SnapSlot"
        links={navLinks}
        className="bg-[#fbf9f2]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0px_1px_0px_0px_rgba(20,20,19,0.05)] h-20 px-8"
        containerClassName="max-w-screen-2xl mx-auto flex justify-between items-center h-full"
        leftClassName="flex items-center gap-12"
        rightClassName="flex items-center gap-4"
        brandClassName="font-serif text-2xl font-medium tracking-tight text-[#141413]"
        navClassName="hidden md:flex gap-8"
        navListClassName="hidden md:flex gap-8"
        actionArea={(
          <>
            <button type="button" className="px-6 py-2.5 text-stone-600 hover:bg-stone-100/50 rounded-lg transition-all duration-300">Help</button>
            <button type="button" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow-sm hover:bg-primary-container transition-all duration-300">Create New</button>
          </>
        )}
      />

      <main className="max-w-6xl mx-auto px-8 py-16">
        <ParticipationHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-24">
            <ParticipationEssentialsSection />
            <ParticipationTemporalSection />
            <ParticipationCurationSection />
            <ParticipationActions />
          </div>
          <ParticipationSummarySidebar />
        </div>
      </main>

      <PageFooter
        className="bg-[#f5f4ed] mt-32 border-t border-[#dcc1b8]/20 py-12 px-8"
        containerClassName="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"
        brandClassName="text-stone-800 font-serif italic text-lg"
        linksClassName="flex gap-8 text-sm tracking-wide"
        links={footerLinks}
        brand="SnapSlot"
        rightExtra={(
          <p className="text-stone-500 text-xs text-center md:text-right">
            {'© 2024 SnapSlot Editorial Scheduling.'}
            <br />
            Crafted for the unhurried professional.
          </p>
        )}
      />
    </div>
  );
}
