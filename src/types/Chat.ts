export interface Message {
	username: string;
	displayName: string;
	message: string;
	color: string;
	badges: Record<string, string | undefined>;
}