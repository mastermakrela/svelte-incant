<script lang="ts">
	import type { RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import { shortcut } from '../attachment.svelte.js';

	let {
		keys,
		text = 'Bookmark',
		kind = 'button'
	}: {
		keys?: RegisterableHotkey;
		text?: string;
		kind?: 'button' | 'input';
	} = $props();
</script>

{#if kind === 'input'}
	<label for="incant-fixture">{text}</label>
	<input id="incant-fixture" {@attach shortcut({ keys, description: 'Fixture' })} />
{:else}
	<button {@attach shortcut({ keys, description: 'Fixture' })}>{text}</button>
{/if}
