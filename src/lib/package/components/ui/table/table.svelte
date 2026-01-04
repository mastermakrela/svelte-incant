<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';
	import type { WithElementRef } from '../../../utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTableAttributes> = $props();
</script>

<div data-slot="table-container" class={['incant-table-container', className]}>
	<table bind:this={ref} data-slot="table" class={['incant-table', className]} {...restProps}>
		{@render children?.()}
	</table>
</div>

<style>
	:global([data-slot='table-container']) {
		position: relative;
		width: 100%;
		overflow-x: auto;
	}

	:global([data-slot='table']) {
		width: 100%;
		caption-side: bottom;
		font-size: var(--incant-font-size-sm, 0.875rem);
	}
</style>
