import { apiFetch } from "./client";

export type MeetingStatus =
  | "collecting_availability"
  | "ready_for_ai"
  | "ai_recommended"
  | "finalized";

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

export interface CreateMeetingPayload {
  meeting_title: string;
  duration_minutes: number;
  location: string;
  description?: string;
  proposed_blocks: TimeBlockPayload[];
  availability_deadline: string;
}

export interface CreateMeetingResponse {
  id: string;
  organizer_id: string;
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

export function createMeeting(
  payload: CreateMeetingPayload,
): Promise<CreateMeetingResponse> {
  return apiFetch<CreateMeetingResponse>("/meetings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMeetingByPublicToken(
  publicToken: string,
): Promise<MeetingJoinResponse> {
  return apiFetch<MeetingJoinResponse>(`/meetings/join/${publicToken}`);
}

export function submitParticipantAvailability(
  publicToken: string,
  payload: SubmitAvailabilityPayload,
): Promise<SubmitAvailabilityResponse> {
  return apiFetch<SubmitAvailabilityResponse>(
    `/meetings/join/${publicToken}/availability`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
