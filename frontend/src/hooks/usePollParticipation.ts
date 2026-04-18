import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { fetchPoll, submitPollVote, type PollResponse } from '../api/integration';

interface UsePollParticipationParams {
  pollId?: string;
}

export function usePollParticipation({ pollId }: UsePollParticipationParams) {
  const [poll, setPoll] = useState<PollResponse | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [voterId, setVoterId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadInitialPoll(): Promise<void> {
      if (!pollId) {
        if (!isCancelled) {
          setErrorMessage('Missing poll ID in route.');
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!isCancelled) {
          setIsLoading(true);
        }

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

    void loadInitialPoll();

    return () => {
      isCancelled = true;
    };
  }, [pollId]);

  async function submitVote(): Promise<void> {
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
      setSelectedOptionId((current) => {
        if (current && refreshedPoll.options.some((option) => option.option_id === current)) {
          return current;
        }
        return refreshedPoll.options[0]?.option_id ?? '';
      });
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

  return {
    poll,
    selectedOptionId,
    setSelectedOptionId,
    voterId,
    setVoterId,
    isLoading,
    isSubmitting,
    errorMessage,
    successMessage,
    submitVote,
  };
}
