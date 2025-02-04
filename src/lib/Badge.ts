import type { BadgeData, TwitchBadgeSet } from '@/types/Badge';
import { TWITCH_CLIENT_ID } from './Config';
import { Twitch } from './Twitch';

export class Badge {
	private static cache: Map<string, BadgeData> = new Map();
	private broadcasterId: string;

	constructor(broadcasterId: string) {
		this.broadcasterId = broadcasterId;
		if (!TWITCH_CLIENT_ID) {
			throw new Error(
				'TWITCH_CLIENT_ID must be defined in env variables'
			);
		}
	}

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

	private transformBadgeArrayToMap(
		badgeArray: TwitchBadgeSet[]
	): Record<string, TwitchBadgeSet> {
		const badgeMap: Record<string, TwitchBadgeSet> = {};
		for (const badge of badgeArray) {
			badgeMap[badge.set_id] = badge;
		}
		return badgeMap;
	}

	getBadgeUrl(
		badgeName: string,
		version: string,
		badgeData: BadgeData
	): string | null {
		const channelBadge = badgeData.channel[badgeName];
		if (channelBadge) {
			const found = channelBadge.versions.find((v) => v.id === version);
			if (found) return found.image_url_1x;
		}
		const globalBadge = badgeData.global[badgeName];
		if (globalBadge) {
			const found = globalBadge.versions.find((v) => v.id === version);
			if (found) return found.image_url_1x;
		}
		return null;
	}
}
