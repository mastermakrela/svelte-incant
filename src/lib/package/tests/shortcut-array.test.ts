import { normalizeHotkey } from '@tanstack/svelte-hotkeys';
import { describe, expect, it } from 'vitest';
import {
	isStepHeld,
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

		// 0.9.0: ParsedHotkey is a union of a logical `key` binding and a physical `code`
		// binding (no `key`). A code-only combo, e.g. from a `recordBy="code"` rebind, must
		// still tokenize instead of throwing on the missing `key` — otherwise it would
		// silently vanish from hold-to-reveal filtering (`filtered_shortcuts` in palette.svelte).
		it('tokenizes a physical-code binding by stripping the Key/Digit prefix', () => {
			expect(toHotkeyTokens('Control+[KeyS]')).toStrictEqual(['control', 's']);
			expect(toHotkeyTokens('Control+[Digit1]')).toStrictEqual(['1', 'control']);
		});

		it('falls back to the lower-cased code for a code with no known label', () => {
			// `Comma`/`BracketLeft`-style codes have no single-character display form, so this
			// is just a readable token for the `action(keys)` callback — it is not layout-aware
			// and is not what held-key matching uses (see `isStepHeld` below).
			expect(toHotkeyTokens('Control+[Comma]')).toStrictEqual(['comma', 'control']);
		});
	});

	describe('isStepHeld', () => {
		it('matches a logical binding when either the modifier or the key is held', () => {
			// Palette filtering is a permissive "any token" match (holding just `Control`
			// surfaces every `Control+*` shortcut) — same OR semantics as before this swap.
			expect(isStepHeld('Control+S', ['control', 's'], {})).toBe(true);
			expect(isStepHeld('Control+S', ['control'], {})).toBe(true);
			expect(isStepHeld('Control+S', ['s'], {})).toBe(true);
			expect(isStepHeld('Control+S', ['x'], {})).toBe(false);
		});

		it('matches a physical-code main key by the held key’s code, not a guessed token', () => {
			// The declared step is `[Comma]`; nothing in `pressedKeyNames` (logical key names)
			// can ever equal `'comma'` on a non-US layout — only `heldCodes` can confirm this.
			// No modifier held here, so this exercises the code path, not the modifier OR.
			expect(isStepHeld('[Comma]', [], { ',': 'Comma' })).toBe(true);
			expect(isStepHeld('[Comma]', [], { m: 'KeyM' })).toBe(false);
		});

		it('still matches a physical-code binding via its modifier alone', () => {
			expect(isStepHeld('Shift+[Comma]', ['shift'], {})).toBe(true);
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
