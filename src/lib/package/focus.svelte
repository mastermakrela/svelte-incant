<script lang="ts">
	import type { Snippet } from 'svelte';
	import { shortcut } from './attachment.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { shortcuts, slugify } from './palette.svelte.js';

	let {
		keys,
		description,
		element,
		children,
		after_focus,
		class: className
	}: {
		keys: string | string[] | string[][];
		description?: string;
		element?: HTMLElement;
		children: Snippet;
		after_focus?: () => void;
		class?: ClassValue;
	} = $props();

	let container: HTMLElement;

	// Check if shortcut is enabled to control focus ring
	const shortcut_slug = $derived.by(() => slugify(keys));
	const shortcut_enabled = $derived.by(() => {
		const registered_shortcut = shortcuts[shortcut_slug];
		// Default to enabled if shortcut not found (backward compatibility)
		return registered_shortcut?.enabled !== false;
	});

	function focusChild() {
		if (element) {
			element.focus();
		} else if (container) {
			// Try to find first focusable element
			const focusable = container.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			if (focusable) {
				focusable.focus();
			} else {
				// If no focusable element found, focus the container itself
				container.focus();
			}
		}

		after_focus?.();
	}
</script>

<div
	bind:this={container}
	tabindex="-1"
	class={[className, { 'incant-focus-disabled': !shortcut_enabled }]}
	{@attach shortcut({
		keys,
		description: description,
		action: focusChild
	})}
>
	{@render children()}
</div>

<style>
	:global(.incant-focus-disabled) {
		outline: none !important;
	}
</style>
