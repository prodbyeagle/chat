import type { Metadata } from 'next';
import { Geist as fonthaha } from 'next/font/google';
import './globals.css';

const font = fonthaha({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'EagleChat',
	description: 'Chat Overlay by @prodbyeagle!',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${font.className} antialiased`}>{children}</body>
		</html>
	);
}
