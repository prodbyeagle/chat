/**
 * Represents a message in the Twitch chat.
 */
export interface Message {
	/**
	 * The username of the user who sent the message.
	 */
	username: string;

	/**
	 * The display name of the user who sent the message.
	 */
	displayName: string;

	/**
	 * The content of the message.
	 */
	message: string;

	/**
	 * The color associated with the username (usually for display purposes).
	 */
	color: string;

	/**
	 * A record of badges the user has, where the key is the badge name
	 * and the value is the badge version or identifier (or undefined if no badge).
	 */
	badges: Record<string, string | undefined>;
}
