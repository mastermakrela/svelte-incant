<script lang="ts">
	import { PressedKeys } from 'runed';
	import Kbds from './components/kbds.svelte';
	import { shortcuts, slugify } from './palette.svelte.js';
	import { normalizeKeys } from './palette.svelte.js';

	export type OverlayComponentProps = {
		keys: string | string[] | string[][];
	};

	let { keys }: OverlayComponentProps = $props();

	const pressed_keys = new PressedKeys();
	const alt_pressed = $derived(pressed_keys.has('alt'));

	const normalized_keys = $derived.by(() => normalizeKeys(keys));
	const shortcut = $derived.by(() => {
		for (const combo of normalized_keys) {
			const slug = combo.join('-').toLowerCase().replace(/\s+/g, '-');
			const registered_shortcut = shortcuts[slug];
			if (registered_shortcut) {
				return registered_shortcut;
			}
		}
		return null;
	});

	const visible = $derived.by(() => {
		return alt_pressed && shortcut?.enabled !== false;
	});
</script>

{#if visible}
	<div class="incant-overlay-component">
		<Kbds {keys} />
	</div>
{/if}

<style>
	:global(.incant-overlay-component) {
		pointer-events: none;
		position: absolute;
		bottom: 0;
		left: 50%;
		z-index: 50;
		transform: translateX(-50%) translateY(66.666%);
	}
</style>
