/**
 * Adjusts a color's brightness and converts it to a readable hex color.
 * @param color The color to adjust (in hex or RGB format).
 * @returns The adjusted color in hex format.
 */
export const adjustColorBrightness = (color: string): string => {
	let r: number, g: number, b: number;
	if (color.startsWith('#')) {
		r = parseInt(color.slice(1, 3), 16);
		g = parseInt(color.slice(3, 5), 16);
		b = parseInt(color.slice(5, 7), 16);
	} else if (color.startsWith('rgb')) {
		const rgb = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
		if (!rgb) throw new Error('Invalid RGB color format');
		[r, g, b] = rgb.slice(1, 4).map(Number);
	} else {
		throw new Error('Unsupported color format');
	}

	const [max, min] = [r, g, b]
		.map((c) => c / 255)
		.reduce(
			([max, min], val) => [Math.max(max, val), Math.min(min, val)],
			[0, 1]
		);
	const l = (max + min) / 2;
	let h = 0,
		s = 0;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r / 255:
				h = (g / 255 - b / 255) / d + (g / 255 < b / 255 ? 6 : 0);
				break;
			case g / 255:
				h = (b / 255 - r / 255) / d + 2;
				break;
			case b / 255:
				h = (r / 255 - g / 255) / d + 4;
				break;
		}
		h /= 6;
	}

	const newL = Math.max(0.2, Math.min(0.8, l));

	const c = (1 - Math.abs(2 * newL - 1)) * s;
	const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
	const m = newL - c / 2;
	let newR = 0,
		newG = 0,
		newB = 0;

	if (h >= 0 && h < 1 / 6) [newR, newG, newB] = [c, x, 0];
	else if (h >= 1 / 6 && h < 2 / 6) [newR, newG, newB] = [x, c, 0];
	else if (h >= 2 / 6 && h < 3 / 6) [newR, newG, newB] = [0, c, x];
	else if (h >= 3 / 6 && h < 4 / 6) [newR, newG, newB] = [0, x, c];
	else if (h >= 4 / 6 && h < 5 / 6) [newR, newG, newB] = [x, 0, c];
	else [newR, newG, newB] = [c, 0, x];

	newR = Math.round((newR + m) * 255);
	newG = Math.round((newG + m) * 255);
	newB = Math.round((newB + m) * 255);

	return `#${Number((1 << 24) | (newR << 16) | (newG << 8) | newB)
		.toString(16)
		.slice(1)
		.toUpperCase()}`;
};
