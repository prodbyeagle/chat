import { STVEmote } from '@/types/Emote';
import { Twitch } from './Twitch';

export class SevenTV {
	private baseUrl: string;

	constructor() {
		this.baseUrl = 'https://7tv.io/v3/gql';
	}

	private async fetchTwitchUserId(twitchUsername: string): Promise<string> {
		return await Twitch.getBroadcasterId(twitchUsername);
	}

	public async getSTVUserId(twitchUsername: string) {
		try {
			const twitchUserId = await this.fetchTwitchUserId(twitchUsername);
			const url = `https://7tv.io/v3/users/twitch/${twitchUserId}`;

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
		try {
			const twitchUserId = await this.fetchTwitchUserId(twitchUsername);
			const url = `https://7tv.io/v3/users/twitch/${twitchUserId}`;

			const response = await fetch(url);
			const data = await response.json();

			return data.user;
		} catch (error) {
			console.error(
				`Fehler beim Abrufen der 7TV-Benutzerdaten: ${error}`
			);
			return null;
		}
	}

	public async getSTVChannelEmotes(twitchUsername: string) {
		try {
			const twitchUserId = await this.fetchTwitchUserId(twitchUsername);
			const url = `https://7tv.io/v3/users/twitch/${twitchUserId}`;

			const response = await fetch(url);
			const data = await response.json();

			return data.emote_set;
		} catch (error) {
			console.error(`Fehler beim Abrufen der 7TV Emotes: ${error}`);
			return null;
		}
	}

	public async fetchGlobalSTVEmotes(): Promise<STVEmote[]> {
		try {
			const res = await fetch('https://7tv.io/v3/emote-sets/global');

			if (!res.ok) {
				console.error(
					`Failed to fetch global emotes: ${res.status} ${res.statusText}`
				);
				return [];
			}

			const json = await res.json();
			console.log('[fetchGlobalSTVEmotes]', json);
			return json.data;
		} catch (error) {
			console.error(`Fehler beim Abrufen der globalen Emotes: ${error}`);
			return [];
		}
	}
}
