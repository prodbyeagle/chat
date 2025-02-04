export interface TwitchBadgeVersion {
	id: string;
	image_url_1x: string;
	image_url_2x: string;
	image_url_4x: string;
	title: string;
	description: string;
	click_action: string | null;
	click_url: string | null;
}

export interface TwitchBadgeSet {
	set_id: string;
	versions: TwitchBadgeVersion[];
}

export interface BadgeData {
	global: Record<string, TwitchBadgeSet>;
	channel: Record<string, TwitchBadgeSet>;
}
