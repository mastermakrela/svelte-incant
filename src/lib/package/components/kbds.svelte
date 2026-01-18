<script lang="ts">
	import * as Kbd from './ui/kbd/index.js';
	import { keyToSymbol } from '../utils.js';

	let {
		keys,
		isChord = false
	}: {
		keys: string | string[] | string[][];
		isChord?: boolean;
	} = $props();

	type KeyCombination = string[];

	let keyGroups: KeyCombination[] = $derived(
		typeof keys === 'string'
			? [[keys]]
			: Array.isArray(keys) && keys.length > 0 && typeof keys[0] === 'string'
				? [keys as string[]]
				: (keys as KeyCombination[])
	);

	let isChordMode: boolean = $derived(isChord === true);

	const formatter: Intl.ListFormat = $derived(
		new Intl.ListFormat(
			undefined,
			isChordMode
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
		const combos = keyGroups.map((group) => group.map(keyToSymbol).join(' '));
		return formatter.formatToParts(combos);
	});
</script>

<Kbd.Group class="incant-kbds-container">
	{#each formattedParts as part (part)}
		{#if part.type === 'element'}
			<Kbd.Root>{part.value}</Kbd.Root>
		{:else if isChordMode}
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
