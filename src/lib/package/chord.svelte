<script lang="ts">
	import { watch } from 'runed';
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

	watch([() => steps, () => description, () => action], () => {
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
