import {
	detectPlatform,
	getHotkeyManager,
	getIsKeyHeld,
	normalizeRegisterableHotkey,
	type HotkeyCallback,
	type HotkeyMeta,
	type HotkeyOptions,
	type HotkeyRegistrationHandle,
	type RegisterableHotkey
} from '@tanstack/svelte-hotkeys';
import { SvelteMap } from 'svelte/reactivity';

export type ShortcutInput = {
	hotkey: RegisterableHotkey;
	description?: string;
	action: HotkeyCallback;
	enabled?: boolean;
	preventDefault?: boolean;
	ignoreInputs?: boolean;
};

const PLATFORM = detectPlatform();

function canonicalize(hotkey: RegisterableHotkey): string {
	return normalizeRegisterableHotkey(hotkey, PLATFORM);
}

export const altHeld =
	typeof document === 'undefined'
		? {
				get held() {
					return false;
				}
			}
		: getIsKeyHeld('Alt');

// eslint-disable-next-line svelte/prefer-svelte-reactivity -- internal lookup, not consumed reactively
const handles = new Map<string, HotkeyRegistrationHandle>();
const enabledState = new SvelteMap<string, boolean>();

export function add_shortcut(input: ShortcutInput): string {
	const key = canonicalize(input.hotkey);

	const existing = handles.get(key);
	if (existing?.isActive) {
		existing.unregister();
	}

	const enabled = input.enabled ?? true;
	enabledState.set(key, enabled);

	const meta: HotkeyMeta = {};
	if (input.description) meta.description = input.description;

	const options: HotkeyOptions = { enabled, meta };
	if (input.preventDefault !== undefined) options.preventDefault = input.preventDefault;
	if (input.ignoreInputs !== undefined) options.ignoreInputs = input.ignoreInputs;

	const handle = getHotkeyManager().register(input.hotkey, input.action, options);
	handles.set(key, handle);
	return key;
}

export function remove_shortcut(hotkey: RegisterableHotkey): void {
	const key = canonicalize(hotkey);
	handles.get(key)?.unregister();
	handles.delete(key);
	enabledState.delete(key);
}

export function toggle_shortcut(hotkey: RegisterableHotkey): void {
	const key = canonicalize(hotkey);
	const handle = handles.get(key);
	if (!handle?.isActive) return;
	const next = !(enabledState.get(key) ?? true);
	enabledState.set(key, next);
	handle.setOptions({ enabled: next });
}

export function isShortcutEnabled(hotkey: RegisterableHotkey): boolean {
	return enabledState.get(canonicalize(hotkey)) ?? true;
}

export const paletteState = $state({ open: false });

export function openPalette(): void {
	paletteState.open = true;
}

export function closePalette(): void {
	paletteState.open = false;
}

export function togglePalette(): void {
	paletteState.open = !paletteState.open;
}
