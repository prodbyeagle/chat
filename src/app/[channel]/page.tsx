'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { Chat } from '@/lib/Chat';
import { Badge } from '@/lib/Badge';
import { SevenTV } from '@/lib/7TV';
import { Emote } from '@/lib/Emote';
import { handleCommand } from '@/lib/Command';
import { replaceEmotes } from '@/utils/emoteUtils';
import { adjustColorBrightness } from '@/utils/colorUtils';

import type { Message } from '@/types/Chat';
import type { STVEmote, TwitchEmoteData } from '@/types/Emote';
import type { TwitchBadgeSet } from '@/types/Badge';

const MAX_MESSAGES = 20;

export default function ChatPage() {
	const params = useParams() as { channel: string };
	const channel = params.channel;
	const [messages, setMessages] = useState<Message[]>([]);
	const [emotes, setEmotes] = useState<TwitchEmoteData | null>(null);
	const [STVGlobalEmotes, setSTVGlobalEmotes] = useState<STVEmote[] | null>(
		null
	);
	const [STVChannelEmotes, setSTVChannelEmotes] = useState<STVEmote[] | null>(
		null
	);
	const [badges, setBadges] = useState<{
		global: Record<string, TwitchBadgeSet>;
		channel: Record<string, TwitchBadgeSet>;
	} | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			if (!channel) return;
			const chat = new Chat(channel);
			const emote = await Emote.create(channel);
			const badge = await Badge.create(channel);
			const sevenTV = new SevenTV();

			try {
				const [badgesData, emoteData, stvGlobal, stvChannel] =
					await Promise.all([
						badge.fetchBadges(),
						emote.fetchEmotes(),
						sevenTV.fetchGlobalSTVEmotes(),
						sevenTV.getSTVChannelEmotes(channel),
					]);

				Badge.addCustomBadge(
					'prodbyeagle',
					'https://cdn.7tv.app/emote/01H5ET82KR000B4C7M34K6ZCTK/4x.avif'
				);

				Badge.addCustomBadge(
					'dwhincandi',
					'https://cdn.7tv.app/emote/01F6T920S80004B20PGM3Q1GQS/4x.avif'
				);

				setBadges(badgesData);
				setEmotes(emoteData);
				setSTVGlobalEmotes(stvGlobal);
				setSTVChannelEmotes(stvChannel);

				chat.connect();
				chat.onMessage((chatMessage) => {
					handleCommand(chatMessage.message);
					setMessages((prev) => {
						const next = [
							...prev,
							{
								username: chatMessage.username,
								displayName: chatMessage.displayName,
								message: chatMessage.message,
								color: chatMessage.color,
								badges: chatMessage.badges,
							},
						];
						return next.slice(-MAX_MESSAGES);
					});
				});
			} catch (error) {
				console.error('Fehler beim Abrufen der Daten:', error);
			}

			return () => chat.disconnect();
		};

		fetchData();
	}, [channel]);

	return (
		<div className='h-screen p-4 text-xl text-yellow-50 flex flex-col justify-end overflow-hidden cursor-default select-none'>
			<div className='space-y-1'>
				{messages.map((msg, idx) => (
					<div key={idx} className='flex items-center space-x-1'>
						{badges &&
							Object.entries(msg.badges || {}).map(
								([badge, version]) => {
									const url = new Badge(channel).getBadgeUrl(
										badge,
										version || '',
										badges
									);
									return url ? (
										<Image
											key={badge}
											src={url}
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
			</div>
		</div>
	);
}
