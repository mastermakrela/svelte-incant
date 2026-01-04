<script lang="ts">
	import type { WithElementRef } from '../../../utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<caption
	bind:this={ref}
	data-slot="table-caption"
	class={['incant-table-caption', className]}
	{...restProps}
>
	{@render children?.()}
</caption>

<style>
	:global([data-slot='table-caption']) {
		margin-top: var(--incant-spacing-4, 1rem);
		font-size: var(--incant-font-size-sm, 0.875rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}
</style>
