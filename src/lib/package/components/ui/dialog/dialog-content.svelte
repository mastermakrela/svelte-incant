<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import DialogPortal from './dialog-portal.svelte';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import type { WithoutChildrenOrChild } from '../../../utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();
</script>

<DialogPortal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={['incant-dialog-content', className]}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close class="incant-dialog-close">
				<XIcon />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>

<style>
	:global([data-slot='dialog-content']) {
		position: fixed;
		left: 50%;
		top: 50%;
		z-index: 50;
		transform: translate(-50%, -50%);
		width: calc(100% - 2rem);
		max-width: 32rem;
		display: grid;
		gap: var(--incant-spacing-4, 1rem);
		padding: var(--incant-spacing-6, 1.5rem);
		background-color: var(--incant-colors-background, hsl(0 0% 100%));
		border: 1px solid var(--incant-colors-border, hsl(240 5.9% 90%));
		border-radius: var(--incant-radius-lg, 0.5rem);
		box-shadow: var(--incant-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		animation: dialog-content-in 0.2s ease-out;
	}

	:global([data-slot='dialog-content'][data-state='closed']) {
		animation: dialog-content-out 0.2s ease-out;
	}

	:global(.incant-dialog-close) {
		position: absolute;
		right: 1rem;
		top: 1rem;
		border-radius: var(--incant-radius-sm, 0.25rem);
		background: transparent;
		border: none;
		padding: 0.25rem;
		opacity: 0.7;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	:global(.incant-dialog-close:hover) {
		opacity: 1;
	}

	:global(.incant-dialog-close:focus) {
		outline: 2px solid var(--incant-colors-ring, hsl(240 5.9% 10%));
		outline-offset: 2px;
	}

	:global(.incant-dialog-close:disabled) {
		pointer-events: none;
		opacity: 0.5;
	}

	:global(.incant-dialog-close svg) {
		pointer-events: none;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		:global([data-slot='dialog-content']) {
			max-width: 32rem;
		}
	}

	@keyframes dialog-content-in {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	@keyframes dialog-content-out {
		from {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.95);
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
