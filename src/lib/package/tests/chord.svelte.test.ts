import { getSequenceManager, type SequenceRegistrationHandle } from '@tanstack/svelte-hotkeys';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseSequence } from '../hotkey-utils.js';
import {
	SEQUENCE_TIMEOUT_MS,
	effectiveSequenceMatchedSteps,
	incantSequences,
	isSequencePrefix,
	needsSequenceProgressClock,
	sequenceOptions
} from '../palette.svelte.js';

/**
 * Behaviour tests for chords. incant no longer owns a `ChordRegistry`; it registers
 * sequences with TanStack's `SequenceManager` and reads progress back off the
 * registration view, so these drive real keyboard events at `document`.
 */

const handles: SequenceRegistrationHandle[] = [];

function addChord(spec: string, action: () => void, description?: string) {
	const steps = parseSequence(spec);
	const handle = getSequenceManager().register(steps, action, sequenceOptions(steps, description));
	handles.push(handle);
	return handle;
}

function press(key: string, modifiers: Partial<KeyboardEventInit> = {}) {
	document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
}

function progressOf(spec: string): number {
	const steps = parseSequence(spec).join(' ');
	const reg = incantSequences().find((r) => r.sequence.join(' ') === steps);
	return reg ? effectiveSequenceMatchedSteps(reg, Date.now()) : 0;
}

describe('chords', () => {
	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterEach(() => {
		// NOTE: deliberately no `SequenceManager.resetInstance()`. The adapter's
		// `getHotkeyRegistrations()` captures the manager singletons when it is
		// constructed (at module load), so resetting them leaves incant reading a
		// manager nobody registers with any more.
		for (const handle of handles) handle.unregister();
		handles.length = 0;
		vi.useRealTimers();
	});

	it('registers with incant metadata so the palette can list it', () => {
		addChord('Control+K B', vi.fn(), 'Open bookmarks');

		const [reg] = incantSequences();
		expect(reg?.sequence).toStrictEqual(['Control+K', 'B']);
		expect(reg?.options.meta?.description).toBe('Open bookmarks');
		expect(reg?.options.timeout).toBe(SEQUENCE_TIMEOUT_MS);
	});

	it('runs the action when the full sequence is pressed', () => {
		const action = vi.fn();
		addChord('Control+K B', action);

		press('k', { ctrlKey: true });
		press('b');

		expect(action).toHaveBeenCalledTimes(1);
		expect(progressOf('Control+K B')).toBe(0);
	});

	it('reports progress after the first step and clears it after the timeout', () => {
		addChord('Control+K B', vi.fn());

		press('k', { ctrlKey: true });
		expect(progressOf('Control+K B')).toBe(1);
		expect(needsSequenceProgressClock(incantSequences(), Date.now())).toBe(true);

		// Nothing fires on timeout — expiry is evaluated against the clock.
		vi.advanceTimersByTime(SEQUENCE_TIMEOUT_MS + 1);
		expect(progressOf('Control+K B')).toBe(0);
		expect(needsSequenceProgressClock(incantSequences(), Date.now())).toBe(false);
	});

	it('does not run the action once the timeout has elapsed', () => {
		const action = vi.fn();
		addChord('Control+K B', action);

		press('k', { ctrlKey: true });
		vi.advanceTimersByTime(SEQUENCE_TIMEOUT_MS + 1);
		press('b');

		expect(action).not.toHaveBeenCalled();
	});

	it('resets progress on a non-matching key', () => {
		addChord('Control+K B', vi.fn());

		press('k', { ctrlKey: true });
		expect(progressOf('Control+K B')).toBe(1);

		press('x');
		expect(progressOf('Control+K B')).toBe(0);
	});

	it('resets progress on Escape', () => {
		addChord('Control+K B', vi.fn());

		press('k', { ctrlKey: true });
		press('Escape');

		expect(progressOf('Control+K B')).toBe(0);
	});

	it('keeps progress when a bare modifier is pressed mid-chord', () => {
		addChord('Control+K B', vi.fn());

		press('k', { ctrlKey: true });
		press('Shift', { shiftKey: true });

		expect(progressOf('Control+K B')).toBe(1);
	});

	it('does not run a soft-disabled chord', () => {
		const action = vi.fn();
		const handle = addChord('Control+K B', action);
		handle.setOptions({ enabled: false });

		press('k', { ctrlKey: true });
		press('b');

		expect(action).not.toHaveBeenCalled();
		expect(incantSequences()).toHaveLength(1); // stays listed in the palette
	});

	it('tracks progress for every chord sharing a first step', () => {
		addChord('Control+K B', vi.fn());
		addChord('Control+K T', vi.fn());

		press('k', { ctrlKey: true });

		expect(progressOf('Control+K B')).toBe(1);
		expect(progressOf('Control+K T')).toBe(1);
	});

	it('reports first steps as sequence prefixes so plain shortcuts stand down', () => {
		const handle = addChord('Control+K B', vi.fn());

		expect(isSequencePrefix('Control+K')).toBe(true);
		expect(isSequencePrefix('B')).toBe(false);

		handle.setOptions({ enabled: false });
		expect(isSequencePrefix('Control+K')).toBe(false);
	});
});
