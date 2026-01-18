<script lang="ts">
	import { onMount } from 'svelte';
	import { add_chord, remove_chord } from './chord.svelte.js';

	let {
		steps,
		description,
		action
	}: {
		steps: string[][];
		description?: string;
		action: () => void;
	} = $props();

	onMount(() => {
		add_chord({
			steps,
			description,
			action
		});

		return () => {
			remove_chord(steps);
		};
	});
</script>
