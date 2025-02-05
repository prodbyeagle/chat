import type { BadgeData, TwitchBadgeSet } from '@/types/Badge';
import { TWITCH_CLIENT_ID } from './Config';
import { Twitch } from './Twitch';

/**
 * Manages the retrieval and caching of Twitch badges for broadcasters.
 * Handles both global and channel-specific badges.
 */
export class Badge {
	private static cache: Map<string, BadgeData> = new Map();
	private static customBadges: { username: string; imageUrl: string }[] = [];
	private broadcasterId: string;

	/**
	 * Creates an instance of the Badge class for a specific broadcaster.
	 * Throws an error if the `TWITCH_CLIENT_ID` environment variable is not defined.
	 *
	 * @param broadcasterId - The unique ID of the broadcaster.
	 * @throws Error if `TWITCH_CLIENT_ID` is not defined in the environment variables.
	 */
	constructor(broadcasterId: string) {
		this.broadcasterId = broadcasterId;
		if (!TWITCH_CLIENT_ID) {
			throw new Error(
				'TWITCH_CLIENT_ID must be defined in env variables'
			);
		}
	}

	/**
	 * Creates a new `Badge` instance for a given Twitch username by retrieving the broadcaster ID.
	 *
	 * @param username - The username of the broadcaster.
	 * @returns A `Badge` instance for the broadcaster.
	 */
	static async create(username: string): Promise<Badge> {
		const broadcasterId = await Twitch.getBroadcasterId(username);
		return new Badge(broadcasterId);
	}

	/**
	 * Fetches the badges for the broadcaster, including both global and channel-specific badges.
	 * Caches the badge data to avoid redundant API calls.
	 *
	 * @returns A promise resolving to the badge data, including global and channel badges.
	 */
	async fetchBadges(): Promise<BadgeData> {
		if (Badge.cache.has(this.broadcasterId)) {
			return Badge.cache.get(this.broadcasterId)!;
		}

		const token = await Twitch.getAccessToken();
		const [globalBadges, channelBadges] = await Promise.all([
			this.fetchGlobalBadges(token),
			this.fetchChannelBadges(token),
		]);

		const badgeData: BadgeData = {
			global: globalBadges,
			channel: channelBadges,
		};
		Badge.cache.set(this.broadcasterId, badgeData);
		return badgeData;
	}

	/**
	 * Fetches the global badges from the Twitch API.
	 *
	 * @param token - The OAuth token to authenticate the API request.
	 * @returns A map of global badge sets indexed by badge name.
	 * @throws Error if the API request fails.
	 */
	private async fetchGlobalBadges(
		token: string
	): Promise<Record<string, TwitchBadgeSet>> {
		const res = await fetch(
			'https://api.twitch.tv/helix/chat/badges/global',
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Client-Id': TWITCH_CLIENT_ID,
				},
			}
		);

		if (!res.ok) {
			throw new Error(
				`Failed to fetch global badges: ${res.status} ${res.statusText}`
			);
		}

		const json = await res.json();
		return this.transformBadgeArrayToMap(json.data);
	}

	/**
	 * Fetches the channel-specific badges from the Twitch API for the broadcaster.
	 *
	 * @param token - The OAuth token to authenticate the API request.
	 * @returns A map of channel-specific badge sets indexed by badge name.
	 * @throws Error if the API request fails.
	 */
	private async fetchChannelBadges(
		token: string
	): Promise<Record<string, TwitchBadgeSet>> {
		const url = new URL('https://api.twitch.tv/helix/chat/badges');
		url.searchParams.append('broadcaster_id', this.broadcasterId);

		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${token}`,
				'Client-Id': TWITCH_CLIENT_ID,
			},
		});

		if (!res.ok) {
			throw new Error(
				`Failed to fetch channel badges: ${res.status} ${res.statusText}`
			);
		}

		const json = await res.json();
		return this.transformBadgeArrayToMap(json.data);
	}

	/**
	 * Converts an array of badge sets into a map indexed by badge set ID.
	 *
	 * @param badgeArray - The array of badge sets.
	 * @returns A map of badge sets indexed by set ID.
	 */
	private transformBadgeArrayToMap(
		badgeArray: TwitchBadgeSet[]
	): Record<string, TwitchBadgeSet> {
		const badgeMap: Record<string, TwitchBadgeSet> = {};
		for (const badge of badgeArray) {
			badgeMap[badge.set_id] = badge;
		}
		return badgeMap;
	}

	/**
	 * Retrieves the URL of a specific badge version (4x size) for a given badge name.
	 *
	 * @param badgeName - The name of the badge.
	 * @param version - The version of the badge.
	 * @param badgeData - The badge data, including global and channel badges.
	 * @returns The URL of the 4x version of the badge, or `null` if not found.
	 */
	getBadgeUrl(
		badgeName: string,
		version: string,
		badgeData: BadgeData
	): string | null {
		const channelBadge = badgeData.channel[badgeName];
		if (channelBadge) {
			const found = channelBadge.versions.find((v) => v.id === version);
			if (found) return found.image_url_4x;
		}
		const globalBadge = badgeData.global[badgeName];
		if (globalBadge) {
			const found = globalBadge.versions.find((v) => v.id === version);
			if (found) return found.image_url_4x;
		}
		return null;
	}

	/**
	 * Adds a custom badge for a specific username.
	 *
	 * @param username - The username to associate with the custom badge.
	 * @param imageUrl - The URL of the image for the custom badge.
	 */
	static addCustomBadge(username: string, imageUrl: string) {
		Badge.customBadges.push({ username, imageUrl });
	}

	/**
	 * Retrieves the custom badge image URL for a specific username, if it exists.
	 *
	 * @param username - The username for which to retrieve the custom badge.
	 * @returns The custom badge image URL, or `null` if no custom badge exists for the username.
	 */
	static getCustomBadge(username: string): string | null {
		const badge = Badge.customBadges.find((b) => b.username === username);
		return badge ? badge.imageUrl : null;
	}
}
