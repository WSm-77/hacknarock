export type MeetingTab = 'agenda' | 'venues' | 'email';

export interface MeetingTimeBlock {
	start_time: string;
	end_time: string;
}

export interface MeetingDetailsData {
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
