<script lang="ts">
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { PressedKeys } from 'runed';

	import { keyToSymbol } from './utils.js';

	export type OverlayComponentProps = {
		keys: string | string[] | string[][];
	};

	let { keys }: OverlayComponentProps = $props();

	const pressed_keys = new PressedKeys();
	const visible = $derived(pressed_keys.has('alt'));
</script>

{#if visible}
	<div class="pointer-events-none absolute bottom-0 left-1/2 z-50 -translate-x-1/2 translate-y-2/3">
		<Kbd.Group class="text-xs">
			{#if Array.isArray(keys)}
				{#if Array.isArray(keys[0])}
					{#each keys as item, index (index)}
						{keys}
					{/each}
				{:else}
					<Kbd.Root>{keys.map(keyToSymbol).join(' ')}</Kbd.Root>
				{/if}
			{:else}
				<Kbd.Root>{keys}</Kbd.Root>
			{/if}

			<!-- {#each formatKeysForDisplay(keys) as item, index (index)}
				{#if item.type === 'kbd'}
					<Kbd.Root>{item.content}</Kbd.Root>
				{:else}
					<span>{item.content}</span>
				{/if}
			{/each} -->
		</Kbd.Group>
	</div>
{/if}
