import type { STVEmote, TwitchEmoteData } from '@/types';
import { JSX } from 'react';

import { Emote } from '@/components/emote';

export const escapeRegExp = (str: string) =>
	str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const escapeHtml = (str: string) =>
	str.replace(/[&<>"'`=\/]/g, (char) => `&#${char.charCodeAt(0)};`);

type TwitchGlobalEmote = TwitchEmoteData['global'][number];
type TwitchChannelEmote = TwitchEmoteData['channel'][number];
type EmoteType = STVEmote | TwitchGlobalEmote | TwitchChannelEmote;

const getEmoteDimensions = (emote: EmoteType) => {
	if ('data' in emote && emote.data.host.files.length) {
		const file =
			emote.data.host.files.find((f) => f.name.includes('4x')) ||
			emote.data.host.files[0];
		const targetHeight = 24;
		const ratio = file.width / file.height;
		return {
			width: Math.round(targetHeight * ratio),
			height: targetHeight,
		};
	}
	if ('images' in emote && emote.images.url_4x) {
		return { width: 24, height: 24 };
	}
	return { width: 24, height: 24 };
};

/**
 * Replace all Twitch & 7TV emote codes in a message with <Image> tags.
 *
 * @param message The raw chat message.
 * @param twitchEmotes { global: TwitchGlobalEmote[]; channel: TwitchChannelEmote[] } | null
 * @param rawSTVGlobal Either STVEmote[] or { emotes: STVEmote[] } or null
 * @param rawSTVChannel Either STVEmote[], STVEmote, { emotes: STVEmote[] }, or null
 */
export function replaceEmotes(
	message: string,
	twitchEmotes: TwitchEmoteData | null,
	rawSTVGlobal: STVEmote[] | { emotes: STVEmote[] } | null,
	rawSTVChannel: STVEmote[] | STVEmote | { emotes: STVEmote[] } | null
): (string | JSX.Element)[] {
	const stvGlobal: STVEmote[] = Array.isArray(rawSTVGlobal)
		? rawSTVGlobal
		: (rawSTVGlobal?.emotes ?? []);

	const stvChannel: STVEmote[] = Array.isArray(rawSTVChannel)
		? rawSTVChannel
		: rawSTVChannel
			? 'emotes' in rawSTVChannel
				? rawSTVChannel.emotes
				: [rawSTVChannel]
			: [];

	const emoteMap = new Map<string, EmoteType>();

	twitchEmotes?.global.forEach((e) => emoteMap.set(e.name, e));
	twitchEmotes?.channel.forEach((e) => emoteMap.set(e.name, e));
	stvGlobal.forEach((e) => emoteMap.set(e.name, e));
	stvChannel.forEach((e) => emoteMap.set(e.name, e));

	if (emoteMap.size === 0) {
		return [message];
	}

	const pattern = Array.from(emoteMap.keys())
		.map((name) => `(?:^|\\s|[.,!?])${escapeRegExp(name)}(?:$|\\s|[.,!?])`)
		.join('|');

	const regex = new RegExp(pattern, 'g');

	const parts: (string | JSX.Element)[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(message)) !== null) {
		const [fullMatch] = match;
		parts.push(message.slice(lastIndex, match.index));

		const emote = emoteMap.get(fullMatch);
		if (emote) {
			let imageUrl: string;

			if ('data' in emote) {
				const file =
					emote.data.host.files.find((f) => f.name.includes('4x')) ||
					emote.data.host.files[0];
				imageUrl = `https:${emote.data.host.url}/${file.name}`;
			} else {
				imageUrl = emote.images.url_2x;
			}

			const { width, height } = getEmoteDimensions(emote);

			parts.push(
				<Emote
					key={match.index}
					src={imageUrl}
					alt={fullMatch}
					width={width}
					height={height}
				/>
			);
		} else {
			parts.push(fullMatch);
		}

		lastIndex = regex.lastIndex;
	}

	parts.push(message.slice(lastIndex));
	return parts;
}
