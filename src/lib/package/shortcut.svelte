<script lang="ts">
	import type { Hotkey } from '@tanstack/hotkeys';
	import { watch } from 'runed';
	import { add_shortcut, remove_shortcut } from './palette.svelte.js';

	let {
		keys,
		description,
		action
	}: {
		keys: Hotkey;
		description?: string;
		action: (keys: string[]) => void;
	} = $props();

	watch([() => keys, () => description, () => action], ([keys, description, action]) => {
		add_shortcut({
			keys,
			description,
			action
		});

		return () => {
			remove_shortcut(keys);
		};
	});
</script>
