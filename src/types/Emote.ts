export interface TwitchEmoteSet {
	id: string;
	name: string;
	images: {
		url_1x: string;
		url_2x: string;
		url_4x: string;
	};
	tier?: string;
	emote_type: 'bitstier' | 'follower' | 'subscriptions';
	emote_set_id: string;
	format: ('static' | 'animated')[];
	scale: ('1.0' | '2.0' | '3.0')[];
	theme_mode: ('light' | 'dark')[];
}

export type STVEmote = {
	id: string;
	name: string;
	flags: number;
	timestamp: number;
	actor_id: string;
	data: {
		id: string;
		name: string;
		flags: number;
		lifecycle: number;
		state: string[];
		listed: boolean;
		animated: boolean;
		owner: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string;
		};
		host: {
			url: string;
		};
		files: {
			name: string;
			static_name: string;
			width: number;
			height: number;
			frame_count: number;
			size: number;
			format: string;
		}[];
	};
};

export interface TwitchEmoteData {
	global: TwitchEmoteSet[];
	channel: TwitchEmoteSet[];
}
