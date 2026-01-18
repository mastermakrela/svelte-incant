import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ChordRegistry,
	chordRegistry,
	isChordInput,
	normalizeChordSteps,
	slugifyChord
} from '../chord.svelte.js';

describe('Chord Functionality', () => {
	describe('isChordInput', () => {
		it('should return true when object has { isChord: true } property', () => {
			expect(isChordInput({ isChord: true })).toBe(true);
		});

		it('should return false for other types', () => {
			expect(isChordInput(null)).toBe(false);
			expect(isChordInput(undefined)).toBe(false);
			expect(isChordInput('string')).toBe(false);
			expect(isChordInput(123)).toBe(false);
			expect(isChordInput({})).toBe(false);
			expect(isChordInput({ isChord: false })).toBe(false);
			expect(isChordInput({ isChord: 'true' })).toBe(false);
		});
	});

	describe('normalizeChordSteps', () => {
		it('should normalize steps by sorting keys within each step', () => {
			expect(normalizeChordSteps([['meta', 'k'], ['b']])).toStrictEqual([['k', 'meta'], ['b']]);
			expect(normalizeChordSteps([['ctrl', 'shift', 't'], ['a']])).toStrictEqual([
				['ctrl', 'shift', 't'],
				['a']
			]);
			expect(
				normalizeChordSteps([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toStrictEqual([
				['k', 'meta'],
				['ctrl', 'k']
			]);
		});

		it('should handle two step chords', () => {
			expect(normalizeChordSteps([['b'], ['c']])).toStrictEqual([['b'], ['c']]);
			expect(normalizeChordSteps([['a', 'b', 'c'], ['d']])).toStrictEqual([['a', 'b', 'c'], ['d']]);
		});

		it('should handle multi-step chords', () => {
			expect(
				normalizeChordSteps([
					['meta', 'k'],
					['ctrl', 'k']
				])
			).toStrictEqual([
				['k', 'meta'],
				['ctrl', 'k']
			]);
			expect(
				normalizeChordSteps([
					['z', 'y'],
					['b', 'a']
				])
			).toStrictEqual([
				['y', 'z'],
				['a', 'b']
			]);
		});
	});

	describe('slugifyChord', () => {
		it('should create slug with > separator for chord steps', () => {
			expect(slugifyChord([['k', 'meta'], ['b']])).toBe('k-meta>b');
			expect(
				slugifyChord([
					['ctrl', 'k'],
					['ctrl', 'b']
				])
			).toBe('ctrl-k>b-ctrl');
		});

		it('should handle two step chords', () => {
			expect(slugifyChord([['k'], ['b']])).toBe('k>b');
			expect(slugifyChord([['meta', 'k'], ['b']])).toBe('k-meta>b');
		});

		it('should handle multi-step', () => {
			expect(slugifyChord([['k', 'meta'], ['b']])).toBe('k-meta>b');
			expect(slugifyChord([['a'], ['b']])).toBe('a>b');
			expect(
				slugifyChord([
					['ctrl', 'a'],
					['meta', 'b']
				])
			).toBe('a-ctrl>b-meta');
		});

		it('should lowercase and join properly', () => {
			expect(slugifyChord([['Meta', 'K'], ['B']])).toBe('k-meta>b');
			expect(slugifyChord([['CTRL', 'A'], ['B']])).toBe('a-ctrl>b');
			expect(slugifyChord([['Test Key'], ['B']])).toBe('test-key>b');
		});
	});

	describe('ChordRegistry', () => {
		let registry: ChordRegistry;
		let mockAction: () => void;

		beforeEach(() => {
			global.window = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			} as unknown as Window & typeof globalThis;
			registry = chordRegistry;
			Object.keys(registry.chords).forEach((key) => {
				delete registry.chords[key];
			});
			registry.chordOrder = [];
			registry.chordPrefixes = new Set();
			registry.currentProgress = null;
			mockAction = vi.fn() as unknown as () => void;
			vi.spyOn(console, 'warn').mockImplementation(() => {});
		});

		describe('add', () => {
			it('should successfully add a chord', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					description: 'Test chord',
					action: mockAction
				});

				expect(registry.getChords()).toHaveLength(1);
				expect(registry.getChords()[0]?.description).toBe('Test chord');
				expect(registry.chordPrefixes.has('k-meta')).toBe(true);
			});

			it('should add to chordPrefixes set', () => {
				registry.add({
					steps: [['ctrl', 's'], ['a']],
					action: mockAction
				});

				expect(registry.chordPrefixes.has('ctrl-s')).toBe(true);
			});

			it('should warn on collision (duplicate chord)', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					description: 'First chord',
					action: mockAction
				});

				registry.add({
					steps: [['meta', 'k'], ['b']],
					description: 'Second chord',
					action: mockAction
				});

				expect(console.warn).toHaveBeenCalledWith(
					expect.stringContaining('Chord collision detected')
				);
			});

			it('should handle empty steps (warns and does not add)', () => {
				registry.add({
					steps: [],
					action: mockAction
				});

				expect(registry.getChords()).toHaveLength(0);
				expect(console.warn).toHaveBeenCalledWith('Cannot add chord with no steps');
			});

			it('should warn if chord has less than 2 steps', () => {
				registry.add({
					steps: [['meta', 'k']],
					action: mockAction
				});

				expect(registry.getChords()).toHaveLength(0);
				expect(console.warn).toHaveBeenCalledWith('Chords require at least 2 steps');
			});

			it('should set enabled to true by default', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				const chord = registry.getChords()[0];
				expect(chord?.enabled).toBe(true);
			});

			it('should respect enabled property when provided', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					enabled: false,
					action: mockAction
				});

				const chord = registry.getChords()[0];
				expect(chord?.enabled).toBe(false);
			});
		});

		describe('remove', () => {
			it('should successfully remove a chord', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				registry.remove([['meta', 'k'], ['b']]);

				expect(registry.getChords()).toHaveLength(0);
			});

			it('should remove from chordPrefixes if no other chords use that prefix', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				registry.remove([['meta', 'k'], ['b']]);

				expect(registry.chordPrefixes.has('k-meta')).toBe(false);
			});

			it('should keep prefix if other chords use it', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});
				registry.add({
					steps: [['meta', 'k'], ['c']],
					action: mockAction
				});

				registry.remove([['meta', 'k'], ['b']]);

				expect(registry.chordPrefixes.has('k-meta')).toBe(true);
			});

			it('should handle chord not found (warns)', () => {
				registry.remove([['meta', 'k'], ['b']]);

				expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Chord not found'));
			});

			it('should reset currentProgress if removed chord was in progress', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				registry.currentProgress = {
					steps: [['k', 'meta'], ['b']],
					currentIndex: 0,
					expiresAt: Date.now() + 1000
				};

				registry.remove([['meta', 'k'], ['b']]);

				expect(registry.currentProgress).toBeNull();
			});
		});

		describe('toggle', () => {
			it('should toggle enabled state', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				const chord = registry.getChords()[0];
				expect(chord?.enabled).toBe(true);

				registry.toggle([['meta', 'k'], ['b']]);

				expect(registry.getChords()[0]?.enabled).toBe(false);

				registry.toggle([['meta', 'k'], ['b']]);

				expect(registry.getChords()[0]?.enabled).toBe(true);
			});

			it('should handle non-existent chord', () => {
				expect(() => {
					registry.toggle([['meta', 'k'], ['b']]);
				}).not.toThrow();
			});
		});

		describe('isChordPrefix', () => {
			it('should return true for registered chord prefixes', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				expect(registry.isChordPrefix(['k', 'meta'])).toBe(true);
			});

			it('should return false for non-prefixes', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				expect(registry.isChordPrefix(['a', 'b'])).toBe(false);
			});
		});

		describe('findChordForPrefix', () => {
			it('should find chord with matching first step', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					action: mockAction
				});

				const chord = registry.findChordForPrefix(['k', 'meta']);
				expect(chord).not.toBeNull();
				expect(chord?.steps).toStrictEqual([['k', 'meta'], ['b']]);
			});

			it('should return null if no chord found', () => {
				const chord = registry.findChordForPrefix(['a', 'b']);
				expect(chord).toBeNull();
			});

			it('should only return enabled chords', () => {
				registry.add({
					steps: [['meta', 'k'], ['b']],
					enabled: false,
					action: mockAction
				});

				const chord = registry.findChordForPrefix(['k', 'meta']);
				expect(chord).toBeNull();
			});
		});

		describe('slugifyChord', () => {
			it('should create correct slug format with > separator', () => {
				expect(registry.slugifyChord([['meta', 'k'], ['b']])).toBe('k-meta>b');
			});

			it('should handle example: [[meta, k], [b]] → k-meta>b', () => {
				expect(registry.slugifyChord([['meta', 'k'], ['b']])).toBe('k-meta>b');
			});

			it('should handle example: [[ctrl, k], [ctrl, b]] → ctrl-k>b-ctrl', () => {
				expect(
					registry.slugifyChord([
						['ctrl', 'k'],
						['ctrl', 'b']
					])
				).toBe('ctrl-k>b-ctrl');
			});
		});
	});
});
