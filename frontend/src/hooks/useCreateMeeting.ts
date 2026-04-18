import { useEffect, useState } from 'react';
import { createMeeting } from '../api/integration';
import { ApiError } from '../api/client';

interface UseCreateMeetingParams {
  onCreated: (pollId: string, shareLink: string) => void;
}

export function useCreateMeeting({ onCreated }: UseCreateMeetingParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);

  useEffect(() => {
    if (!successMessage || !shareLink) {
      return;
    }

    const pollId = shareLink.split('/').at(-1);
    if (!pollId) {
      return;
    }

    const redirectTimeout = window.setTimeout(() => {
      onCreated(pollId, shareLink);
    }, 1800);

    return () => {
      window.clearTimeout(redirectTimeout);
    };
  }, [onCreated, shareLink, successMessage]);

  async function submitMeeting(
    title: string,
    description?: string,
    duration?: number,
    location?: string,
    participantsCount?: number,
    expiration?: string,
    autoVenue?: boolean,
    venueRecommendationsCount?: number,
    proposedBlocks?: Array<{ day: string; time: string }>,
  ): Promise<void> {
    if (!title.trim()) {
      setErrorMessage('Meeting title is required.');
      setSuccessMessage(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await createMeeting({
        title: title.trim(),
        description: description?.trim() || undefined,
        duration_minutes: duration || undefined,
        location: location?.trim() || undefined,
        participants_count: participantsCount || undefined,
        expiration: expiration || undefined,
        auto_venue: !!autoVenue,
        venue_recommendations_count: venueRecommendationsCount || undefined,
        proposed_blocks: proposedBlocks || [],
      });

      const nextShareLink = `${window.location.origin}/vote/${response.poll_id}`;
      const meetingPollMapRaw = sessionStorage.getItem('snapslot:meeting-poll-map');
      const meetingPollMap = meetingPollMapRaw ? JSON.parse(meetingPollMapRaw) as Record<string, string> : {};
      meetingPollMap[response.meeting_id] = response.poll_id;

      sessionStorage.setItem('snapslot:meeting-poll-map', JSON.stringify(meetingPollMap));
      sessionStorage.setItem('snapslot:last-created-share-link', nextShareLink);

      setShareLink(nextShareLink);
      setDidCopy(false);
      setSuccessMessage(`${response.message} Poll ID: ${response.poll_id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.detail);
      } else {
        setErrorMessage('Failed to create meeting. Please try again.');
      }
      setSuccessMessage(null);
      setShareLink(null);
      setDidCopy(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyLink(): Promise<void> {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setDidCopy(true);
    } catch {
      setDidCopy(false);
      setErrorMessage('Unable to copy automatically. Please copy the link manually.');
    }
  }

  return {
    isSubmitting,
    errorMessage,
    successMessage,
    shareLink,
    didCopy,
    submitMeeting,
    copyLink,
  };
}
