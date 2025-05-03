'use client';

import { TwitchBadgeSet } from '@/types';
import Image from 'next/image';
import { JSX } from 'react';

import { BadgeProvider } from '@/lib/badge-provider';

interface BadgeProps {
	username: string;
	channel: string;
	badges: Record<string, string> | undefined;
	badgeData: {
		global: Record<string, TwitchBadgeSet>;
		channel: Record<string, TwitchBadgeSet>;
	} | null;
}

export const Badge = ({ username, channel, badges, badgeData }: BadgeProps) => {
	if (!badgeData) return null;

	const customBadgeUrl = BadgeProvider.getCustomBadge(username);
	const badgeElements: JSX.Element[] = [];

	if (badges) {
		for (const [badge, version] of Object.entries(badges)) {
			const url = new BadgeProvider(channel).getBadgeUrl(
				badge,
				version ?? '',
				badgeData
			);
			if (url) {
				badgeElements.push(
					<Image
						key={`badge-${badge}`}
						src={url}
						width={20}
						height={20}
						alt={badge}
						unoptimized
						className='rounded object-contain'
					/>
				);
			}
		}
	}

	if (customBadgeUrl) {
		badgeElements.push(
			<Image
				key='custom-badge'
				src={customBadgeUrl}
				width={20}
				height={20}
				alt='Custom Badge'
				unoptimized
				className='rounded object-contain'
			/>
		);
	}

	return <>{badgeElements}</>;
};
