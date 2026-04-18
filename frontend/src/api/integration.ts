import { apiFetch } from './client';

export interface DashboardMeeting {
  meeting_id: string;
  poll_id?: string;
  title: string;
  status: string;
  participants: number;
  created_at: string;
}

export interface DashboardResponse {
  active_meetings: number;
  upcoming_meetings: number;
  open_polls: number;
  recent_meetings: DashboardMeeting[];
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
  proposed_blocks?: Array<{ day: string; time: string }>;
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

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>('/api/dashboard');
}

export function createMeeting(payload: CreateMeetingPayload): Promise<CreateMeetingResponse> {
  return apiFetch<CreateMeetingResponse>('/api/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchPoll(pollId: string): Promise<PollResponse> {
  return apiFetch<PollResponse>(`/api/polls/${pollId}`);
}

export function submitPollVote(pollId: string, payload: VotePayload): Promise<VoteResponse> {
  return apiFetch<VoteResponse>(`/api/polls/${pollId}/votes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
