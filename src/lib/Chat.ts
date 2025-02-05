import tmi from 'tmi.js';
import type { Message } from '@/types/Chat';

/**
 * Handles Twitch chat functionality, including connecting to the chat, disconnecting,
 * and processing incoming messages.
 */
export class Chat {
	private client: tmi.Client;
	private channel: string;
	private isConnected = false;

	/**
	 * Creates an instance of the Chat class.
	 * @param channel - The Twitch channel to connect to.
	 */
	constructor(channel: string) {
		this.channel = channel;
		this.client = new tmi.Client({
			connection: { reconnect: true },
			channels: [channel],
		});
	}

	/**
	 * Connects to the Twitch chat.
	 * Only establishes the connection if not already connected.
	 * Logs an error if the connection fails.
	 *
	 * @returns A promise indicating the connection status.
	 */
	async connect() {
		if (this.isConnected) return;
		try {
			await this.client.connect();
			this.isConnected = true;
		} catch (error) {
			console.error('Chat connection failed:', error);
		}
	}

	/**
	 * Disconnects from the Twitch chat.
	 * Only disconnects if already connected.
	 * Logs an error if the disconnection fails.
	 *
	 * @returns A promise indicating the disconnection status.
	 */
	async disconnect() {
		if (!this.isConnected) return;
		try {
			await this.client.disconnect();
			this.isConnected = false;
		} catch (error) {
			console.error('Chat disconnection failed:', error);
		}
	}

	/**
	 * Sets up a callback function to handle incoming chat messages.
	 *
	 * @param callback - The function to call with each new chat message.
	 *                   The callback receives a structured `Message` object.
	 */
	onMessage(callback: (chatMessage: Message) => void) {
		this.client.on('message', (channel, userstate, message, self) => {
			if (self) return;
			callback({
				username: userstate.username || 'unknown',
				displayName:
					userstate['display-name'] ||
					userstate.username ||
					'unknown',
				message,
				color:
					userstate.color ||
					this.getDefaultColor(userstate.username || 'unknown'),
				badges: userstate.badges || {},
			});
		});
	}

	/**
	 * Generates a default color based on the username.
	 * The color is chosen from a predefined set of colors based on the username hash.
	 *
	 * @param username - The username used to generate the color.
	 * @returns A hex color string.
	 */
	private getDefaultColor(username: string): string {
		const colors = [
			'#FF4500',
			'#2E8B57',
			'#1E90FF',
			'#8A2BE2',
			'#FFD700',
			'#FF69B4',
		];
		const hash = username
			.split('')
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return colors[hash % colors.length];
	}
}
