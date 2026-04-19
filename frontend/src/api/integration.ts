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

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  organizer_name?: string;
  is_draft?: boolean;
  duration_minutes?: number;
  location?: string;
  participants_count?: number;
  expiration?: string;
  auto_venue?: boolean;
  venue_recommendations_count?: number;
  proposed_blocks?: Array<{
    day: string;
    time?: string;
    start_time?: string;
    end_time?: string;
  }>;
}

export interface CreateMeetingResponse {
  meeting_id: string;
  poll_id: string;
  status: string;
  message: string;
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

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/api/dashboard");
}

export function createMeeting(
  payload: CreateMeetingPayload,
): Promise<CreateMeetingResponse> {
  return apiFetch<CreateMeetingResponse>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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

export function fetchMeetingDetails(meetingId: string): Promise<MeetingDetailsResponse> {
  return apiFetch<MeetingDetailsResponse>(`/meetings/${meetingId}/details`);
}
