import tmi from 'tmi.js';
import type { Message } from '@/types/Chat';

export class Chat {
	private client: tmi.Client;
	private channel: string;
	private isConnected = false;

	constructor(channel: string) {
		this.channel = channel;
		this.client = new tmi.Client({
			connection: { reconnect: true },
			channels: [channel],
		});
	}

	async connect() {
		if (this.isConnected) return;
		try {
			await this.client.connect();
			this.isConnected = true;
		} catch (error) {
			console.error('Chat connection failed:', error);
		}
	}

	async disconnect() {
		if (!this.isConnected) return;
		try {
			await this.client.disconnect();
			this.isConnected = false;
		} catch (error) {
			console.error('Chat disconnection failed:', error);
		}
	}

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

	onTimeout(callback: (username: string, duration: string) => void) {
		this.client.on('timeout', (username, duration) => {
			callback(username, duration);
		});
	}

	onBan(callback: (username: string) => void) {
		this.client.on('ban', (username) => {
			callback(username);
		});
	}

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
