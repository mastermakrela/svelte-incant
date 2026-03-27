<script lang="ts">
	import { normalizeHotkey, type Hotkey } from '@tanstack/hotkeys';
	import { onMount } from 'svelte';
	import Kbds from './components/kbds.svelte';
	import { toHotkeyTokens } from './hotkey-utils.js';
	import { shortcuts } from './palette.svelte.js';
	import { subscribePressedKeys } from './pressed-keys.svelte.js';

	export type OverlayComponentProps = {
		keys: Hotkey;
	};

	let { keys }: OverlayComponentProps = $props();

	let pressed_keys = $state<string[]>([]);

	onMount(() => {
		return subscribePressedKeys((keys) => {
			pressed_keys = keys;
		});
	});

	const alt_pressed = $derived(pressed_keys.includes('alt'));
	const normalized_keys = $derived(toHotkeyTokens(keys));
	const shortcut = $derived(shortcuts[normalizeHotkey(keys)] ?? null);
	const visible = $derived(alt_pressed && shortcut?.enabled !== false);
</script>

{#if visible}
	<div class="incant-overlay-component">
		<Kbds keys={normalized_keys} />
	</div>
{/if}

<style>
	:global(.incant-overlay-component) {
		pointer-events: none;
		position: absolute;
		bottom: 0;
		left: 50%;
		z-index: var(--incant-z-index-overlay, 50);
		transform: translateX(-50%) translateY(66.666%);
		min-width: max-content;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
