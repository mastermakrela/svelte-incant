<script lang="ts">
	import type { HotkeySequence } from '@tanstack/svelte-hotkeys';
	import { watch } from 'runed';
	import { add_chord, remove_chord } from './chord.svelte.js';

	let {
		sequence,
		description,
		action
	}: {
		sequence: HotkeySequence;
		description?: string;
		action: () => void;
	} = $props();

	watch([() => sequence, () => description, () => action], () => {
		add_chord({
			sequence,
			description,
			action
		});

		return () => {
			remove_chord(sequence);
		};
	});
</script>
