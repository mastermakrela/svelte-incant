<script lang="ts">
	import {
		createHotkey,
		normalizeRegisterableHotkey,
		type RegisterableHotkey
	} from '@tanstack/svelte-hotkeys';
	import { toHotkeyTokens } from './hotkey-utils.js';
	import { effectiveHotkey, hotkeyOptions, isSequencePrefix } from './palette.svelte.js';

	let {
		keys,
		description,
		action,
		preventDefault
	}: {
		/** A checked hotkey string (`'Mod+Shift+S'`) or a `RawHotkey` object built at runtime. */
		keys: RegisterableHotkey;
		description?: string;
		action: (keys: string[]) => void;
		/** Defaults to the app-wide `preventDefault` set on `<Palette />`. */
		preventDefault?: boolean;
	} = $props();

	const declared = $derived(normalizeRegisterableHotkey(keys));
	const hotkey = $derived(effectiveHotkey(declared));

	createHotkey(
		() => hotkey,
		() => {
			if (isSequencePrefix(hotkey)) return;
			action(toHotkeyTokens(hotkey));
		},
		() => hotkeyOptions(declared, description, preventDefault, hotkey)
	);
</script>
