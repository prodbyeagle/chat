/**
 * Convert RGB color to HSL.
 * @param r The red channel (0-255).
 * @param g The green channel (0-255).
 * @param b The blue channel (0-255).
 * @returns HSL color object.
 */
const rgbToHsl = (r: number, g: number, b: number) => {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h: number = 0,
		s: number = 0
		const l: number = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return { h, s, l };
};

/**
 * Convert HSL color back to RGB.
 * @param h Hue (0-1).
 * @param s Saturation (0-1).
 * @param l Lightness (0-1).
 * @returns RGB color array [r, g, b].
 */
const hslToRgb = (
	h: number,
	s: number,
	l: number
): [number, number, number] => {
	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l; // achromatic case
	} else {
		const hue2rgb = (p: number, q: number, t: number): number => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Adjusts a color's brightness to ensure it remains within a readable range.
 * @param color The color to adjust (in hex or RGB format).
 * @param minLightness Minimum lightness value (between 0 and 1).
 * @param maxLightness Maximum lightness value (between 0 and 1).
 * @returns The adjusted color in RGB format.
 */
export const adjustColorBrightness = (
	color: string,
	minLightness: number = 0.2,
	maxLightness: number = 0.8
): string => {
	let r: number, g: number, b: number;

	// Check if the input color is in hex or rgb format
	if (color.startsWith('#')) {
		// Hex format: #RRGGBB
		r = parseInt(color.slice(1, 3), 16);
		g = parseInt(color.slice(3, 5), 16);
		b = parseInt(color.slice(5, 7), 16);
	} else if (color.startsWith('rgb')) {
		const rgbValues = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
		if (!rgbValues) throw new Error('Invalid RGB color format');
		r = parseInt(rgbValues[1], 10);
		g = parseInt(rgbValues[2], 10);
		b = parseInt(rgbValues[3], 10);
	} else {
		throw new Error('Unsupported color format');
	}

	const { h, s, l } = rgbToHsl(r, g, b);

	let newLightness = l;
	if (l < minLightness) {
		newLightness = minLightness;
	} else if (l > maxLightness) {
		newLightness = maxLightness;
	}

	const [newR, newG, newB] = hslToRgb(h, s, newLightness);

	return `#${((1 << 24) | (newR << 16) | (newG << 8) | newB)
		.toString(16)
		.slice(1)
		.toUpperCase()}`;
};
