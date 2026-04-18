/**
 * Participation Page - Public Link View
 *
 * Converted from the provided mixed HTML/template content into a React component.
 */
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { fetchPoll, submitPollVote, type PollResponse } from '../api/integration';
import { PageFooter } from '../components/common/PageFooter';
import { TopNav } from '../components/common/TopNav';
import { ParticipationActions } from '../components/participation/ParticipationActions';
import { ParticipationCurationSection } from '../components/participation/ParticipationCurationSection';
import { ParticipationEssentialsSection } from '../components/participation/ParticipationEssentialsSection';
import { ParticipationHeader } from '../components/participation/ParticipationHeader';
import { ParticipationSummarySidebar } from '../components/participation/ParticipationSummarySidebar';
import { ParticipationTemporalSection } from '../components/participation/ParticipationTemporalSection';

export function ParticipationPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<PollResponse | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [voterId, setVoterId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadPoll(): Promise<void> {
      if (!pollId) {
        setErrorMessage('Missing poll ID in route.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchPoll(pollId);

        if (!isCancelled) {
          setPoll(data);
          setSelectedOptionId(data.options[0]?.option_id ?? '');
          setErrorMessage(null);
        }
      } catch (error) {
        if (!isCancelled) {
          if (error instanceof ApiError) {
            setErrorMessage(error.detail);
          } else {
            setErrorMessage('Failed to load poll data.');
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPoll();

    return () => {
      isCancelled = true;
    };
  }, [pollId]);

  async function handleVoteSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!pollId || !selectedOptionId) {
      setErrorMessage('Please select an option before submitting your vote.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await submitPollVote(pollId, {
        option_id: selectedOptionId,
        voter_id: voterId.trim() || undefined,
      });

      setSuccessMessage(`Vote recorded. Total votes: ${result.total_votes}.`);

      const refreshedPoll = await fetchPoll(pollId);
      setPoll(refreshedPoll);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.detail);
      } else {
        setErrorMessage('Vote submission failed. Please retry.');
      }
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }

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

        <section className="mb-12 rounded-xl border border-outline-variant/20 bg-surface-container-low p-6">
          <h2 className="font-serif text-2xl text-on-surface mb-3">Poll Participation</h2>
          {isLoading && <p className="text-sm text-on-surface-variant">Loading poll...</p>}
          {!isLoading && poll && (
            <form className="space-y-4" onSubmit={handleVoteSubmit}>
              <p className="text-on-surface-variant">{poll.question}</p>
              <div className="space-y-2">
                {poll.options.map((option) => (
                  <label key={option.option_id} className="flex cursor-pointer items-center justify-between rounded-lg border border-outline-variant/20 px-4 py-3">
                    <span className="flex items-center gap-3">
                      <input
                        checked={selectedOptionId === option.option_id}
                        className="h-4 w-4"
                        name="poll-option"
                        onChange={() => setSelectedOptionId(option.option_id)}
                        type="radio"
                        value={option.option_id}
                      />
                      <span>{option.label}</span>
                    </span>
                    <span className="text-sm text-on-surface-variant">{option.votes} votes</span>
                  </label>
                ))}
              </div>

              <label className="block text-sm text-on-surface-variant" htmlFor="voter-id">
                Your identifier (optional)
              </label>
              <input
                className="w-full rounded-lg border border-outline-variant/20 bg-surface px-4 py-3"
                id="voter-id"
                onChange={(event) => setVoterId(event.target.value)}
                placeholder="e.g. alex-team"
                value={voterId}
              />

              <button
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </button>

              <p className="text-xs text-on-surface-variant">Total votes: {poll.total_votes}</p>
            </form>
          )}
          {errorMessage && <p className="mt-4 text-sm text-[#9a4021]">{errorMessage}</p>}
          {successMessage && <p className="mt-4 text-sm text-green-800">{successMessage}</p>}
        </section>

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
