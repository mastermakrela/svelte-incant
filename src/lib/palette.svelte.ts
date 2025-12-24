import { PressedKeys } from 'runed';
import { keyToSymbol } from './utils.js';

export type Shortcut = {
	keys: string | string[] | string[][];
	description?: string;
	action: () => void;
	enabled?: boolean;
};

export function isArrayOfArrays(keys: unknown): keys is string[][] {
	return Array.isArray(keys) && keys.length > 0 && Array.isArray(keys[0]);
}

export const slugify = (str: string | string[] | string[][]) => {
	if (typeof str === 'string') return str.toLowerCase().replace(/\s+/g, '-');
	if (isArrayOfArrays(str)) return str.map((inner) => inner.join('-')).join('|');
	return str.join('-').toLowerCase().replace(/\s+/g, '-');
};

export const formatKeysForDisplay = (
	keys: string | string[] | string[][]
): { type: 'kbd' | 'span'; content: string }[] => {
	if (typeof keys === 'string') {
		return [{ type: 'kbd', content: keyToSymbol(keys) }];
	}

	if (isArrayOfArrays(keys)) {
		const result: { type: 'kbd' | 'span'; content: string }[] = [];
		keys.forEach((inner, index) => {
			if (index > 0) {
				result.push({ type: 'span', content: ' or ' });
			}
			// Treat each inner array as a single key combination
			const combinedKeys = inner.map(keyToSymbol).join(' ');
			result.push({ type: 'kbd', content: combinedKeys });
		});
		return result;
	}

	// Handle regular array - treat as single key combination
	const combinedKeys = keys.map(keyToSymbol).join(' ');
	return [{ type: 'kbd', content: combinedKeys }];
};

export const shortcuts = $state<Record<string, Shortcut>>({});

export function add_shortcut(shortcut: Shortcut) {
	console.log(`🦔 ~ add_shortcut ~ add_shortcut:`, shortcut.keys);
	const slug = slugify(shortcut.keys);
	shortcuts[slug] = { ...shortcut, enabled: shortcut.enabled ?? true };
}

export function remove_shortcut(shortcut: Shortcut) {
	console.log(`🦔 ~ remove_shortcut ~ remove_shortcut:`, shortcut.keys);
	const slug = slugify(shortcut.keys);
	delete shortcuts[slug];
}

export function toggle_shortcut(shortcut: Shortcut) {
	const slug = slugify(shortcut.keys);
	if (shortcuts[slug]) {
		shortcuts[slug].enabled = !shortcuts[slug].enabled;
	}
}

// const keys = new PressedKeys();

// $effect.root(() => {
// 	console.log('Registering shortcuts...');
// 	$effect(() => {
// 		for (const shortcut_slug in shortcuts) {
// 			const shortcut = shortcuts[shortcut_slug];
// 			if (!shortcut || shortcut.enabled === false) continue;

// 			if (isArrayOfArrays(shortcut.keys)) {
// 				// Handle array of arrays - register each combination
// 				for (const keyCombo of shortcut.keys) {
// 					console.log(`🦔 ~ keyCombo:`, keyCombo);
// 					keys.onKeys(keyCombo, () => {
// 						if (shortcut.enabled !== false) {
// 							shortcut.action();
// 						}
// 					});
// 				}
// 			} else {
// 				console.log(`🦔 ~ shortcut_slug:`, shortcut_slug);

// 				// Handle existing string or string[] cases
// 				keys.onKeys(shortcut.keys, () => {
// 					if (shortcut.enabled !== false) {
// 						shortcut.action();
// 					}
// 				});
// 			}
// 		}
// 	});
// });
