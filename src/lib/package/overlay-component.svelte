<script lang="ts">
	import type { Hotkey } from '@tanstack/svelte-hotkeys';
	import Kbds from './components/kbds.svelte';
	import { effectiveHotkey, isRevealed } from './palette.svelte.js';

	export type OverlayComponentProps = {
		/** The declared combo. The badge shows what it currently listens for. */
		declared: Hotkey;
	};

	let { declared }: OverlayComponentProps = $props();

	const hotkey = $derived(effectiveHotkey(declared));
	const visible = $derived(isRevealed(declared));
</script>

{#if visible}
	<div class="incant-overlay-component">
		<Kbds keys={hotkey} />
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

	/*
	 * Applied by the `shortcut()` attachment while the reveal modifier is held.
	 * Lives here (rather than in `palette.svelte`) so the outline works even when no
	 * `<Palette />` is mounted, and it is a class rather than an inline style so an
	 * author's own `outline` is no longer stomped.
	 */
	:global(.incant-revealed) {
		outline: var(--incant-outline-width, 2px) var(--incant-outline-style, dotted)
			var(--incant-outline-color, #878787);
		outline-offset: var(--incant-outline-offset, 2px);
		transition:
			outline 0s,
			outline-offset 0s;
	}
</style>
