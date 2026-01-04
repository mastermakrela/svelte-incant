<script lang="ts">
	import type { WithElementRef } from '../../../utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr bind:this={ref} data-slot="table-row" class={['incant-table-row', className]} {...restProps}>
	{@render children?.()}
</tr>

<style>
	:global([data-slot='table-row']) {
		border-bottom: 1px solid var(--incant-colors-border, hsl(240 5.9% 90%));
		transition: background-color 0.2s;
	}

	:global([data-slot='table-row']:hover) {
		background-color: var(--incant-colors-muted, hsl(240 4.8% 95.9%));
	}

	:global([data-slot='table-row']:hover th),
	:global([data-slot='table-row']:hover td) {
		background-color: var(--incant-colors-muted, hsl(240 4.8% 95.9%));
	}

	:global([data-slot='table-row'][data-state='selected']) {
		background-color: var(--incant-colors-muted, hsl(240 4.8% 95.9%));
	}
</style>
