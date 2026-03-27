<script lang="ts">
	import { formatForDisplay, normalizeHotkey, type Hotkey } from '@tanstack/hotkeys';
	import { parseSequence, tokensToHotkey, type SequenceSpec } from '../hotkey-utils.js';
	import * as Kbd from './ui/kbd/index.js';

	let {
		keys,
		isChord = false
	}: {
		keys: Hotkey | SequenceSpec | string[] | string[][];
		isChord?: boolean;
	} = $props();

	function toHotkeyGroups(
		value: Hotkey | SequenceSpec | string[] | string[][],
		chordMode: boolean
	): Hotkey[] {
		if (typeof value === 'string') {
			if (chordMode) {
				return parseSequence(value as SequenceSpec);
			}
			return [normalizeHotkey(value ) ];
		}

		if (value.length === 0) return [];

		if (typeof value[0] === 'string') {
			if (chordMode) {
				return (value []).map((step) => normalizeHotkey(step) );
			}
			return [tokensToHotkey(value as string[])];
		}

		return (value as string[][]).map((group) => tokensToHotkey(group));
	}

	let hotkeyGroups: Hotkey[] = $derived.by(() => toHotkeyGroups(keys, isChord));

	const formatter: Intl.ListFormat = $derived(
		new Intl.ListFormat(
			undefined,
			isChord
				? {
						style: 'narrow',
						type: 'unit'
					}
				: {
						style: 'long',
						type: 'disjunction'
					}
		)
	);

	const formattedParts = $derived.by(() => {
		const combos = hotkeyGroups.map((group) => formatForDisplay(group));
		return formatter.formatToParts(combos);
	});
</script>

<Kbd.Group class="incant-kbds-container">
	{#each formattedParts as part (part)}
		{#if part.type === 'element'}
			<Kbd.Root>{part.value}</Kbd.Root>
		{:else if isChord}
			<span class="incant-kbds-chord-separator">→</span>
		{:else}
			<span class="incant-kbds-separator">{part.value}</span>
		{/if}
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
