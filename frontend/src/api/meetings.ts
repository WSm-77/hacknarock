import { apiFetch } from './client';

export type MeetingStatus = 'collecting_availability' | 'finalized';

export interface TimeBlockPayload {
  start_time: string;
  end_time: string;
}

export interface MeetingJoinResponse {
  id: string;
  meeting_title: string;
  duration_minutes: number;
  location: string;
  description?: string | null;
  status: MeetingStatus;
  availability_deadline: string;
  proposed_blocks: TimeBlockPayload[];
  public_link: string;
  ai_recommendation?: string | null;
}

export interface SubmitAvailabilityPayload {
  availability: {
    available_blocks: TimeBlockPayload[];
    maybe_blocks: TimeBlockPayload[];
    coordinates?: {
      latitude: number;
      longitude: number;
    } | null;
  };
}

export interface SubmitAvailabilityResponse {
  id: string;
  organizer_id: string;
  status: MeetingStatus;
  availability_deadline: string;
  proposed_blocks: TimeBlockPayload[];
  public_link: string;
  ai_recommendation?: string | null;
}

export function fetchMeetingByPublicToken(publicToken: string): Promise<MeetingJoinResponse> {
  return apiFetch<MeetingJoinResponse>(`/meetings/join/${publicToken}`);
}

export function submitParticipantAvailability(
  publicToken: string,
  payload: SubmitAvailabilityPayload,
): Promise<SubmitAvailabilityResponse> {
  return apiFetch<SubmitAvailabilityResponse>(`/meetings/join/${publicToken}/availability`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
