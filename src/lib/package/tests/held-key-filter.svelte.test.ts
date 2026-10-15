import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Palette from '../palette.svelte';
import { paletteState } from '../palette.svelte.js';
import Fixture from './shortcut-fixture.svelte';

/**
 * `filtered_shortcuts` in palette.svelte — the hold-to-reveal filter that narrows the
 * palette's rows to whichever ones contain a currently held key. Covers the
 * `getHeldKeyCodesMap()` swap: a physical-code step (`[Comma]`, from a `recordBy: 'code'`
 * rebind, or declared directly) has no single logical character, so matching it correctly
 * requires comparing physical codes instead of guessing one from the code string — see
 * `isStepHeld` in hotkey-utils.ts.
 *
 * A synthetic `keydown` with no matching `keyup` leaks into TanStack's key-state tracker
 * across tests (it only clears on `window` blur) — every test dispatches a `blur` at the
 * end, and assertions that depend on the key still being held run *before* that.
 */

afterEach(() => {
	paletteState.open = false;
	window.dispatchEvent(new Event('blur'));
});

describe('held-key filtering', () => {
	it('keeps a physical-code shortcut visible while its held key matches by code, not by a guessed token', async () => {
		const palette = await render(Palette);
		render(Fixture, { keys: '[Comma]', description: 'Comma fixture' });
		paletteState.open = true;

		// Nothing held yet: every row, including this one, is visible.
		await expect.element(palette.getByRole('row', { name: /Comma fixture/ })).toBeInTheDocument();

		// On a layout where physical Comma produces a different character, `event.key` would
		// differ from ','; using ',' here still exercises the code-matching path because
		// `isStepHeld` checks `parsed.code` against `heldCodes`, not the pressed key name.
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: ',', code: 'Comma', bubbles: true })
		);

		// Prove the filter actually ran, rather than every row staying visible regardless:
		// the palette's own `?` row (tokens `['?', 'shift']`) does not contain `','`, so
		// holding Comma alone must filter it out.
		await expect
			.element(palette.getByRole('row', { name: /Open shortcut palette/ }))
			.not.toBeInTheDocument();
		await expect.element(palette.getByRole('row', { name: /Comma fixture/ })).toBeInTheDocument();

		window.dispatchEvent(new Event('blur'));
	});

	it('filters a physical-code shortcut out once an unrelated key is held', async () => {
		const palette = await render(Palette);
		render(Fixture, { keys: '[Comma]', description: 'Comma fixture' });
		paletteState.open = true;

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', code: 'KeyM', bubbles: true }));

		await expect
			.element(palette.getByRole('row', { name: /Comma fixture/ }))
			.not.toBeInTheDocument();

		window.dispatchEvent(new Event('blur'));
	});
});
