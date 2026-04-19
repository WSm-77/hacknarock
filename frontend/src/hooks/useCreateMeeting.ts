import { useEffect, useState } from "react";
import { createMeeting } from "../api/meetings";
import { ApiError } from "../api/client";

interface UseCreateMeetingParams {
  onCreated: (pollId: string, shareLink: string) => void;
}

export function useCreateMeeting({ onCreated }: UseCreateMeetingParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);

  function parseTimeLabel(
    label: string,
  ): { hours: number; minutes: number } | null {
    const normalized = label.trim().toUpperCase();
    const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!match) {
      return null;
    }

    const rawHours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3];

    if (
      Number.isNaN(rawHours) ||
      Number.isNaN(minutes) ||
      rawHours < 1 ||
      rawHours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    let hours = rawHours % 12;
    if (meridiem === "PM") {
      hours += 12;
    }

    return { hours, minutes };
  }

  function toCanonicalBlocks(
    proposedBlocks: Array<{
      day: string;
      time?: string;
      start_time?: string;
      end_time?: string;
    }>,
  ): Array<{ start_time: string; end_time: string }> {
    const dayOrder: Record<string, number> = {
      MON: 0,
      TUE: 1,
      WED: 2,
      THU: 3,
      FRI: 4,
      SAT: 5,
      SUN: 6,
    };

    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - daysFromMonday);

    return proposedBlocks
      .map((block) => {
        const dayKey = String(block.day || "")
          .trim()
          .toUpperCase();
        const startLabel =
          typeof block.start_time === "string" ? block.start_time : null;
        const endLabel =
          typeof block.end_time === "string" ? block.end_time : null;
        if (
          !dayKey ||
          startLabel === null ||
          endLabel === null ||
          dayOrder[dayKey] === undefined
        ) {
          return null;
        }

        const parsedStart = parseTimeLabel(startLabel);
        const parsedEnd = parseTimeLabel(endLabel);
        if (!parsedStart || !parsedEnd) {
          return null;
        }

        const dateForDay = new Date(monday);
        dateForDay.setDate(monday.getDate() + dayOrder[dayKey]);

        const startDate = new Date(
          Date.UTC(
            dateForDay.getFullYear(),
            dateForDay.getMonth(),
            dateForDay.getDate(),
            parsedStart.hours,
            parsedStart.minutes,
            0,
          ),
        );
        const endDate = new Date(
          Date.UTC(
            dateForDay.getFullYear(),
            dateForDay.getMonth(),
            dateForDay.getDate(),
            parsedEnd.hours,
            parsedEnd.minutes,
            0,
          ),
        );

        if (startDate >= endDate) {
          return null;
        }

        return {
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
        };
      })
      .filter(
        (block): block is { start_time: string; end_time: string } =>
          block !== null,
      );
  }

  function buildDeadline(expiration?: string): string {
    if (expiration && /^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
      return `${expiration}T23:59:59Z`;
    }

    const fallback = new Date();
    fallback.setUTCDate(fallback.getUTCDate() + 7);
    return fallback.toISOString();
  }

  useEffect(() => {
    if (!successMessage || !shareLink) {
      return;
    }

    const pollId = shareLink.split("/").at(-1);
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
    isDraft: boolean,
    description?: string,
    duration?: number,
    location?: string,
    participantsCount?: number,
    expiration?: string,
    autoVenue?: boolean,
    venueRecommendationsCount?: number,
    proposedBlocks?: Array<{
      day: string;
      time?: string;
      start_time?: string;
      end_time?: string;
    }>,
  ): Promise<boolean> {
    if (!title.trim()) {
      setErrorMessage("Meeting title is required.");
      setSuccessMessage(null);
      return false;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const canonicalBlocks = toCanonicalBlocks(proposedBlocks || []);
      if (canonicalBlocks.length === 0) {
        setErrorMessage("At least one valid proposed time range is required.");
        setSuccessMessage(null);
        setShareLink(null);
        setDidCopy(false);
        return false;
      }

      const response = await createMeeting({
        meeting_title: title.trim(),
        description: description?.trim() || undefined,
        duration_minutes: duration || 30,
        location: location?.trim() || "TBD",
        proposed_blocks: canonicalBlocks,
        availability_deadline: buildDeadline(expiration || undefined),
      });

      const nextShareLink = `${window.location.origin}${response.public_link}`;
      sessionStorage.setItem("snapslot:last-created-share-link", nextShareLink);

      setShareLink(nextShareLink);
      setDidCopy(false);
      setSuccessMessage(`Meeting created. Meeting ID: ${response.id}`);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.detail);
      } else {
        setErrorMessage("Failed to create meeting. Please try again.");
      }
      setSuccessMessage(null);
      setShareLink(null);
      setDidCopy(false);
      return false;
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
      setErrorMessage(
        "Unable to copy automatically. Please copy the link manually.",
      );
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
