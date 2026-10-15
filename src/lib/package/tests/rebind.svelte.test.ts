import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Palette from '../palette.svelte';
import {
	SEQUENCE_TIMEOUT_MS,
	effectiveHotkey,
	effectiveSequence,
	hotkeyOptions,
	incantConfig,
	isEnabled,
	isRebound,
	paletteState,
	rebind,
	sequenceOptions,
	shortcuts,
	toggleEnabled
} from '../palette.svelte.js';
import Fixture from './shortcut-fixture.svelte';

/**
 * Rebinding, app-wide defaults and text-derived keys. Rebinds are keyed by the
 * *declared* combo, which is what makes them outlive a re-registration.
 */

function row(declared: string) {
	return shortcuts.current.find((item) => item.declared === declared);
}

afterEach(() => {
	incantConfig.preventDefault = false;
	incantConfig.sequenceTimeout = SEQUENCE_TIMEOUT_MS;
	incantConfig.deriveModifier = 'Control';
});

describe('rebinding', () => {
	afterEach(() => {
		rebind('Control+Y', []);
		rebind('Control+Y Q', []);
		if (!isEnabled('Control+Y')) toggleEnabled('Control+Y');
	});

	it('leaves an unbound shortcut on its declared combo', () => {
		expect(effectiveHotkey('Control+Y')).toBe('Control+Y');
		expect(isRebound('Control+Y')).toBe(false);
	});

	it('applies an override, and an empty array restores the declared combo', () => {
		rebind('Control+Y', ['Shift+P']);
		expect(effectiveHotkey('Control+Y')).toBe('Shift+P');
		expect(isRebound('Control+Y')).toBe(true);

		rebind('Control+Y', []);
		expect(effectiveHotkey('Control+Y')).toBe('Control+Y');
	});

	it('overrides a chord with its recorded steps', () => {
		rebind('Control+Y Q', ['Control+G', 'H']);
		expect(effectiveSequence(['Control+Y', 'Q'])).toStrictEqual(['Control+G', 'H']);
	});

	it('keeps the enabled preference across a rebind, because both are keyed the same way', () => {
		toggleEnabled('Control+Y');
		expect(hotkeyOptions('Control+Y').enabled).toBe(false);

		rebind('Control+Y', ['Shift+P']);
		expect(hotkeyOptions('Control+Y').enabled).toBe(false);
	});

	it('registers the override and reports it on the palette row', async () => {
		render(Fixture, { keys: 'Control+Y' });
		expect(row('Control+Y')?.steps).toStrictEqual(['Control+Y']);

		row('Control+Y')?.rebind(['Shift+P']);
		await vi.waitFor(() => expect(row('Control+Y')?.steps).toStrictEqual(['Shift+P']));
		expect(row('Control+Y')?.rebound).toBe(true);
		// The row is still addressed by what the markup declared, not by what it listens for.
		expect(row('Shift+P')).toBeUndefined();
	});

	it('survives the shortcut unmounting and remounting', async () => {
		const first = await render(Fixture, { keys: 'Control+Y' });
		row('Control+Y')?.rebind(['Shift+P']);
		await vi.waitFor(() => expect(row('Control+Y')?.steps).toStrictEqual(['Shift+P']));

		await first.unmount();
		await vi.waitFor(() => expect(row('Control+Y')).toBeUndefined());

		render(Fixture, { keys: 'Control+Y' });
		await vi.waitFor(() => expect(row('Control+Y')?.steps).toStrictEqual(['Shift+P']));
	});
});

describe('app-wide defaults', () => {
	it('falls back to the configured preventDefault, and an explicit value still wins', () => {
		expect(hotkeyOptions('Control+Y').preventDefault).toBe(false);

		incantConfig.preventDefault = true;
		expect(hotkeyOptions('Control+Y').preventDefault).toBe(true);
		expect(sequenceOptions(['Control+Y', 'Q']).preventDefault).toBe(true);
		expect(hotkeyOptions('Control+Y', undefined, false).preventDefault).toBe(false);
	});

	it('uses the configured chord timeout', () => {
		expect(sequenceOptions(['Control+Y', 'Q']).timeout).toBe(SEQUENCE_TIMEOUT_MS);

		incantConfig.sequenceTimeout = 3000;
		expect(sequenceOptions(['Control+Y', 'Q']).timeout).toBe(3000);
	});
});

