<script lang="ts">
	import { normalizeHotkey, type Hotkey } from '@tanstack/hotkeys';
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import { shortcut } from './attachment.svelte';
	import { shortcuts } from './palette.svelte.js';

	let {
		keys,
		description,
		element,
		children,
		after_focus,
		class: className,
		click = true
	}: {
		keys: Hotkey;
		description?: string;
		element?: HTMLElement;
		children: Snippet;
		after_focus?: () => void;
		class?: ClassValue;
		click?: boolean;
	} = $props();

	let container: HTMLDivElement | undefined;

	const shortcut_slug = $derived(normalizeHotkey(keys));
	const shortcut_enabled = $derived(shortcuts[shortcut_slug]?.enabled !== false);

	function focusChild(_keys?: string[]) {
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
	class={[className, { 'incant-focus-disabled': !shortcut_enabled }]}
	{@attach shortcut({
		keys,
		description: description,
		action: focusChild,
		click
	})}
>
	{@render children()}
</div>

<style>
	:global(.incant-focus-disabled) {
		outline: none !important;
	}
</style>
