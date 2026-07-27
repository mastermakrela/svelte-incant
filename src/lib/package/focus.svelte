<script lang="ts">
	import type { RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { shortcut } from './attachment.svelte.js';

	let {
		keys,
		description,
		element,
		children,
		after_focus,
		class: className,
		click = true
	}: {
		/** A checked hotkey string (`'Mod+Shift+S'`) or a `RawHotkey` object built at runtime. */
		keys: RegisterableHotkey;
		description?: string;
		element?: HTMLElement;
		children: Snippet;
		after_focus?: () => void;
		class?: ClassValue;
		click?: boolean;
	} = $props();

	let container: HTMLDivElement | undefined;

	function focusChild() {
		const targetElement =
			element ??
			container?.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			) ??
			container;

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
		keys,
		description,
		action: focusChild,
		click
	})}
>
	{@render children()}
</div>
