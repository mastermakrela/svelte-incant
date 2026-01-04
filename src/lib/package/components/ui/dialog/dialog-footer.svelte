<script lang="ts">
	import type { WithElementRef } from '../../../utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="dialog-footer"
	class={['incant-dialog-footer', className]}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	:global([data-slot='dialog-footer']) {
		display: flex;
		flex-direction: column-reverse;
		gap: var(--incant-spacing-2, 0.5rem);
	}

	@media (min-width: 640px) {
		:global([data-slot='dialog-footer']) {
			flex-direction: row;
			justify-content: flex-end;
		}
	}
</style>
