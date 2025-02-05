/**
 * Represents a set of Twitch emotes.
 */
export interface TwitchEmoteSet {
	/**
	 * The unique identifier for the emote set.
	 */
	id: string;

	/**
	 * The name of the emote set.
	 */
	name: string;

	/**
	 * The URLs for the emote images in different resolutions.
	 */
	images: {
		/**
		 * The URL for the 1x resolution image of the emote.
		 */
		url_1x: string;

		/**
		 * The URL for the 2x resolution image of the emote.
		 */
		url_2x: string;

		/**
		 * The URL for the 4x resolution image of the emote.
		 */
		url_4x: string;
	};

	/**
	 * The tier of the emote, if applicable.
	 * This is optional and may not be present for all emotes.
	 */
	tier?: string;

	/**
	 * The type of the emote, such as a bit tier, follower, or subscription emote.
	 */
	emote_type: 'bitstier' | 'follower' | 'subscriptions';

	/**
	 * The identifier for the emote set.
	 */
	emote_set_id: string;

	/**
	 * The format(s) of the emote, either static or animated.
	 */
	format: ('static' | 'animated')[];

	/**
	 * The available scales for the emote, such as 1x, 2x, or 3x.
	 */
	scale: ('1.0' | '2.0' | '3.0')[];

	/**
	 * The available theme modes for the emote, either light or dark.
	 */
	theme_mode: ('light' | 'dark')[];
}

/**
 * Represents an STV (Streamable) emote.
 */
export type STVEmote = {
	/**
	 * The unique identifier for the emote.
	 */
	id: string;

	/**
	 * The name of the emote.
	 */
	name: string;

	/**
	 * The flags associated with the emote.
	 */
	flags: number;

	/**
	 * The timestamp indicating when the emote was created or updated.
	 */
	timestamp: number;

	/**
	 * The actor ID associated with the emote.
	 */
	actor_id: string;

	/**
	 * Additional data related to the emote.
	 */
	data: {
		/**
		 * The unique identifier for the emote.
		 */
		id: string;

		/**
		 * The name of the emote.
		 */
		name: string;

		/**
		 * The flags associated with the emote.
		 */
		flags: number;

		/**
		 * The lifecycle state of the emote.
		 */
		lifecycle: number;

		/**
		 * The state(s) of the emote.
		 */
		state: string[];

		/**
		 * Whether the emote is listed.
		 */
		listed: boolean;

		/**
		 * Whether the emote is animated.
		 */
		animated: boolean;

		/**
		 * The owner of the emote.
		 */
		owner: {
			/**
			 * The unique identifier of the owner.
			 */
			id: string;

			/**
			 * The username of the owner.
			 */
			username: string;

			/**
			 * The display name of the owner.
			 */
			display_name: string;

			/**
			 * The avatar URL of the owner.
			 */
			avatar_url: string;
		};

		/**
		 * The host URL for the emote.
		 */
		host: {
			/**
			 * The URL of the emote host.
			 */
			url: string;
		};

		/**
		 * The files associated with the emote.
		 */
		files: {
			/**
			 * The name of the file.
			 */
			name: string;

			/**
			 * The static name of the file.
			 */
			static_name: string;

			/**
			 * The width of the emote file.
			 */
			width: number;

			/**
			 * The height of the emote file.
			 */
			height: number;

			/**
			 * The number of frames for the animated emote.
			 */
			frame_count: number;

			/**
			 * The size of the emote file in bytes.
			 */
			size: number;

			/**
			 * The format of the emote file (e.g., WEBP, AVIF or GIF).
			 */
			format: string;
		}[];
	};
};

/**
 * Represents emote data for both global and channel-specific emotes.
 */
export interface TwitchEmoteData {
	/**
	 * A list of global emote sets.
	 */
	global: TwitchEmoteSet[];

	/**
	 * A list of channel-specific emote sets.
	 */
	channel: TwitchEmoteSet[];
}
