import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Palette from '../palette.svelte';
import { closePalette, openPalette } from '../palette.svelte.js';

describe('palette texts', () => {
	it('keeps the default for every text a partial `texts` prop leaves out', async () => {
		render(Palette, {
			texts: { dialogTitle: 'Custom title', tableHeaders: { description: 'What' } }
		});
		openPalette();

		await expect.element(page.getByText('Custom title')).toBeInTheDocument();
		await expect.element(page.getByText(/Press any key to filter shortcuts/)).toBeInTheDocument();
		await expect.element(page.getByText('Keys', { exact: true })).toBeInTheDocument();
		closePalette();
	});

	it('names the trigger button, which only holds an icon', async () => {
		render(Palette);

		await expect
			.element(page.getByRole('button', { name: 'Open shortcut palette' }))
			.toBeInTheDocument();
	});
});
