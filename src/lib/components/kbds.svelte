<script lang="ts">
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { keyToSymbol } from '$lib/utils.js';

	let {
		keys,
		separator = 'or'
	}: {
		keys: string | string[] | string[][];
		separator?: string;
	} = $props();

	type KeyCombination = string[];

	let keyGroups: KeyCombination[] = $derived(
		typeof keys === 'string'
			? [[keys]]
			: Array.isArray(keys) && keys.length > 0 && typeof keys[0] === 'string'
				? [keys as string[]]
				: (keys as KeyCombination[])
	);
</script>

<Kbd.Group class="text-xs">
	{#each keyGroups as group, index (index)}
		{#if index > 0}
			<span class="mx-1 text-muted-foreground">{separator}</span>
		{/if}
		<Kbd.Root>{group.map(keyToSymbol).join(' ')}</Kbd.Root>
	{/each}
</Kbd.Group>
