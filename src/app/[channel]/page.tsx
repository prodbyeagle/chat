'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { Chat } from '@/lib/Chat';
import { Badge } from '@/lib/Badge';
import { SevenTV } from '@/lib/7TV';
import { Emote } from '@/lib/Emote';
import { handleCommand } from '@/lib/Command';

import { replaceEmotes } from '@/utils/emoteUtils';

import type { Message } from '@/types/Chat';
import type { STVEmote, TwitchEmoteData } from '@/types/Emote';
import { adjustColorBrightness } from '@/utils/colorUtils';

const MAX_MESSAGES = 20;

export default function ChatPage() {
	const params = useParams() as { channel: string };
	const channel = params.channel;
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [emotes, setEmotes] = useState<TwitchEmoteData | null>(null);
	const [STVGlobalEmotes, setSTVGlobalEmotes] = useState<STVEmote[] | null>(
		null
	);
	const [STVChannelEmotes, setSTVChannelEmotes] = useState<STVEmote[] | null>(
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

			try {
				const badges = await badge.fetchBadges();
				const emoteData = await emote.fetchEmotes();
				const stvGlobalEmotes = await sevenTV.fetchGlobalSTVEmotes();
				const stvChannelEmotes = await sevenTV.getSTVChannelEmotes(
					channel
				);

				Badge.addCustomBadge(
					'prodbyeagle',
					'https://cdn.7tv.app/emote/01H5ET82KR000B4C7M34K6ZCTK/4x.avif'
				);

				Badge.addCustomBadge(
					'cronxz_tv',
					'https://cdn.7tv.app/emote/01GRKSG9E000091TEC1A28HSM5/4x.webp'
				);

				setSTVGlobalEmotes(stvGlobalEmotes);
				setSTVChannelEmotes(stvChannelEmotes);
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
			} catch (error) {
				console.error('Fehler beim Abrufen der Daten:', error);
			}

			return () => {
				chat.disconnect();
			};
		};

		fetchData();
	}, [channel]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	return (
		//? BG ONLY FOR DEVELOPING (better to see the chat.)
		<div className='h-screen text-xl bg-neutral-900 text-neutral-100 p-4 overflow-hidden flex flex-col justify-end cursor-default select-none'>
			<div>
				{messages.map((msg, index) => (
					<div
						key={index}
						className='my-1 flex items-center space-x-1'>
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
											width={20}
											height={20}
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
								width={20}
								height={20}
								alt='Custom Badge'
								unoptimized
								className='rounded object-contain'
							/>
						)}
						{msg.color && (
							<span
								className='font-semibold'
								style={{
									color: adjustColorBrightness(msg.color),
								}}>
								{msg.displayName}
							</span>
						)}
						<span className='inline-flex flex-wrap'>
							{replaceEmotes(
								msg.message,
								emotes,
								STVGlobalEmotes,
								STVChannelEmotes
							)}
						</span>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
