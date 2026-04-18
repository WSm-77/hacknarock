import { apiFetch } from './client';

export interface TimeBlockPayload {
  start_time: string;
  end_time: string;
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
  status: 'collecting_availability' | 'ready_for_ai' | 'ai_recommended';
  availability_deadline: string;
  proposed_blocks: TimeBlockPayload[];
  public_link: string;
  ai_recommendation?: string | null;
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
