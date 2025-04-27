import type { STVEmote, TwitchEmoteData } from '@/types';
import Image from 'next/image';
import { JSX } from 'react';

export const escapeRegExp = (str: string) =>
	str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const escapeHtml = (str: string) =>
	str.replace(/[&<>"'`=\/]/g, (char) => `&#${char.charCodeAt(0)};`);

type TwitchGlobalEmote = TwitchEmoteData['global'][number];
type TwitchChannelEmote = TwitchEmoteData['channel'][number];
type Emote = STVEmote | TwitchGlobalEmote | TwitchChannelEmote;

const getEmoteDimensions = (emote: Emote) => {
	if ('data' in emote && emote.data.host.files.length) {
		const file =
			emote.data.host.files.find((f) => f.name.includes('4x')) ||
			emote.data.host.files[0];
		const targetH = 24;
		const ratio = file.width / file.height;
		return { width: Math.round(targetH * ratio), height: targetH };
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
		: rawSTVGlobal?.emotes ?? [];

	let stvChannel: STVEmote[] = [];
	if (rawSTVChannel) {
		if (Array.isArray(rawSTVChannel)) {
			stvChannel = rawSTVChannel;
		} else if ('emotes' in rawSTVChannel) {
			stvChannel = rawSTVChannel.emotes;
		} else {
			stvChannel = [rawSTVChannel];
		}
	}

	const emoteMap = new Map<string, Emote>();
	if (twitchEmotes) {
		twitchEmotes.global.forEach((e) => emoteMap.set(e.name, e));
		twitchEmotes.channel.forEach((e) => emoteMap.set(e.name, e));
	}
	stvGlobal.forEach((e) => emoteMap.set(e.name, e));
	stvChannel.forEach((e) => emoteMap.set(e.name, e));

	if (emoteMap.size === 0) {
		return [message];
	}

	const pattern = Array.from(emoteMap.keys()).map(escapeRegExp).join('|');
	const regex = new RegExp(`\\b(${pattern})\\b`, 'g');

	const parts: (string | JSX.Element)[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(message)) !== null) {
		parts.push(message.slice(lastIndex, match.index));

		const name = match[1];
		const emote = emoteMap.get(name)!;
		let imageUrl: string | null = null;

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
			<Image
				key={match.index}
				src={imageUrl}
				alt={name}
				width={width}
				height={height}
				unoptimized
				className='inline-block'
				style={{ margin: '0 0.25em' }}
			/>
		);

		lastIndex = regex.lastIndex;
	}

	parts.push(message.slice(lastIndex));
	return parts;
}
