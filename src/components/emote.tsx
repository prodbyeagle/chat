import Image from 'next/image';

interface EmoteProps {
	src: string;
	alt: string;
	width: number;
	height: number;
}

export const Emote = ({ src, alt, width, height }: EmoteProps) => (
	<Image
		src={src}
		alt={alt}
		width={width}
		height={height}
		unoptimized
		className='inline-block align-middle'
		style={{ margin: '0 0.25em', verticalAlign: 'middle' }}
	/>
);
