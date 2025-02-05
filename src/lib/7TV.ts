// 7TV.ts

import { STVEmote } from '@/types/Emote';
import { Twitch } from './Twitch';

export class SevenTV {
	private baseUrl: string;
	private globalEmoteUrl: string;

	constructor() {
		this.baseUrl = 'https://7tv.io/v3/gql';
	}

	// private async fetchGraphQL(
	// 	query: string,
	// 	variables: Record<string, unknown> = {}
	// ) {
	// 	const response = await fetch(this.baseUrl, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify({
	// 			query,
	// 			variables,
	// 		}),
	// 	});

	// 	const data = await response.json();

	// 	if (data.errors) {
	// 		throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
	// 	}

	// 	return data.data;
	// }

	public async getSTVUserId(twitchUsername: string) {
		const twitchUserId = await Twitch.getBroadcasterId(twitchUsername);
		const url = `https://7tv.io/v3/users/twitch/${twitchUserId}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.id) {
				return data.id;
			}

			throw new Error(
				`Kein Benutzer mit Twitch-ID ${twitchUserId} auf 7TV gefunden`
			);
		} catch (error) {
			console.error(`Fehler beim Abrufen der 7TV-Benutzer-ID: ${error}`);
			return null;
		}
	}

	public async getSTVUserData(twitchUsername: string) {
		const twitchUserId = await Twitch.getBroadcasterId(twitchUsername);
		const url = `https://7tv.io/v3/users/twitch/${twitchUserId}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			return data.user;
		} catch (error) {
			console.error(`Fehler beim Abrufen der 7TV-Benutzer-ID: ${error}`);
			return null;
		}
	}

	public async getSTVChannelEmotes(twitchUsername: string) {
		const twitchUserId = await Twitch.getBroadcasterId(twitchUsername);
		const url = `https://7tv.io/v3/users/twitch/${twitchUserId}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			return data.emote_set;
		} catch (error) {
			console.error(`Fehler beim Abrufen der 7TV Emotes: ${error}`);
			return null;
		}
	}

	public async fetchGlobalSTVEmotes(): Promise<STVEmote[]> {
		const res = await fetch('https://7tv.io/v3/emote-sets/global');

		if (!res.ok) {
			console.error(
				`Failed to fetch global emotes: ${res.status} ${res.statusText}`
			);
			return [];
		}

		const json = await res.json();
		console.log('7TV Global Emotes:', json);
		return json.data;
	}
}
