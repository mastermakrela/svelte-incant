<script lang="ts">
	import type { WithElementRef } from '../../../utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();
</script>

<tfoot
	bind:this={ref}
	data-slot="table-footer"
	class={['incant-table-footer', className]}
	{...restProps}
>
	{@render children?.()}
</tfoot>

<style>
	:global([data-slot='table-footer']) {
		border-top: 1px solid var(--incant-colors-border, hsl(240 5.9% 90%));
		background-color: var(--incant-colors-muted, hsl(240 4.8% 95.9%));
		font-weight: 500;
	}

	:global([data-slot='table-footer'] tr:last-child) {
		border-bottom: none;
	}
</style>
