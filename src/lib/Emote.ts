import type { TwitchEmoteData, TwitchEmoteSet } from '@/types/Emote';
import { TWITCH_CLIENT_ID } from './Config';
import { Twitch } from './Twitch';

/**
 * Manages the retrieval and caching of Twitch emotes for broadcasters.
 * Handles both global and channel-specific emotes.
 */
export class Emote {
	private static cache: Map<string, TwitchEmoteData> = new Map();
	private broadcasterId: string;

	/**
	 * Creates an instance of the Emote class for a specific broadcaster.
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
	 * Creates a new `Emote` instance for a given Twitch username by retrieving the broadcaster ID.
	 *
	 * @param username - The username of the broadcaster.
	 * @returns A `Emote` instance for the broadcaster.
	 */
	static async create(username: string): Promise<Emote> {
		const broadcasterId = await Twitch.getBroadcasterId(username);
		return new Emote(broadcasterId);
	}

	/**
	 * Fetches the emotes for the broadcaster, including both global and channel-specific emotes.
	 * Caches the emote data to avoid redundant API calls.
	 *
	 * @returns A promise resolving to the emote data, including global and channel emotes.
	 */
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

	/**
	 * Fetches the global emotes from the Twitch API.
	 *
	 * @param token - The OAuth token to authenticate the API request.
	 * @returns A list of global emotes.
	 * @throws Error if the API request fails.
	 */
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

	/**
	 * Fetches the channel-specific emotes from the Twitch API for the broadcaster.
	 *
	 * @param token - The OAuth token to authenticate the API request.
	 * @returns A list of channel-specific emotes.
	 * @throws Error if the API request fails.
	 */
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

	/**
	 * Constructs the URL for an emote based on the given parameters.
	 *
	 * @param emoteId - The ID of the emote.
	 * @param format - The format of the emote (static or animated).
	 * @returns The constructed URL for the emote.
	 */
	getEmoteUrl(emoteId: string, format: 'static' | 'animated'): string {
		return `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/${format}/dark/3.0`;
	}
}
