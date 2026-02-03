<script lang="ts">
	import { watch } from 'runed';
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

	watch([() => keys, () => description, () => action], () => {
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
