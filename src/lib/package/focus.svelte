<script lang="ts">
	import type { RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { shortcut } from './attachment.svelte';

	let {
		hotkey,
		description,
		element,
		children,
		after_focus,
		class: className,
		click = true
	}: {
		hotkey: RegisterableHotkey;
		description?: string;
		element?: HTMLElement;
		children: Snippet;
		after_focus?: () => void;
		class?: ClassValue;
		click?: boolean;
	} = $props();

	let container: HTMLElement;

	function focusChild() {
		const targetElement =
			element ||
			(() => {
				const focusable = container.querySelector<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				return focusable || container;
			})();

		if (targetElement) {
			targetElement.focus();
			if (click) {
				targetElement.click();
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
		hotkey,
		description,
		action: focusChild,
		click
	})}
>
	{@render children()}
</div>
