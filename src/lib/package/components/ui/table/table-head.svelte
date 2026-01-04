<script lang="ts">
	import type { WithElementRef } from '../../../utils.js';
	import type { HTMLThAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes> = $props();
</script>

<th bind:this={ref} data-slot="table-head" class={['incant-table-head', className]} {...restProps}>
	{@render children?.()}
</th>

<style>
	:global([data-slot='table-head']) {
		height: 2.5rem;
		background-clip: padding-box;
		padding: 0 var(--incant-spacing-2, 0.5rem);
		text-align: start;
		vertical-align: middle;
		font-weight: 500;
		white-space: nowrap;
		color: var(--incant-colors-foreground, hsl(240 10% 3.9%));
	}

	:global([data-slot='table-head']:has([role='checkbox'])) {
		padding-right: 0;
	}
</style>
