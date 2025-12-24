import { describe, it, expect } from 'vitest';
import { isArrayOfArrays, slugify, formatKeysForDisplay } from '../palette.svelte.js';

describe('Shortcut Array Functionality', () => {
	describe('isArrayOfArrays', () => {
		it('should identify string[][] correctly', () => {
			expect(isArrayOfArrays([['a'], ['b']])).toBe(true);
			expect(
				isArrayOfArrays([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toBe(true);
		});

		it('should reject non-arrays', () => {
			expect(isArrayOfArrays('a')).toBe(false);
			expect(isArrayOfArrays(['a', 'b'])).toBe(false);
			expect(isArrayOfArrays(null)).toBe(false);
			expect(isArrayOfArrays(undefined)).toBe(false);
		});
	});

	describe('slugify', () => {
		it('should handle strings', () => {
			expect(slugify('test')).toBe('test');
			expect(slugify('test string')).toBe('test-string');
		});

		it('should handle string arrays', () => {
			expect(slugify(['meta', 'k'])).toBe('meta-k');
		});

		it('should handle string[][] arrays', () => {
			expect(slugify([['?'], ['/']])).toBe('?|/');
			expect(
				slugify([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toBe('meta-k|ctrl-k');
		});
	});

	describe('formatKeysForDisplay', () => {
		it('should handle strings', () => {
			expect(formatKeysForDisplay('?')).toBe('?');
			expect(formatKeysForDisplay('escape')).toBe('⎋');
		});

		it('should handle string arrays', () => {
			expect(formatKeysForDisplay(['meta', 'k'])).toBe('⌘ K');
			expect(formatKeysForDisplay(['ctrl', 'shift', 't'])).toBe('⌃ ⇧ T');
		});

		it('should handle string[][] arrays', () => {
			expect(formatKeysForDisplay([['?'], ['/']])).toBe('? or /');
			expect(
				formatKeysForDisplay([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toBe('⌘ K or ⌃ K');
		});
	});
});
