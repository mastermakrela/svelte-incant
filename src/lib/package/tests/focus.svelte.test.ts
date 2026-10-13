import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from './focus-fixture.svelte';

describe('Focus', () => {
	it('clicks the child once, so ancestors see a single click', async () => {
		const onAncestorClick = vi.fn();
		const onChildClick = vi.fn();
		render(Fixture, { onAncestorClick, onChildClick });

		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Y', ctrlKey: true, bubbles: true })
		);

		await vi.waitFor(() => expect(onChildClick).toHaveBeenCalledTimes(1));
		expect(onAncestorClick).toHaveBeenCalledTimes(1);
	});
});
