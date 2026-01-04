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

<thead
	bind:this={ref}
	data-slot="table-header"
	class={['incant-table-header', className]}
	{...restProps}
>
	{@render children?.()}
</thead>

<style>
	:global([data-slot='table-header'] tr) {
		border-bottom: 1px solid var(--incant-colors-border, hsl(240 5.9% 90%));
	}
</style>