describe('keys derived from element text', () => {
	it('binds the first alphanumeric character of a button, behind the derive modifier', async () => {
		render(Fixture, { text: 'Bookmark' });
		await vi.waitFor(() => expect(row('Control+B')?.steps).toStrictEqual(['Control+B']));
	});

	it('skips punctuation and upper-cases the character', async () => {
		render(Fixture, { text: '— quick save' });
		await vi.waitFor(() => expect(row('Control+Q')?.steps).toStrictEqual(['Control+Q']));
	});

	it('falls back to the label of an input, which has no text of its own', async () => {
		render(Fixture, { kind: 'input', text: 'Notes' });
		await vi.waitFor(() => expect(row('Control+N')?.steps).toStrictEqual(['Control+N']));
	});

	it('derives a bare key when the derive modifier is disabled', async () => {
		incantConfig.deriveModifier = null;
		render(Fixture, { text: 'Bookmark' });
		await vi.waitFor(() => expect(row('B')?.steps).toStrictEqual(['B']));
	});

	it('honours a custom derive modifier', async () => {
		incantConfig.deriveModifier = 'Alt';
		render(Fixture, { text: 'Bookmark' });
		await vi.waitFor(() => expect(row('Alt+B')?.steps).toStrictEqual(['Alt+B']));
	});

	it('registers nothing and warns when there is no text to derive from', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		render(Fixture, { text: '' });
		await vi.waitFor(() => expect(warn).toHaveBeenCalledTimes(1));
		expect(shortcuts.current.filter((item) => item.description === 'Fixture')).toStrictEqual([]);

		warn.mockRestore();
	});
});

/**
 * `createHotkeyRecorder` / `createHotkeySequenceRecorder` themselves — exercised through
 * the rendered `Palette`, unlike the suite above which only drives the storage layer
 * (`rebind()`/`effectiveHotkey()`) directly. Covers the two 0.9.0 breaking changes:
 * `recordBy` defaulting to physical codes (incant defaults `Palette` to `'key'` to keep
 * today's behaviour) and clearing calling only `onClear`, not `onRecord` with an empty value.
 *
 * `Palette` and `Fixture` are (re)rendered fresh in each test (`vitest-browser-svelte`
 * registers its own `afterEach(cleanup)`, so components mounted in `beforeAll` are gone by
 * the time a test body runs — per-test mounting, matching the rest of this file, is what
 * actually works). A unique declared combo (`Control+J`, unused elsewhere in this file)
 * keeps the palette to a single relevant row. A `Shift`-only modifier is used when
 * recording (rather than `Control`) because `Control` without `Meta` collapses to the
 * platform-adaptive `Mod` token on non-mac platforms, which would make the recorded
 * string test-runner-dependent.
 *
 * `press()` dispatches a `blur` after every keydown to reset TanStack's key-state tracker
 * (it clears held keys on `window` blur — see `key-state-tracker.js`). Without it, a
 * `keydown` with no matching `keyup` leaks into `heldKeyNames()` across tests: the next
 * test's `filtered_shortcuts` (hold-to-reveal filtering in palette.svelte) then filters the
 * `Control+J` row out of the table entirely, because a still-"held" `Shift`/`S` from the
 * previous test doesn't match its tokens.
 */
describe('rebind recorder', () => {
	function press(key: string, code: string, modifiers: Partial<KeyboardEventInit> = {}) {
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key, code, bubbles: true, ...modifiers })
		);
		window.dispatchEvent(new Event('blur'));
	}

	let palette: Awaited<ReturnType<typeof render<typeof Palette>>>;

	async function mountPalette(recordBy?: 'key' | 'code') {
		palette = await render(Palette, { showRebinding: true, ...(recordBy && { recordBy }) });
		render(Fixture, { keys: 'Control+J' });
		paletteState.open = true;
	}

	afterEach(() => {
		rebind('Control+J', []);
		if (!isEnabled('Control+J')) toggleEnabled('Control+J');
		paletteState.open = false;
	});

	async function startRecording() {
		// Every Palette also registers its own `?` shortcut, which gets a rebind button too —
		// scope to the Fixture's row so the query stays unambiguous.
		const fixtureRow = palette.getByRole('row', { name: /Fixture/ });
		const recordButton = fixtureRow.getByLabelText('Record a new key combination');
		await expect.element(recordButton).toBeInTheDocument();
		await recordButton.click();
		return fixtureRow;
	}

	it('records the logical key by default', async () => {
		await mountPalette();
		await startRecording();
		press('S', 'KeyS', { shiftKey: true });

		await vi.waitFor(() => expect(effectiveHotkey('Control+J')).toBe('Shift+S'));
	});

	it('records the physical code when recordBy is "code"', async () => {
		await mountPalette('code');
		await startRecording();
		press('S', 'KeyS', { shiftKey: true });

		await vi.waitFor(() => expect(effectiveHotkey('Control+J')).toBe('Shift+[KeyS]'));
	});

	it('restores the declared default on clear, via onClear rather than an empty onRecord', async () => {
		rebind('Control+J', ['Shift+P']);
		await mountPalette();
		const fixtureRow = await startRecording();

		// Backspace with no modifiers is the recorder's clear gesture.
		press('Backspace', 'Backspace');

		await vi.waitFor(() => expect(effectiveHotkey('Control+J')).toBe('Control+J'));
		expect(isRebound('Control+J')).toBe(false);
		// `recording` isn't left dangling: the row is back to showing the record button,
		// not stuck on the "recording…" label.
		await expect
			.element(fixtureRow.getByLabelText('Record a new key combination'))
			.toBeInTheDocument();
	});
});

