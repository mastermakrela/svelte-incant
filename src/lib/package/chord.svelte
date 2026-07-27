<script lang="ts">
	import { createHotkeySequence } from '@tanstack/svelte-hotkeys';
	import { toSequence, type SequenceInput } from './hotkey-utils.js';
	import { effectiveSequence, sequenceOptions } from './palette.svelte.js';

	let {
		steps,
		description,
		action,
		preventDefault
	}: {
		/**
		 * Preferred: one checked `Hotkey` per step, e.g. `{['Mod+K', 'B']}`.
		 * The space-separated string form (`"Mod+K B"`) is still accepted but unchecked.
		 */
		steps: SequenceInput;
		description?: string;
		action: () => void;
		/** Defaults to the app-wide `preventDefault` set on `<Palette />`. */
		preventDefault?: boolean;
	} = $props();

	const declared = $derived(toSequence(steps));
	const sequence = $derived(effectiveSequence(declared));

	createHotkeySequence(
		() => sequence,
		() => action(),
		() => sequenceOptions(declared, description, preventDefault, sequence)
	);
</script>
