<script lang="ts">
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { keyToSymbol } from '$lib/utils.js';

	let {
		keys
	}: {
		keys: string | string[] | string[][];
	} = $props();

	type KeyCombination = string[];

	let keyGroups: KeyCombination[] = $derived(
		typeof keys === 'string'
			? [[keys]]
			: Array.isArray(keys) && keys.length > 0 && typeof keys[0] === 'string'
				? [keys as string[]]
				: (keys as KeyCombination[])
	);

	const formatter: Intl.ListFormat = $derived(
		new Intl.ListFormat(undefined, {
			style: 'long',
			type: 'disjunction'
		})
	);

	const formattedParts = $derived.by(() => {
		const combos = keyGroups.map((group) => group.map(keyToSymbol).join(' '));
		return formatter.formatToParts(combos);
	});
</script>

<Kbd.Group class="text-xs">
	{#each formattedParts as part (part)}
		{#if part.type === 'element'}
			<Kbd.Root>{part.value}</Kbd.Root>
		{:else}
			<span class="mx-1 text-muted-foreground">{part.value}</span>
		{/if}
	{/each}
</Kbd.Group>
