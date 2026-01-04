<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import TooltipPortal from './tooltip-portal.svelte';
	import type { ComponentProps } from 'svelte';
	import type { WithoutChildrenOrChild } from '../../../utils.js';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 0,
		side = 'top',
		children,
		arrowClasses,
		portalProps,
		...restProps
	}: TooltipPrimitive.ContentProps & {
		arrowClasses?: string;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>;
	} = $props();
</script>

<TooltipPortal {...portalProps}>
	<TooltipPrimitive.Content
		bind:ref
		data-slot="tooltip-content"
		{sideOffset}
		{side}
		class={['incant-tooltip-content', className]}
		{...restProps}
	>
		{@render children?.()}
		<TooltipPrimitive.Arrow>
			{#snippet child({ props })}
				<div class={['incant-tooltip-arrow', arrowClasses]} {...props}></div>
			{/snippet}
		</TooltipPrimitive.Arrow>
	</TooltipPrimitive.Content>
</TooltipPortal>

<style>
	:global([data-slot='tooltip-content']) {
		z-index: 50;
		width: fit-content;
		padding: 0.375rem 0.75rem;
		background-color: var(--incant-colors-primary, hsl(240 5.9% 10%));
		color: var(--incant-colors-primary-foreground, hsl(0 0% 98%));
		font-size: var(--incant-font-size-xs, 0.75rem);
		border-radius: var(--incant-radius-md, 0.375rem);
		animation: tooltip-in 0.2s ease-out;
		text-wrap: balance;
	}

	:global([data-slot='tooltip-content'][data-state='closed']) {
		animation: tooltip-out 0.2s ease-out;
	}

	:global([data-slot='tooltip-content'][data-side='top']) {
		transform-origin: center bottom;
	}

	:global([data-slot='tooltip-content'][data-side='bottom']) {
		transform-origin: center top;
	}

	:global([data-slot='tooltip-content'][data-side='left']) {
		transform-origin: right center;
	}

	:global(.incant-tooltip-arrow) {
		z-index: 50;
		width: 0.625rem;
		height: 0.625rem;
		rotate: 45deg;
		border-radius: 2px;
		background-color: var(--incant-colors-primary, oklch(0.205 0 0));
	}

	/* Positioning per side */
	:global(.incant-tooltip-arrow[data-side='top']) {
		translate: 50% calc(-50% + 2px);
	}

	:global(.incant-tooltip-arrow[data-side='bottom']) {
		translate: -50% calc(-50% + 1px);
	}

	:global(.incant-tooltip-arrow[data-side='right']) {
		translate: calc(50% + 2px) 50%;
	}

	:global(.incant-tooltip-arrow[data-side='left']) {
		translate: 0 calc(50% - 3px);
	}

	@keyframes tooltip-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes tooltip-out {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.95);
		}
	}
</style>
