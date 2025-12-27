<script lang="ts">
	import { PressedKeys } from 'runed';
	import Kbds from '$lib/components/kbds.svelte';

	export type OverlayComponentProps = {
		keys: string | string[] | string[][];
	};

	let { keys }: OverlayComponentProps = $props();

	const pressed_keys = new PressedKeys();
	const visible = $derived(pressed_keys.has('alt'));
</script>

{#if visible}
	<div class="pointer-events-none absolute bottom-0 left-1/2 z-50 -translate-x-1/2 translate-y-2/3">
		<Kbds {keys} />
	</div>
{/if}
