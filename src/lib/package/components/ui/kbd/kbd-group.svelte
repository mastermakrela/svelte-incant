<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { type WithElementRef } from '../../../utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<kbd bind:this={ref} data-slot="kbd-group" class={['incant-kbd-group', className]} {...restProps}>
	{@render children?.()}
</kbd>

<style>
	.incant-kbd-group {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
</style>
