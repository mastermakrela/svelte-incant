<script lang="ts">
	import { formatForDisplay, type RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import { getIsMac } from '../utils.js';
	import * as Kbd from './ui/kbd/index.js';

	let {
		hotkey,
		sequence,
		formatShortcut
	}: {
		hotkey?: RegisterableHotkey;
		sequence?: RegisterableHotkey[];
		formatShortcut?: (
			hotkey: RegisterableHotkey | undefined,
			sequence: RegisterableHotkey[] | undefined,
			isMac: boolean
		) => string;
	} = $props();

	const isMac = getIsMac();
	const platform: 'mac' | 'windows' = $derived(isMac ? 'mac' : 'windows');
	const isChordMode = $derived(sequence !== undefined);

	const tokens: string[] = $derived.by(() => {
		if (hotkey !== undefined) {
			return [formatForDisplay(hotkey, { platform, useSymbols: isMac })];
		}
		if (sequence) {
			return sequence.map((step) => formatForDisplay(step, { platform, useSymbols: isMac }));
		}
		return [];
	});

	const customFormatted = $derived(formatShortcut ? formatShortcut(hotkey, sequence, isMac) : null);
</script>

{#if customFormatted !== null}
	<Kbd.Group class="incant-kbds-container">
		<Kbd.Root>{customFormatted}</Kbd.Root>
	</Kbd.Group>
{:else}
	<Kbd.Group class="incant-kbds-container">
		{#each tokens as token, i (i)}
			{#if i > 0}
				{#if isChordMode}
					<span class="incant-kbds-chord-separator">→</span>
				{:else}
					<span class="incant-kbds-separator">+</span>
				{/if}
			{/if}
			<Kbd.Root>{token}</Kbd.Root>
		{/each}
	</Kbd.Group>
{/if}

<style>
	.incant-kbds-separator {
		margin: 0 var(--incant-spacing-1, 0.25rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	.incant-kbds-chord-separator {
		margin: 0 var(--incant-spacing-1, 0.25rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}
</style>
