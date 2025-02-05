/**
 * Represents a version of a Twitch badge.
 */
export interface TwitchBadgeVersion {
	/**
	 * The unique identifier for the badge version.
	 */
	id: string;

	/**
	 * The URL for the 1x resolution image of the badge.
	 */
	image_url_1x: string;

	/**
	 * The URL for the 2x resolution image of the badge.
	 */
	image_url_2x: string;

	/**
	 * The URL for the 4x resolution image of the badge.
	 */
	image_url_4x: string;

	/**
	 * The title of the badge version.
	 */
	title: string;

	/**
	 * A description of the badge version.
	 */
	description: string;

	/**
	 * The action to be performed when the badge is clicked, or null if no action.
	 */
	click_action: string | null;

	/**
	 * The URL to be opened when the badge is clicked, or null if no URL.
	 */
	click_url: string | null;
}

/**
 * Represents a set of Twitch badges, which includes multiple versions of a badge.
 */
export interface TwitchBadgeSet {
	/**
	 * The unique identifier for the badge set.
	 */
	set_id: string;

	/**
	 * The list of badge versions for this set.
	 */
	versions: TwitchBadgeVersion[];
}

/**
 * Represents the badge data for both global and channel-specific badges.
 */
export interface BadgeData {
	/**
	 * A record of global badges, where the key is the badge name and the value is the badge set.
	 */
	global: Record<string, TwitchBadgeSet>;

	/**
	 * A record of channel-specific badges, where the key is the badge name and the value is the badge set.
	 */
	channel: Record<string, TwitchBadgeSet>;
}
