<script lang="ts">
	import { watch } from 'runed';
	import { add_chord, remove_chord } from './chord.svelte.js';
	import type { SequenceSpec } from './hotkey-utils.js';

	let {
		steps,
		description,
		action
	}: {
		steps: SequenceSpec;
		description?: string;
		action: () => void;
	} = $props();

	watch([() => steps, () => description, () => action], ([steps, description, action]) => {
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