/**
 * `detectConflicts` (default `true`), wired through TanStack's `findHotkeyConflicts` via
 * the recorder's own `detectConflicts`/`onReject`. A second, distinctly-described fixture
 * (`Shift+M`) provides something to collide with — two rows both named "Fixture" would make
 * `getByRole('row', { name: /Fixture/ })` ambiguous (see the comment above), so this fixture
 * is named "Other fixture" instead.
 */
describe('rebind conflict detection', () => {
	async function mountPaletteWithTwoFixtures() {
		const palette = await render(Palette, { showRebinding: true });
		render(Fixture, { keys: 'Control+J', description: 'Fixture' });
		render(Fixture, { keys: 'Shift+M', description: 'Other fixture' });
		paletteState.open = true;
		return palette;
	}

	function press(key: string, code: string, modifiers: Partial<KeyboardEventInit> = {}) {
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key, code, bubbles: true, ...modifiers })
		);
		window.dispatchEvent(new Event('blur'));
	}

	afterEach(() => {
		rebind('Control+J', []);
		rebind('Shift+M', []);
		if (!isEnabled('Control+J')) toggleEnabled('Control+J');
		if (!isEnabled('Shift+M')) toggleEnabled('Shift+M');
		paletteState.open = false;
	});

	it('rejects recording onto a combo already taken by another shortcut, and keeps the old binding', async () => {
		const palette = await mountPaletteWithTwoFixtures();
		const fixtureRow = palette.getByRole('row', { name: /Fixture/ });
		const recordButton = fixtureRow.getByLabelText('Record a new key combination');
		await expect.element(recordButton).toBeInTheDocument();
		await recordButton.click();

		// Shift+M is already registered by the other fixture.
		press('M', 'KeyM', { shiftKey: true });

		// Rejected candidates leave the recorder active (TanStack's own guarantee) — the
		// old binding is untouched and the row is still recording, now with a message.
		expect(effectiveHotkey('Control+J')).toBe('Control+J');
		await expect
			.element(fixtureRow.getByText(/Already used by another shortcut/))
			.toBeInTheDocument();
		await expect.element(fixtureRow.getByText(/Other fixture/)).toBeInTheDocument();

		// A non-conflicting combo pressed afterwards still records normally.
		press('S', 'KeyS', { shiftKey: true });
		await vi.waitFor(() => expect(effectiveHotkey('Control+J')).toBe('Shift+S'));
	});

	it('does not treat re-recording a row’s own current combo as a conflict with itself', async () => {
		rebind('Control+J', ['Shift+P']);
		const palette = await mountPaletteWithTwoFixtures();
		const fixtureRow = palette.getByRole('row', { name: /Fixture/ });
		const recordButton = fixtureRow.getByLabelText('Record a new key combination');
		await expect.element(recordButton).toBeInTheDocument();
		await recordButton.click();

		// Same combo the row is already listening for — must not be rejected as a
		// self-conflict against its own live registration. `effectiveHotkey` staying
		// 'Shift+P' is true either way (rejection also leaves the old binding in place), so
		// the recording actually *finishing* — recorder back to idle, no conflict text — is
		// what discriminates acceptance from a silent rejection here.
		press('P', 'KeyP', { shiftKey: true });

		await expect.element(recordButton).toBeInTheDocument();
		expect(fixtureRow.getByText(/Already used by another shortcut/).query()).toBeNull();
		expect(effectiveHotkey('Control+J')).toBe('Shift+P');
	});

	it('allows the conflict when detectConflicts is disabled, matching pre-0.9.0 behaviour', async () => {
		const palette = await render(Palette, { showRebinding: true, detectConflicts: false });
		render(Fixture, { keys: 'Control+J', description: 'Fixture' });
		render(Fixture, { keys: 'Shift+M', description: 'Other fixture' });
		paletteState.open = true;

		const fixtureRow = palette.getByRole('row', { name: /Fixture/ });
		const recordButton = fixtureRow.getByLabelText('Record a new key combination');
		await expect.element(recordButton).toBeInTheDocument();
		await recordButton.click();

		press('M', 'KeyM', { shiftKey: true });

		await vi.waitFor(() => expect(effectiveHotkey('Control+J')).toBe('Shift+M'));
	});
});
