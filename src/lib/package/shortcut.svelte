<script lang="ts">
	import { watch } from 'runed';
	import { add_shortcut, remove_shortcut } from './palette.svelte.js';

	let {
		keys,
		description,
		action,
		preventDefault
	}: {
		keys: string | string[] | string[][];
		description?: string;
		action: () => void;
		preventDefault?: boolean;
	} = $props();

	watch([() => keys, () => description, () => action, () => preventDefault], () => {
		add_shortcut({
			keys,
			description,
			action,
			preventDefault
		});

		return () => {
			remove_shortcut(keys);
		};
	});
</script>
