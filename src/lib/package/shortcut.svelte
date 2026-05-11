<script lang="ts">
	import type { RegisterableHotkey } from '@tanstack/svelte-hotkeys';
	import { watch } from 'runed';
	import { add_shortcut, remove_shortcut } from './palette.svelte.js';

	let {
		hotkey,
		description,
		action,
		preventDefault
	}: {
		hotkey: RegisterableHotkey;
		description?: string;
		action: () => void;
		preventDefault?: boolean;
	} = $props();

	watch([() => hotkey, () => description, () => action, () => preventDefault], () => {
		add_shortcut({
			hotkey,
			description,
			action,
			preventDefault
		});

		return () => {
			remove_shortcut(hotkey);
		};
	});
</script>
