<script lang="ts">
	import { getIsKeyHeld, type RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import Kbds from './components/kbds.svelte';
	import { isShortcutEnabled } from './palette.svelte.js';

	export type OverlayComponentProps = {
		hotkey: RegisterableHotkey;
	};

	let { hotkey }: OverlayComponentProps = $props();

	const altHeld = getIsKeyHeld('Alt');
	const visible = $derived(altHeld.held && isShortcutEnabled(hotkey));
</script>

{#if visible}
	<div class="incant-overlay-component">
		<Kbds {hotkey} />
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
