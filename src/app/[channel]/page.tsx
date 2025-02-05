'use client';

import React, { useEffect, useState, useRef, JSX } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { Chat } from '@/lib/Chat';
import { Badge } from '@/lib/Badge';
import { SevenTV } from '@/lib/7TV';
import { Emote } from '@/lib/Emote';
import { handleCommand } from '@/lib/Command';

import type { Message } from '@/types/Chat';
import type { STVEmote, TwitchEmoteData } from '@/types/Emote';

const MAX_MESSAGES = 20;

export default function ChatPage() {
	const params = useParams() as { channel: string };
	const channel = params.channel;
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [emotes, setEmotes] = useState<TwitchEmoteData | null>(null);
	const [stvGlobalEmotes, setSTVGlobalEmotes] = useState<STVEmote[] | null>(
		null
	);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [badges, setBadges] = useState<{ global: any; channel: any } | null>(
		null
	);

	useEffect(() => {
		const fetchData = async () => {
			if (!channel) return;

			const chat = new Chat(channel);
			const emote = await Emote.create(channel);
			const badge = await Badge.create(channel);
			const sevenTV = new SevenTV();

			const badges = await badge.fetchBadges();
			const emoteData = await emote.fetchEmotes();
			const stvGlobalEmotes = await sevenTV.fetchGlobalSTVEmotes();

			Badge.addCustomBadge(
				'prodbyeagle',
				'https://cdn.7tv.app/emote/01HY96D5S00005W8H9YKVEMA13/4x.avif'
			);

			setSTVGlobalEmotes(stvGlobalEmotes);
			setBadges(badges);
			setEmotes(emoteData);

			chat.connect();
			chat.onMessage((chatMessage) => {
				handleCommand(chatMessage.message);

				setMessages((prev) => {
					const updatedMessages = [
						...prev,
						{
							username: chatMessage.username,
							displayName: chatMessage.displayName,
							message: chatMessage.message,
							color: chatMessage.color,
							badges: chatMessage.badges,
						},
					];
					return updatedMessages.slice(-MAX_MESSAGES);
				});
			});

			return () => {
				chat.disconnect();
			};
		};

		fetchData();
	}, [channel]);

	const escapeRegExp = (string: string) => {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	};

	const replaceEmotes = (message: string): (string | JSX.Element)[] => {
		const parts: (string | JSX.Element)[] = [];
		let lastIndex = 0;

		const allEmotes = [
			...(emotes ? [...emotes.global, ...emotes.channel] : []),
			...(stvGlobalEmotes || []),
		];

		const regex = new RegExp(
			`\\b(${allEmotes
				.map((emote) => escapeRegExp(emote.name))
				.join('|')})\\b`,
			'g'
		);

		let match: RegExpExecArray | null;
		while ((match = regex.exec(message)) !== null) {
			parts.push(message.substring(lastIndex, match.index));

			const emote = allEmotes.find((e) => e.name === match[0]);

			if (emote) {
				let imageUrl: string | null = null;

				// Prüfe, ob es sich um ein 7TV-Emote handelt
				if ('data' in emote && emote.data?.host?.url) {
					imageUrl = `https:${emote.data.host.url}/4x.webp`;
				} else if ('id' in emote) {
					// Nutze die getEmoteUrl-Methode für Twitch-Emotes
					imageUrl = new Emote(emote.broadcaster_id).getEmoteUrl(
						emote.id,
						'static', // statisch oder animiert
						'3.0', // Skalierung
						'dark' // Thema
					);
				}

				if (imageUrl) {
					parts.push(
						<Image
							key={match.index}
							src={imageUrl}
							alt={emote.name}
							width={14}
							height={16}
							className='inline-block align-middle'
						/>
					);
				}
			}

			lastIndex = regex.lastIndex;
		}
		parts.push(message.substring(lastIndex));
		return parts;
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	return (
		<div className='h-screen text-sm bg-neutral-900 text-neutral-100 p-4 overflow-hidden flex flex-col justify-end'>
			<div>
				{messages.map((msg, index) => (
					<div
						key={index}
						className='mb-1 flex items-center space-x-1'>
						{badges &&
							Object.entries(msg.badges || {}).map(
								([badge, version]) => {
									const badgeUrl = new Badge(
										channel
									).getBadgeUrl(
										badge,
										version as string,
										badges
									);
									return badgeUrl ? (
										<Image
											key={badge}
											src={badgeUrl}
											width={15}
											height={15}
											alt={badge}
											unoptimized
											className='rounded object-contain'
										/>
									) : null;
								}
							)}

						{Badge.getCustomBadge(msg.username) && (
							<Image
								src={Badge.getCustomBadge(msg.username)!}
								width={15}
								height={15}
								alt='Custom Badge'
								unoptimized
								className='rounded object-contain'
							/>
						)}
						<span
							className='font-bold'
							style={{ color: msg.color }}>
							{msg.displayName}
						</span>
						<span className='-ml-1'>:</span>
						<span className='inline-flex flex-wrap'>
							{replaceEmotes(msg.message)}
						</span>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
