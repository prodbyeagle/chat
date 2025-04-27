/**
 * Represents a version of a Twitch badge.
 */
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

/**
 * Represents a set of Twitch badges, which includes multiple versions of a badge.
 */
export interface TwitchBadgeSet {
	set_id: string;
	versions: TwitchBadgeVersion[];
}

/**
 * Represents the badge data for both global and channel-specific badges.
 */
export interface BadgeData {
	global: Record<string, TwitchBadgeSet>;
	channel: Record<string, TwitchBadgeSet>;
}

//! ---
//! ---
//! ---

/**
 * Represents a message in the Twitch chat.
 */
export interface Message {
	username: string;
	displayName: string;
	message: string;
	color: string;
	badges: Record<string, string | undefined>;
}

//! ---
//! ---
//! ---

/**
 * Represents a set of Twitch emotes.
 */
export interface TwitchEmoteSet {
	id: string;
	name: string;
	images: {
		url_1x: string;
		url_2x: string;
		url_4x: string;
	};
	tier?: string;
	emote_type: 'bitstier' | 'follower' | 'subscriptions';
	emote_set_id: string;
	format: ('static' | 'animated')[];
	scale: ('1.0' | '2.0' | '3.0')[];
	theme_mode: ('light' | 'dark')[];
}

/**
 * Represents an STV (7TV) emote.
 */
export type STVEmote = {
	id: string;
	name: string;
	flags: number;
	timestamp: number;
	actor_id: string;
	data: {
		id: string;
		name: string;
		flags: number;
		lifecycle: number;
		state: string[];
		listed: boolean;
		animated: boolean;
		owner: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string;
		};
		host: {
			url: string;
			files: {
				name: string;
				static_name: string;
				width: number;
				height: number;
				frame_count: number;
				size: number;
				format: string;
			}[];
		};
	};
};

/**
 * Represents emote data for both global and channel-specific emotes.
 */
export interface TwitchEmoteData {
	global: TwitchEmoteSet[];
	channel: TwitchEmoteSet[];
}
