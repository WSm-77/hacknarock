import type { FormEvent } from 'react';
import type { PollResponse } from '../../api/integration';

interface PollParticipationCardProps {
  poll: PollResponse | null;
  isLoading: boolean;
  isSubmitting: boolean;
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  voterId: string;
  onVoterChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  errorMessage: string | null;
  successMessage: string | null;
}

export function PollParticipationCard({
  poll,
  isLoading,
  isSubmitting,
  selectedOptionId,
  onSelectOption,
  voterId,
  onVoterChange,
  onSubmit,
  errorMessage,
  successMessage,
}: PollParticipationCardProps) {
  return (
    <section className="mb-12 rounded-xl border border-outline-variant/20 bg-surface-container-low p-6">
      <h2 className="font-serif text-2xl text-on-surface mb-3">Poll Participation</h2>
      {isLoading && <p className="text-sm text-on-surface-variant">Loading poll...</p>}
      {!isLoading && poll && (
        <form className="space-y-4" onSubmit={onSubmit}>
          <p className="text-on-surface-variant">{poll.question}</p>
          <div className="space-y-2">
            {poll.options.map((option) => (
              <label key={option.option_id} className="flex cursor-pointer items-center justify-between rounded-lg border border-outline-variant/20 px-4 py-3">
                <span className="flex items-center gap-3">
                  <input
                    checked={selectedOptionId === option.option_id}
                    className="h-4 w-4"
                    name="poll-option"
                    onChange={() => onSelectOption(option.option_id)}
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
            onChange={(event) => onVoterChange(event.target.value)}
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
  );
}
