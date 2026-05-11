import {
	formatHotkeySequence,
	getSequenceManager,
	type HotkeyCallback,
	type HotkeyMeta,
	type HotkeySequence,
	type SequenceOptions,
	type SequenceRegistrationHandle
} from '@tanstack/svelte-hotkeys';
import { SvelteMap } from 'svelte/reactivity';

export const CHORD_TIMEOUT_MS = 1500;

export type ChordInput = {
	sequence: HotkeySequence;
	description?: string;
	action: HotkeyCallback;
	enabled?: boolean;
	timeout?: number;
};

function canonicalize(sequence: HotkeySequence): string {
	return formatHotkeySequence(sequence);
}

// eslint-disable-next-line svelte/prefer-svelte-reactivity -- internal lookup, not consumed reactively
const handles = new Map<string, SequenceRegistrationHandle>();
const enabledState = new SvelteMap<string, boolean>();

export function add_chord(input: ChordInput): string {
	if (input.sequence.length < 2) {
		console.warn('Chords require at least 2 steps');
		return '';
	}

	const key = canonicalize(input.sequence);
	handles.get(key)?.unregister();

	const enabled = input.enabled ?? true;
	enabledState.set(key, enabled);

	const meta: HotkeyMeta = {};
	if (input.description) meta.description = input.description;

	const options: SequenceOptions = {
		enabled,
		timeout: input.timeout ?? CHORD_TIMEOUT_MS,
		meta
	};

	const handle = getSequenceManager().register(input.sequence, input.action, options);
	handles.set(key, handle);
	return key;
}

export function remove_chord(sequence: HotkeySequence): void {
	const key = canonicalize(sequence);
	handles.get(key)?.unregister();
	handles.delete(key);
	enabledState.delete(key);
}

export function toggle_chord(sequence: HotkeySequence): void {
	const key = canonicalize(sequence);
	const handle = handles.get(key);
	if (!handle?.isActive) return;
	const next = !(enabledState.get(key) ?? true);
	enabledState.set(key, next);
	handle.setOptions({ enabled: next });
}

export function isChordEnabled(sequence: HotkeySequence): boolean {
	return enabledState.get(canonicalize(sequence)) ?? true;
}
