<script lang="ts">
	import { onMount } from 'svelte';
	import { add_shortcut, remove_shortcut } from './palette.svelte.js';

	let {
		keys,
		description,
		action
	}: {
		keys: string | string[] | string[][];
		description?: string;
		action: () => void;
	} = $props();

	onMount(() => {
		add_shortcut({
			keys,
			description,
			action
		});

		return () => {
			remove_shortcut({
				keys,
				description,
				action
			});
		};
	});
</script>
