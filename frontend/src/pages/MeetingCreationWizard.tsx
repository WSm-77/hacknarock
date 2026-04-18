/**
 * Meeting Creation Wizard - Organizer View
 *
 * Converted from the provided HTML template.
 */
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, logout } from '../api/auth';
import { PageFooter } from '../components/common/PageFooter';
import { TopNav } from '../components/common/TopNav';
import { CreateSuccessPanel } from '../components/meeting-wizard/CreateSuccessPanel';
import { WizardActions } from '../components/meeting-wizard/WizardActions';
import { WizardCurationSection } from '../components/meeting-wizard/WizardCurationSection';
import { WizardEssentialsSection } from '../components/meeting-wizard/WizardEssentialsSection';
import { WizardHeader } from '../components/meeting-wizard/WizardHeader';
import { WizardTimingSection } from '../components/meeting-wizard/WizardTimingSection';
import { useCreateMeeting } from '../hooks/useCreateMeeting';

export function MeetingCreationWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatePage = location.pathname === '/create';
  const {
    isSubmitting,
    errorMessage,
    successMessage,
    shareLink,
    didCopy,
    submitMeeting,
    copyLink,
  } = useCreateMeeting({
    onCreated: (pollId, createdShareLink) => {
      navigate(`/vote/${pollId}`, {
        state: {
          createdShareLink,
        },
      });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get('meeting-title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    await submitMeeting(title, description || undefined);
  }

  async function handleLogout(): Promise<void> {
    try {
      await logout();
    } catch {
      // Best effort revoke; local logout must always succeed.
    }

    clearAuthSession();
    navigate('/login', { replace: true });
  }

  const navLinks = [
    {
      label: 'Dashboard',
      href: '/',
      className: 'text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300',
    },
    {
      label: 'My Polls',
      href: '/',
      className: 'text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300',
    },
  ];

  const footerLinks = [
    {
      label: 'Archive',
      className: 'font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300',
    },
    {
      label: 'Methodology',
      className: 'font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300',
    },
    {
      label: 'Privacy',
      className: 'font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300',
    },
    {
      label: 'Terms',
      className: 'font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300',
    },
  ];

  return (
    <div className="antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed bg-surface text-on-surface">
      <style>{`
        body { font-family: 'Inter', sans-serif; background-color: #fbf9f2; color: #1b1c18; }
        .font-headline { font-family: 'Newsreader', serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f5f4ed; }
        ::-webkit-scrollbar-thumb { background: #dcc1b8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #89726b; }
        .grid-line-x { border-bottom: 1px solid rgba(137, 114, 107, 0.15); }
        .grid-line-y { border-right: 1px solid rgba(137, 114, 107, 0.15); }
        .time-label { transform: translateY(-50%); }
        .slot-selected { background-color: #9a4021 !important; }
      `}</style>

      <TopNav
        brand="SnapSlot"
        links={navLinks}
        className="sticky top-0 w-full z-50 bg-[#fbf9f2]/80 backdrop-blur-md shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)]"
        containerClassName="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto"
        leftClassName="flex items-center gap-8"
        rightClassName="flex items-center gap-4"
        brandClassName="font-serif text-2xl font-medium text-[#141413] tracking-tight hover:opacity-80 transition-opacity"
        navClassName="hidden md:flex gap-6 items-center"
        navListClassName="hidden md:flex gap-6 items-center"
        actionArea={(
          <>
            !isCreatePage && (
            <button
                type="button"
                className="bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300 scale-100 active:scale-[0.98] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] hidden md:inline-flex items-center gap-2"
                onClick={() => navigate('/create')}
              >
                Create New
              </button>
            <button
              type="button"
              className="rounded-lg border border-[#dcc1b8] px-4 py-2 text-sm font-medium text-[#56423c] transition hover:border-[#9a4021] hover:text-[#9a4021]"
              onClick={() => void handleLogout()}
            >
              Logout
            </button>
          </>
          )
        )}
      />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 md:py-24">
        <WizardHeader />

        <div className="bg-surface-container-low rounded-xl p-8 md:p-12 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
            <svg fill="none" height="200" stroke="#9a4021" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" viewBox="0 0 24 24" width="200">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <form className="space-y-16 relative z-10" onSubmit={handleSubmit}>
            <WizardEssentialsSection />
            <WizardTimingSection />
            <WizardCurationSection />
            {errorMessage && (
              <p className="rounded-lg border border-[#9a4021]/20 bg-[#9a4021]/5 px-4 py-3 text-sm text-[#9a4021]">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <CreateSuccessPanel
                didCopy={didCopy}
                onCopy={() => void copyLink()}
                shareLink={shareLink}
                successMessage={successMessage}
              />
            )}
            <WizardActions isSubmitting={isSubmitting} />
          </form>
        </div>
      </main>

      <PageFooter
        className="w-full mt-24 py-12 bg-[#f5f4ed] border-t border-[#dcc1b8]/20"
        containerClassName="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8"
        brandClassName="font-serif italic text-xl text-[#141413]"
        descriptionClassName="font-sans text-sm leading-relaxed text-[#56423c]"
        linksClassName="flex gap-6"
        links={footerLinks}
        brand="SnapSlot"
        description="(c) 2024 SnapSlot. Curated with intention."
      />
    </div>
  );
}
