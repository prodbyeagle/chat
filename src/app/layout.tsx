import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const geistSans = Inter({
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
			<body className={`${geistSans.className} antialiased`}>
				{children}
			</body>
		</html>
	);
}
