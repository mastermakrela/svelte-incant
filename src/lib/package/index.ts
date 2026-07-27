export { default as Chord } from './chord.svelte';
export { default as Focus } from './focus.svelte';
export { default as Palette } from './palette.svelte';
export type { PalettePosition } from './palette.svelte';
export { default as Shortcut } from './shortcut.svelte';

export type {
	CanonicalModifier,
	Hotkey,
	HotkeySequence,
	RawHotkey,
	RegisterableHotkey
} from '@tanstack/svelte-hotkeys';
export type { SequenceInput, SequenceSpec } from './hotkey-utils.js';

export { shortcut, type ShortcutConfig } from './attachment.svelte.js';
export {
	closePalette,
	openPalette,
	paletteState,
	rebind,
	shortcuts,
	togglePalette,
	type IncantShortcut
} from './palette.svelte.js';
