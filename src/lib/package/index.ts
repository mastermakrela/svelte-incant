export { default as Chord } from './chord.svelte';
export { default as Focus } from './focus.svelte';
export type { Hotkey } from '@tanstack/hotkeys';
export type { SequenceSpec } from './hotkey-utils.js';
export { default as Palette } from './palette.svelte';
export type { PalettePosition } from './palette.svelte';
export { default as Shortcut } from './shortcut.svelte';

export { shortcut } from './attachment.svelte.js';
export { chordRegistry, chords, get_current_progress } from './chord.svelte.js';
export {
	closePalette,
	openPalette,
	paletteState,
	shortcuts,
	togglePalette
} from './palette.svelte.js';
