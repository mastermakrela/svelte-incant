import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	SEQUENCE_TIMEOUT_MS,
	effectiveHotkey,
	effectiveSequence,
	hotkeyOptions,
	incantConfig,
	isEnabled,
	isRebound,
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
		const first = render(Fixture, { keys: 'Control+Y' });
		row('Control+Y')?.rebind(['Shift+P']);
		await vi.waitFor(() => expect(row('Control+Y')?.steps).toStrictEqual(['Shift+P']));

		first.unmount();
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
