import { describe, expect, it } from 'vitest';
import { normalizeHotkey } from '@tanstack/hotkeys';
import { parseSequence, toHotkeyTokens } from '../hotkey-utils.js';

describe('Shortcut Spec Functionality', () => {
	describe('normalizeHotkey', () => {
		it('keeps canonical hotkeys stable', () => {
			expect(normalizeHotkey('Control+S')).toBe('Control+S');
			expect(normalizeHotkey('Shift+Meta+K')).toBe('Shift+Meta+K');
		});
	});

	describe('toHotkeyTokens', () => {
		it('returns normalized token arrays used by action callbacks', () => {
			expect(toHotkeyTokens('Control+S')).toStrictEqual(['control', 's']);
			expect(toHotkeyTokens('Shift+K')).toStrictEqual(['k', 'shift']);
		});
	});

	describe('parseSequence', () => {
		it('normalizes sequence steps', () => {
			expect(parseSequence('control+s meta+shift+k')).toStrictEqual([
				'Control+S',
				'Shift+Meta+K'
			]);
		});

		it('rejects empty sequences', () => {
			expect(() => parseSequence('')).toThrow(/sequence spec cannot be empty/);
		});
	});
});
