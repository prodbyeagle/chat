import tmi from 'tmi.js';
import type { ChatMessage } from '@/types/Chat';

export class Chat {
	private client: tmi.Client;
	private channel: string;

	constructor(channel: string) {
		this.channel = channel;
		this.client = new tmi.Client({
			connection: { reconnect: true },
			channels: [channel],
		});
	}

	async connect() {
		try {
			await this.client.connect();
		} catch (error) {
			console.error('Chat connection failed:', error);
		}
	}

	async disconnect() {
		try {
			await this.client.disconnect();
		} catch (error) {
			console.error('Chat disconnection failed:', error);
		}
	}

	onMessage(callback: (chatMessage: ChatMessage) => void) {
		this.client.on('message', (channel, userstate, message, self) => {
			if (self) return;

			const chatMessage: ChatMessage = {
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
				isMod: userstate.mod === true,
				isSubscriber: userstate.subscriber === true,
				isBroadcaster: userstate.badges?.broadcaster === '1',
				userId: userstate['user-id'] || '',
				timestamp: Number(userstate['tmi-sent-ts']) || Date.now(),
			};

			callback(chatMessage);
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