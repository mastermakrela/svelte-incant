import { describe, it, expect } from 'vitest';
import { isArrayOfArrays, slugify, normalizeKeys } from '../palette.svelte.js';

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

	describe('normalizeKeys', () => {
		it('should handle strings', () => {
			expect(normalizeKeys('test')).toStrictEqual([['test']]);
			expect(normalizeKeys('?')).toStrictEqual([['?']]);
		});

		it('should handle string arrays', () => {
			expect(normalizeKeys(['meta', 'k'])).toStrictEqual([['k', 'meta']]);
			expect(normalizeKeys(['ctrl', 'shift', 't'])).toStrictEqual([['ctrl', 'shift', 't']]);
		});

		it('should sort keys within combos', () => {
			expect(normalizeKeys(['control', 'a'])).toStrictEqual([['a', 'control']]);
			expect(normalizeKeys(['z', 'a', 'm'])).toStrictEqual([['a', 'm', 'z']]);
		});

		it('should handle string[][] arrays', () => {
			expect(normalizeKeys([['?'], ['/']])).toStrictEqual([['?'], ['/']]);
			expect(
				normalizeKeys([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toStrictEqual([
				['k', 'meta'],
				['ctrl', 'k']
			]);
		});

		it('should sort keys within each combo in string[][]', () => {
			expect(
				normalizeKeys([
					['control', 'a'],
					['a', 'control']
				])
			).toStrictEqual([
				['a', 'control'],
				['a', 'control']
			]);
		});
	});

	describe('slugify', () => {
		it('should handle strings', () => {
			expect(slugify('test')).toBe('test');
			expect(slugify('test string')).toBe('test-string');
		});

		it('should handle string arrays', () => {
			expect(slugify(['meta', 'k'])).toBe('k-meta');
		});

		it('should sort keys before slugifying', () => {
			expect(slugify(['control', 'a'])).toBe('a-control');
			expect(slugify(['z', 'a', 'm'])).toBe('a-m-z');
		});

		it('should handle string[][] arrays', () => {
			expect(slugify([['?'], ['/']])).toBe('?|/');
			expect(
				slugify([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toBe('k-meta|ctrl-k');
		});

		it('should handle multiple alternative shortcuts', () => {
			expect(
				slugify([
					['control', 's'],
					['meta', 's']
				])
			).toBe('control-s|meta-s');
		});
	});
});
