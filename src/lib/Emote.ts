import type { TwitchEmoteData, TwitchEmoteSet } from '@/types/Emote';
import { TWITCH_CLIENT_ID } from './Config';
import { Twitch } from './Twitch';

export class Emote {
	private static cache: Map<string, TwitchEmoteData> = new Map();
	private broadcasterId: string;

	constructor(broadcasterId: string) {
		this.broadcasterId = broadcasterId;
		if (!TWITCH_CLIENT_ID) {
			throw new Error(
				'TWITCH_CLIENT_ID must be defined in env variables'
			);
		}
	}

	static async create(username: string): Promise<Emote> {
		const broadcasterId = await Twitch.getBroadcasterId(username);
		return new Emote(broadcasterId);
	}

	async fetchEmotes(): Promise<TwitchEmoteData> {
		if (Emote.cache.has(this.broadcasterId)) {
			return Emote.cache.get(this.broadcasterId)!;
		}

		const token = await Twitch.getAccessToken();

		const [globalEmotes, channelEmotes] = await Promise.all([
			this.fetchGlobalEmotes(token),
			this.fetchChannelEmotes(token),
		]);

		const emoteData: TwitchEmoteData = {
			global: globalEmotes,
			channel: channelEmotes,
		};
		Emote.cache.set(this.broadcasterId, emoteData);
		return emoteData;
	}

	private async fetchGlobalEmotes(token: string): Promise<TwitchEmoteSet[]> {
		const res = await fetch(
			'https://api.twitch.tv/helix/chat/emotes/global',
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Client-Id': TWITCH_CLIENT_ID,
				},
			}
		);

		if (!res.ok) {
			throw new Error(
				`Failed to fetch global emotes: ${res.status} ${res.statusText}`
			);
		}

		const json = await res.json();
		return json.data;
	}

	private async fetchChannelEmotes(token: string): Promise<TwitchEmoteSet[]> {
		const url = new URL('https://api.twitch.tv/helix/chat/emotes');
		url.searchParams.append('broadcaster_id', this.broadcasterId);

		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${token}`,
				'Client-Id': TWITCH_CLIENT_ID,
			},
		});

		if (!res.ok) {
			throw new Error(
				`Failed to fetch channel emotes: ${res.status} ${res.statusText}`
			);
		}

		const json = await res.json();
		return json.data;
	}

	getEmoteUrl(
		emoteId: string,
		format: 'static' | 'animated',
		scale: '1.0' | '2.0' | '3.0',
		themeMode: 'light' | 'dark'
	): string {
		return `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/${format}/${themeMode}/${scale}`;
	}
}
