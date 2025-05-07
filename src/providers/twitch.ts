import { TWITCH_CLIENT_ID, TWITCH_TOKEN } from '@/lib/config';

/**
 * Handles authentication and API requests to Twitch.
 * Manages OAuth tokens and fetches broadcaster information.
 */
export class TwitchProvider {
	private static token: string | null = null;
	private static tokenExpiresAt: number | null = null;

	/**
	 * Retrieves the access token from Twitch, reusing it if it's still valid.
	 * If the token has expired, it fetches a new one.
	 *
	 * @returns The access token as a string.
	 */
	static async getAccessToken(): Promise<string> {
		if (
			TwitchProvider.token &&
			TwitchProvider.tokenExpiresAt &&
			Date.now() < TwitchProvider.tokenExpiresAt
		) {
			return TwitchProvider.token;
		}

		const tokenData = await TwitchProvider.fetchAccessToken();
		TwitchProvider.token = tokenData.access_token;
		TwitchProvider.tokenExpiresAt =
			Date.now() + tokenData.expires_in * 1000;

		return TwitchProvider.token;
	}

	/**
	 * Fetches a new access token from Twitch using client credentials.
	 *
	 * @throws Error if the client credentials are missing or if the token fetch fails.
	 * @returns The token data, including the access token and expiration time.
	 */
	private static async fetchAccessToken(): Promise<{
		access_token: string;
		expires_in: number;
	}> {
		if (!TWITCH_CLIENT_ID || !TWITCH_TOKEN) {
			throw new Error(
				'TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be defined in env variables'
			);
		}

		const res = await fetch('https://id.twitch.tv/oauth2/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: TWITCH_CLIENT_ID,
				client_secret: TWITCH_TOKEN,
				grant_type: 'client_credentials',
			}),
		});

		if (!res.ok) {
			throw new Error(
				`Failed to get Twitch access token: ${res.status} ${res.statusText}`
			);
		}

		return res.json();
	}

	/**
	 * Retrieves the broadcaster's unique ID based on their Twitch username.
	 *
	 * @param username - The Twitch username of the broadcaster.
	 * @returns The unique broadcaster ID.
	 * @throws Error if the broadcaster is not found or if the API request fails.
	 */
	static async getBroadcasterId(username: string): Promise<string> {
		const token = await TwitchProvider.getAccessToken();

		const res = await fetch(
			`https://api.twitch.tv/helix/users?login=${username}`,
			{
				method: 'GET',
				headers: {
					'Client-ID': TWITCH_CLIENT_ID,
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!res.ok) {
			console.error(
				`Failed to fetch broadcaster ID: ${res.status} ${res.statusText}`
			);
			throw new Error(
				`Failed to fetch broadcaster ID: ${res.status} ${res.statusText}`
			);
		}

		const data = await res.json();
		if (!data?.data?.length) {
			console.error(`No broadcaster found for username: ${username}`);
			throw new Error(`No broadcaster found for username: ${username}`);
		}

		const broadcasterId = data.data[0].id;
		return broadcasterId;
	}
}
