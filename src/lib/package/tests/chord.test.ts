import { KeyStateTracker, SequenceManager } from '@tanstack/hotkeys';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	CHORD_TIMEOUT_MS,
	add_chord,
	chordRegistry,
	get_current_progress,
	isChordInput,
	normalizeChordSteps,
	remove_chord,
	slugifyChord,
	toggle_chord
} from '../chord.svelte.js';

class MockEventTarget {
	private listeners = new Map<string, Set<(event: KeyboardEvent) => void>>();

	addEventListener = vi.fn((type: string, listener: (event: KeyboardEvent) => void) => {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type)!.add(listener);
	});

	removeEventListener = vi.fn((type: string, listener: (event: KeyboardEvent) => void) => {
		this.listeners.get(type)?.delete(listener);
	});

	dispatch(type: string, event: KeyboardEvent): void {
		for (const listener of this.listeners.get(type) ?? []) {
			listener(event);
		}
	}
}

function createKeyboardEvent(
	key: string,
	modifiers: Partial<Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>> = {}
): KeyboardEvent {
	return {
		key,
		code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		target: null,
		currentTarget: null,
		...modifiers
	} as unknown as KeyboardEvent;
}

function clearChordRegistry(): void {
	for (const chord of chordRegistry.getChords()) {
		remove_chord(chord.steps);
	}
	chordRegistry.resetChord();
}

describe('Chord Functionality', () => {
	let mockWindow: MockEventTarget;
	let mockDocument: MockEventTarget;

	const dispatchKeyDown = (
		key: string,
		modifiers: Partial<Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>> = {}
	) => {
		const event = createKeyboardEvent(key, modifiers);

		mockDocument.dispatch('keydown', event);
		mockWindow.dispatch('keydown', event);
	};

	beforeEach(() => {
		vi.useFakeTimers();
		mockWindow = new MockEventTarget();
		mockDocument = new MockEventTarget();

		global.window = mockWindow as unknown as Window & typeof globalThis;
		global.document = mockDocument as unknown as Document;

		clearChordRegistry();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		clearChordRegistry();
		chordRegistry.destroy();
		SequenceManager.resetInstance();
		KeyStateTracker.resetInstance();
		vi.useRealTimers();
	});

	describe('isChordInput', () => {
		it('returns true when object has { isChord: true } property', () => {
			expect(isChordInput({ isChord: true })).toBe(true);
		});

		it('returns false for other values', () => {
			expect(isChordInput(null)).toBe(false);
			expect(isChordInput(undefined)).toBe(false);
			expect(isChordInput('string')).toBe(false);
			expect(isChordInput(123)).toBe(false);
			expect(isChordInput({})).toBe(false);
		});
	});

	describe('strict sequence DSL', () => {
		it('normalizes TanStack sequence syntax', () => {
			expect(normalizeChordSteps('Control+K B')).toStrictEqual(['Control+K', 'B']);
			expect(normalizeChordSteps('Control+Shift+T A')).toStrictEqual(['Control+Shift+T', 'A']);
		});

		it('rejects empty sequence specs', () => {
			expect(() => normalizeChordSteps('')).toThrow(/sequence spec cannot be empty/);
		});

		it('slugifies normalized sequence specs', () => {
			expect(slugifyChord('Control+K B')).toBe('Control+K B');
		});
	});

	describe('Chord Registry API', () => {
		it('adds, toggles and removes chords', () => {
			const action = vi.fn();

			add_chord({
				steps: 'Control+K B',
				description: 'Open bookmarks',
				action
			});

			expect(chordRegistry.getChords()).toHaveLength(1);
			expect(chordRegistry.chordPrefixes.has('Control+K')).toBe(true);
			expect(chordRegistry.isChordPrefix('Control+K')).toBe(true);
			expect(chordRegistry.findChordForPrefix('Control+K')).not.toBeNull();

			toggle_chord('Control+K B');
			expect(chordRegistry.getChords()[0]?.enabled).toBe(false);

			remove_chord('Control+K B');
			expect(chordRegistry.getChords()).toHaveLength(0);
			expect(chordRegistry.chordPrefixes.has('Control+K')).toBe(false);
		});

		it('starts sequence progress on first step and resets on timeout', () => {
			add_chord({
				steps: 'Control+K B',
				action: vi.fn()
			});

			dispatchKeyDown('k', { ctrlKey: true });
			expect(get_current_progress()).not.toBeNull();
			expect(get_current_progress()?.currentIndex).toBe(0);

			vi.advanceTimersByTime(CHORD_TIMEOUT_MS + 1);
			expect(get_current_progress()).toBeNull();
		});

		it('resets on mismatch and on Escape', () => {
			add_chord({
				steps: 'Control+K B',
				action: vi.fn()
			});

			dispatchKeyDown('k', { ctrlKey: true });
			expect(get_current_progress()).not.toBeNull();

			dispatchKeyDown('x');
			expect(get_current_progress()).toBeNull();

			dispatchKeyDown('k', { ctrlKey: true });
			expect(get_current_progress()).not.toBeNull();

			dispatchKeyDown('Escape');
			expect(get_current_progress()).toBeNull();
		});

		it('executes chord action when full sequence is completed', () => {
			const action = vi.fn();

			add_chord({
				steps: 'Control+K B',
				action
			});

			dispatchKeyDown('k', { ctrlKey: true });
			dispatchKeyDown('b');

			expect(action).toHaveBeenCalledTimes(1);
			expect(get_current_progress()).toBeNull();
		});
	});
});
