import { normalizeHotkey } from '@tanstack/svelte-hotkeys';
import { describe, expect, it } from 'vitest';
import {
	parseSequence,
	toHotkeyTokens,
	toSequence,
	toSequenceStepTokens
} from '../hotkey-utils.js';

describe('Shortcut Spec Functionality', () => {
	describe('normalizeHotkey', () => {
		it('keeps canonical hotkeys stable', () => {
			expect(normalizeHotkey('Control+S', 'mac')).toBe('Control+S');
			expect(normalizeHotkey('Shift+Meta+K', 'windows')).toBe('Shift+Meta+K');
		});

		it('collapses the platform-native modifier to Mod', () => {
			// 0.8.0 normalizes to the platform-adaptive `Mod` token, so a normalized
			// hotkey is platform-dependent and must never be persisted.
			expect(normalizeHotkey('Shift+Meta+K', 'mac')).toBe('Mod+Shift+K');
			expect(normalizeHotkey('Control+S', 'windows')).toBe('Mod+S');
		});
	});

	describe('toHotkeyTokens', () => {
		it('returns normalized token arrays used by action callbacks', () => {
			expect(toHotkeyTokens('Control+S')).toStrictEqual(['control', 's']);
			expect(toHotkeyTokens('Shift+K')).toStrictEqual(['k', 'shift']);
		});

		it('names the space key so it can be matched against held keys', () => {
			expect(toHotkeyTokens('Control+Space')).toStrictEqual(['control', 'space']);
		});
	});

	describe('parseSequence', () => {
		it('normalizes sequence steps', () => {
			expect(parseSequence('control+s meta+shift+k')).toStrictEqual([
				normalizeHotkey('Control+S'),
				normalizeHotkey('Shift+Meta+K')
			]);
		});

		it('rejects empty sequences', () => {
			expect(() => parseSequence('')).toThrow(/sequence spec cannot be empty/);
		});
	});

	describe('toSequence', () => {
		it('normalizes the array form, which is the one that autocompletes', () => {
			expect(toSequence(['Meta+K', 'B'])).toStrictEqual([normalizeHotkey('Meta+K'), 'B']);
		});

		it('accepts the space-separated string form', () => {
			expect(toSequence('Meta+K B')).toStrictEqual(toSequence(['Meta+K', 'B']));
		});

		it('treats blank steps as no chord instead of throwing', () => {
			expect(toSequence('')).toStrictEqual([]);
			expect(toSequence([])).toStrictEqual([]);
		});
	});

	describe('toSequenceStepTokens', () => {
		it('tokenizes every step of a chord', () => {
			expect(toSequenceStepTokens('Control+K B')).toStrictEqual([['control', 'k'], ['b']]);
			expect(toSequenceStepTokens(['Control+K', 'B'])).toStrictEqual([['control', 'k'], ['b']]);
		});
	});
});
