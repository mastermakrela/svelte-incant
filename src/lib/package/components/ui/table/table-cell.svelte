<script lang="ts">
	import type { WithElementRef } from '../../../utils.js';
	import type { HTMLTdAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td bind:this={ref} data-slot="table-cell" class={['incant-table-cell', className]} {...restProps}>
	{@render children?.()}
</td>

<style>
	:global([data-slot='table-cell']) {
		background-clip: padding-box;
		padding: var(--incant-spacing-2, 0.5rem);
		vertical-align: middle;
		white-space: nowrap;
	}

	:global([data-slot='table-cell']:has([role='checkbox'])) {
		padding-right: 0;
	}
</style>
