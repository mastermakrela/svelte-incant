<script lang="ts">
	import type { RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import { shortcut } from '../attachment.svelte.js';

	let {
		keys,
		text = 'Bookmark',
		kind = 'button',
		description = 'Fixture'
	}: {
		keys?: RegisterableHotkey;
		text?: string;
		kind?: 'button' | 'input';
		description?: string;
	} = $props();
</script>

{#if kind === 'input'}
	<label for="incant-fixture">{text}</label>
	<input id="incant-fixture" {@attach shortcut({ keys, description })} />
{:else}
	<button {@attach shortcut({ keys, description })}>{text}</button>
{/if}
