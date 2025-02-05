import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	env: {
		TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
		TWITCH_TOKEN: process.env.TWITCH_TOKEN,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'static-cdn.jtvnw.net',
				pathname: '/badges/v1/**',
			},
			{
				protocol: 'https',
				hostname: 'static-cdn.jtvnw.net',
				pathname: '/emoticons/v2/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.7tv.app',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
