import type { STVEmote, TwitchEmoteData } from '@/types/Emote';
import Image from 'next/image';
import { JSX } from 'react';

export const escapeRegExp = (string: string) =>
	string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const escapeHtml = (string: string) =>
	string.replace(/[&<>"'`=\/]/g, (char) => `&#${char.charCodeAt(0)};`);

const getEmoteDimensions = (
	emote:
		| STVEmote
		| TwitchEmoteData['global'][number]
		| TwitchEmoteData['channel'][number]
) => {
	if ('data' in emote && emote.data?.host?.files?.length) {
		const file =
			emote.data.host.files.find((f) => f.name.includes('4x')) ||
			emote.data.host.files[0];

		if (file?.width && file?.height) {
			const targetHeight = 24;
			const aspectRatio = file.width / file.height;
			return {
				width: Math.round(targetHeight * aspectRatio),
				height: targetHeight,
			};
		}
	}

	if ('images' in emote && emote.images?.url_4x) {
		return {
			width: 24,
			height: 24,
		};
	}

	return {
		width: 24,
		height: 24,
	};
};

export const replaceEmotes = (
	message: string,
	emotes: TwitchEmoteData | null,
	STVGlobalEmotes: STVEmote[] | null,
	STVChannelEmotes: STVEmote[] | STVEmote | { emotes: STVEmote[] } | null
): (string | JSX.Element)[] => {
	const parts: (string | JSX.Element)[] = [];
	let lastIndex = 0;

	let channelEmotesArray: STVEmote[] = [];
	if (STVChannelEmotes) {
		if (Array.isArray(STVChannelEmotes)) {
			channelEmotesArray = STVChannelEmotes;
		} else if (
			'emotes' in STVChannelEmotes &&
			Array.isArray(STVChannelEmotes.emotes)
		) {
			channelEmotesArray = STVChannelEmotes.emotes;
		} else if ('id' in STVChannelEmotes && 'name' in STVChannelEmotes) {
			channelEmotesArray = [STVChannelEmotes];
		}
	}

	const allEmotes = [
		...(emotes ? [...emotes.global, ...emotes.channel] : []),
		...(STVGlobalEmotes || []),
		...channelEmotesArray,
	];

	const pattern = allEmotes
		.map((emote) => escapeRegExp(emote.name))
		.join('|');

	const regex = new RegExp(`(?<=^|\\s)(${pattern})(?=$|\\s)`, 'g');

	let match: RegExpExecArray | null;
	while ((match = regex.exec(message)) !== null) {
		parts.push(message.substring(lastIndex, match.index));

		const matchedEmote = match[1];
		const emote = allEmotes.find((e) => e.name === matchedEmote);

		if (emote) {
			let imageUrl: string | null = null;

			if ('data' in emote && emote.data?.host?.url) {
				imageUrl = `https:${emote.data.host.url}/4x.webp`;
			} else if ('images' in emote && emote.images?.url_4x) {
				imageUrl = emote.images.url_4x;
			}

			if (imageUrl) {
				const { width, height } = getEmoteDimensions(emote);

				parts.push(
					<Image
						key={match.index}
						src={imageUrl}
						alt={emote.name}
						width={width}
						height={height}
						unoptimized
						style={{ marginLeft: '0.25em', marginRight: '0.25em' }}
						className='inline-block'
					/>
				);
			}
		}

		lastIndex = regex.lastIndex;
	}

	parts.push(message.substring(lastIndex));
	return parts;
};
