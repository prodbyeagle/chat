import type { STVEmote, TwitchEmoteData } from '@/types/Emote';
import Image from 'next/image';
import { JSX } from 'react';

/**
 * Escape special characters in a string for use in a regular expression.
 * @param string The string to escape.
 * @returns The escaped string.
 */
export const escapeRegExp = (string: string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Escape HTML characters in a string to prevent injection.
 * @param string The string to escape.
 * @returns The escaped string.
 */
export const escapeHtml = (string: string) => {
	return string.replace(/[&<>"'`=\/]/g, (char) => `&#${char.charCodeAt(0)};`);
};

/**
 * Replace emotes in a message with images.
 * @param message The message string to process.
 * @param emotes The list of Twitch emotes to match.
 * @param STVGlobalEmotes The list of global 7TV emotes to match.
 * @param STVChannelEmotes The list (or single object / emote set) of channel 7TV emotes.
 * @returns An array of strings and JSX elements, with emotes replaced by images.
 */
export const replaceEmotes = (
	message: string,
	emotes: TwitchEmoteData | null,
	STVGlobalEmotes: STVEmote[] | null,
	STVChannelEmotes: STVEmote[] | STVEmote | { emotes: STVEmote[] } | null
): (string | JSX.Element)[] => {
	const parts: (string | JSX.Element)[] = [];
	let lastIndex = 0;

	console.log('emotes', emotes);

	// Extrahiere Channel-Emotes: Falls ein Emote-Set (Objekt mit "emotes") übergeben wird.
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

	// Kombiniere alle Emotes in ein einziges Array
	const allEmotes = [
		...(emotes ? [...emotes.global, ...emotes.channel] : []),
		...(STVGlobalEmotes || []),
		...channelEmotesArray,
	];

	// Erstelle ein Pattern aus den Emote-Namen
	const pattern = allEmotes
		.map((emote) => escapeRegExp(emote.name))
		.join('|');

	const regex = new RegExp(`(?<=^|\\s)(${pattern})(?=$|\\s)`, 'g');
	const getEmoteDimensions = (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		emote: any
	): { width: number; height: number } => {
		if ('data' in emote && emote.data?.host?.files?.length) {
			const file =
				emote.data.host.files.find((f: any) => f.name.includes('4x')) ||
				emote.data.host.files[0];
			//!FIX: skalierung fixen damit das emote 1 zu 1 bleibt aber die "echten" maße behält und nicht verfälscht wird
			console.log(file.width);
			console.log(file.height);
			return { width: file.width, height: file.height };
		}
		// Für Twitch-Emotes (sofern Dimensionen vorhanden sind)
		else if ('images' in emote && emote.images) {
			return {
				width: emote.images.width || 28,
				height: emote.images.height || 28,
			};
		}
		return { width: 28, height: 28 };
	};

	let match: RegExpExecArray | null;
	while ((match = regex.exec(message)) !== null) {
		parts.push(message.substring(lastIndex, match.index));

		const matchedEmote = match[1];
		const emote = allEmotes.find((e) => e.name === matchedEmote);

		if (emote) {
			let imageUrl: string | null = null;

			// Prüfe, ob es sich um ein 7TV-Emote mit gültiger Host-URL handelt.
			if ('data' in emote && emote.data?.host?.url) {
				imageUrl = `https:${emote.data.host.url}/4x.webp`;
				console.log(`7TV emote image URL: ${imageUrl}`);
			}
			// Für Twitch-Emotes
			else if ('id' in emote && 'images' in emote) {
				imageUrl = emote.images.url_4x;
				console.log(`Twitch emote image URL: ${imageUrl}`);
			}

			if (imageUrl) {
				const dimensions = getEmoteDimensions(emote);
				parts.push(
					<Image
						key={match.index}
						src={imageUrl}
						alt={emote.name}
						width={dimensions.width}
						height={dimensions.height}
						// Margins sorgen für einen kleinen Abstand zwischen Emote und Text.
						style={{ marginLeft: '0.25em', marginRight: '0.25em' }}
						className='inline-block'
					/>
				);
				console.log(`Inserted image for emote: ${emote.name}`);
			}
		}

		lastIndex = regex.lastIndex;
	}
	// Füge den restlichen Text hinzu.
	parts.push(message.substring(lastIndex));
	return parts;
};
