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

<kbd bind:this={ref} data-slot="kbd" class={['incant-kbd', className]} {...restProps}>
	{@render children?.()}
</kbd>

<style>
	.incant-kbd {
		pointer-events: none;
		display: inline-flex;
		height: 1.25rem;
		min-width: 1.25rem;
		width: fit-content;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		border-radius: 0.25rem;
		background-color: var(--incant-kbd-bg, #f3f4f6);
		padding: 0 0.25rem;
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--incant-kbd-color, #6b7280);
		user-select: none;
	}

	.incant-kbd > :global(svg) {
		width: 0.75rem;
		height: 0.75rem;
	}

	:global(.dark) .incant-kbd {
		background-color: var(--incant-kbd-bg, #374151);
		color: var(--incant-kbd-color, #9ca3af);
	}

	:global([data-slot='tooltip-content']) .incant-kbd {
		background-color: rgba(255, 255, 255, 0.2);
		color: inherit;
	}

	:global(.dark [data-slot='tooltip-content']) .incant-kbd {
		background-color: rgba(255, 255, 255, 0.1);
	}
</style>
