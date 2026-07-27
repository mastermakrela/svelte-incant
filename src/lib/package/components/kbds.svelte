<script lang="ts">
	import {
		detectPlatform,
		formatForDisplay,
		normalizeHotkey,
		type Hotkey
	} from '@tanstack/svelte-hotkeys';
	import { parseSequence, tokensToHotkey, type SequenceSpec } from '../hotkey-utils.js';
	import * as Kbd from './ui/kbd/index.js';

	/** Display-only, so it takes whatever shape the caller already has — including token arrays. */
	type KbdsInput = Hotkey | SequenceSpec | string[] | string[][];

	let {
		keys,
		isChord = false
	}: {
		keys: KbdsInput;
		isChord?: boolean;
	} = $props();

	function toHotkeyGroups(value: KbdsInput, chordMode: boolean): Hotkey[] {
		if (typeof value === 'string') {
			return chordMode ? parseSequence(value) : [normalizeHotkey(value)];
		}

		if (value.length === 0) return [];

		if (typeof value[0] === 'string') {
			const tokens = value as string[];
			return chordMode ? tokens.map((step) => normalizeHotkey(step)) : [tokensToHotkey(tokens)];
		}

		return (value as string[][]).map((group) => tokensToHotkey(group));
	}

	let hotkeyGroups: Hotkey[] = $derived.by(() => toHotkeyGroups(keys, isChord));

	// Mac symbols render tight (`⌘J`, not 0.8.0's `⌘ J`); Windows/Linux keep the
	// default `+` between text labels (`Ctrl+Shift+S` — an empty separator would
	// concatenate them into `CtrlShiftS`).
	const displayOptions = detectPlatform() === 'mac' ? { separatorToken: '' } : {};
</script>

<Kbd.Group class="incant-kbds-container">
	{#each hotkeyGroups as group, index (index)}
		{#if index > 0}
			<span class={isChord ? 'incant-kbds-chord-separator' : 'incant-kbds-separator'}>
				{isChord ? '→' : 'or'}
			</span>
		{/if}
		<Kbd.Root>{formatForDisplay(group, displayOptions)}</Kbd.Root>
	{/each}
</Kbd.Group>

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
