<script lang="ts">
	import type { Snippet } from 'svelte';
	import { shortcut } from './attachment.svelte';
	import type { ClassValue } from 'svelte/elements';

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

	function focusChild() {
		if (element) {
			element.focus();
		} else if (container) {
			// Try to find the first focusable element
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
	class={className}
	{@attach shortcut({
		keys,
		description: description,
		action: focusChild
	})}
>
	{@render children()}
</div>
