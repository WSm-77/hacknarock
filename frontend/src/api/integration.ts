import { apiFetch } from "./client";

export interface DashboardMeeting {
  meeting_id: string;
  poll_id?: string;
  title: string;
  status: string;
  participants: number;
  created_at: string;
}

export interface DashboardPoll {
  meeting_id: string;
  poll_id: string | null;
  title: string;
  status: string;
  participants: number;
  created_at: string;
}

export interface DashboardCalendarMeeting {
  meeting_id: string;
  title: string;
  status: string;
  start_at: string;
  end_at: string;
}

export interface DashboardResponse {
  active_meetings: number;
  upcoming_meetings: number;
  open_polls: number;
  recent_meetings: DashboardMeeting[];
  polls: DashboardPoll[];
  calendar_meetings: DashboardCalendarMeeting[];
}

export interface PollOption {
  option_id: string;
  label: string;
  votes: number;
}

export interface PollResponse {
  poll_id: string;
  meeting_id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
}

export interface VotePayload {
  option_id: string;
  voter_id?: string;
}

export interface VoteResponse {
  poll_id: string;
  option_id: string;
  option_votes: number;
  total_votes: number;
}

export interface MeetingTimeBlock {
  start_time: string;
  end_time: string;
}

export interface MeetingDetailsResponse {
  id: string;
  organizer_id: string;
  organizer_name?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  participants_count?: number | null;
  duration_minutes?: number | null;
  is_draft: boolean;
  created_at?: string | null;
  status: string;
  availability_deadline: string;
  proposed_blocks: MeetingTimeBlock[];
  public_link: string;
  ai_recommendation: string | null;
  votes_count: number;
  auto_find_venue?: boolean;
  venue_recommendations_count?: number | null;
}

export interface ConfirmMeetingResponse {
  meeting_id: string;
  status: string;
  message: string;
}

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/api/dashboard");
}

export function fetchPoll(pollId: string): Promise<PollResponse> {
  return apiFetch<PollResponse>(`/api/polls/${pollId}`);
}

export function submitPollVote(
  pollId: string,
  payload: VotePayload,
): Promise<VoteResponse> {
  return apiFetch<VoteResponse>(`/api/polls/${pollId}/votes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMeetingDetails(
  meetingId: string,
): Promise<MeetingDetailsResponse> {
  return apiFetch<MeetingDetailsResponse>(`/meetings/${meetingId}/details`);
}

export function confirmMeetingFinalize(meetingId: string): Promise<ConfirmMeetingResponse> {
  return apiFetch<ConfirmMeetingResponse>(`/api/meetings/${meetingId}/confirm`, {
    method: 'POST',
  });
}
