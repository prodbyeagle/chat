export interface ChatMessage {
	username: string;
	displayName: string;
	message: string;
	color: string;
	badges: Record<string, string | undefined>;
	isMod: boolean;
	isSubscriber: boolean;
	isBroadcaster: boolean;
	userId: string;
	timestamp: number;
}