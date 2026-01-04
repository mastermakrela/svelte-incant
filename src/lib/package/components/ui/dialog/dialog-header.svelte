<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '../../../utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="dialog-header"
	class={['incant-dialog-header', className]}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	:global([data-slot='dialog-header']) {
		display: flex;
		flex-direction: column;
		gap: var(--incant-spacing-2, 0.5rem);
		text-align: center;
	}

	@media (min-width: 640px) {
		:global([data-slot='dialog-header']) {
			text-align: start;
		}
	}
</style>
