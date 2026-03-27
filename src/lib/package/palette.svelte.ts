import {
	getHotkeyManager,
	normalizeHotkey,
	parseHotkey,
	type Hotkey,
	type HotkeyCallbackContext,
	type HotkeyOptions,
	type HotkeyRegistrationHandle,
	type ParsedHotkey
} from '@tanstack/hotkeys';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { chordRegistry } from './chord.svelte.js';

export type Shortcut = {
	keys: Hotkey;
	description?: string;
	action: (keys: string[]) => void;
	enabled?: boolean;
	preventDefault?: boolean;
};

export type ShortcutRegistry = {
	shortcuts: Record<string, Shortcut>;
	registeredCombos: Set<string>;
	configure: (config: { preventDefault?: boolean }) => void;
	add: (shortcut: Shortcut) => void;
	remove: (keys: Hotkey) => void;
	toggle: (keys: Hotkey) => void;
	getShortcuts: () => Shortcut[];
	filteredShortcuts: (pressedKeys: string[]) => Shortcut[];
};

const globalConfig = $state({
	preventDefault: false
});

export const shortcuts = $state<Record<string, Shortcut>>({});
const shortcutOrder = $state<string[]>([]);
const registeredCombos = new SvelteSet<string>();
const registrations = new SvelteMap<string, HotkeyRegistrationHandle>();

const TEXT_INPUT_TYPES = new Set([
	'text',
	'password',
	'email',
	'search',
	'tel',
	'url',
	'number',
	'date',
	'datetime-local',
	'month',
	'time',
	'week'
]);

function isTypingElement(element: Element | null): boolean {
	if (!element) return false;

	const tagName = element.tagName.toLowerCase();

	if ((element as HTMLElement).isContentEditable) return true;
	if (tagName === 'textarea' || tagName === 'select') return true;
	if (tagName === 'input') {
		return TEXT_INPUT_TYPES.has((element as HTMLInputElement).type.toLowerCase());
	}

	return false;
}

function parsedHotkeyToTokens(parsed: ParsedHotkey): string[] {
	const tokens: string[] = [];
	if (parsed.ctrl) tokens.push('control');
	if (parsed.alt) tokens.push('alt');
	if (parsed.shift) tokens.push('shift');
	if (parsed.meta) tokens.push('meta');
	tokens.push(parsed.key === 'Space' ? ' ' : parsed.key.toLowerCase());
	return Array.from(new Set(tokens)).sort((a, b) => a.localeCompare(b));
}

function createRegistrationOptions(shortcut: Shortcut): HotkeyOptions {
	return {
		conflictBehavior: 'allow',
		enabled: shortcut.enabled ?? true,
		eventType: 'keydown',
		ignoreInputs: false,
		preventDefault: shortcut.preventDefault ?? globalConfig.preventDefault,
		requireReset: true,
		stopPropagation: false
	};
}

function syncShortcutRegistration(slug: string): void {
	const shortcut = shortcuts[slug];
	const existingRegistration = registrations.get(slug);

	if (!shortcut) {
		existingRegistration?.unregister();
		registrations.delete(slug);
		return;
	}

	const parsedHotkey = parseHotkey(shortcut.keys);
	const hasModifierKey =
		parsedHotkey.ctrl || parsedHotkey.alt || parsedHotkey.shift || parsedHotkey.meta;

	const callback = (event: KeyboardEvent, context: HotkeyCallbackContext) => {
		const target = event.target as Element | null;

		if (shortcut.enabled === false) return;
		if (!hasModifierKey && isTypingElement(target)) return;
		if (chordRegistry.isChordPrefix(shortcut.keys)) return;

		shortcut.action(parsedHotkeyToTokens(context.parsedHotkey));
	};

	const options = createRegistrationOptions(shortcut);

	if (existingRegistration) {
		existingRegistration.callback = callback;
		existingRegistration.setOptions(options);
		return;
	}

	const registration = getHotkeyManager().register(shortcut.keys, callback, options);
	registrations.set(slug, registration);
}

function syncAllShortcutRegistrations(): void {
	for (const slug of Object.keys(shortcuts)) {
		syncShortcutRegistration(slug);
	}

	for (const slug of [...registrations.keys()]) {
		if (!(slug in shortcuts)) {
			syncShortcutRegistration(slug);
		}
	}
}

function configureRegistry(config: { preventDefault?: boolean }): void {
	if (config.preventDefault !== undefined) {
		globalConfig.preventDefault = config.preventDefault;
		syncAllShortcutRegistrations();
	}
}

export function add_shortcut(shortcut: Shortcut): void {
	const normalizedKeys = normalizeHotkey(shortcut.keys);
	const slug = normalizedKeys;
	const existing = shortcuts[slug];
	if (
		existing &&
		(existing.action !== shortcut.action || existing.description !== shortcut.description)
	) {
		console.warn(
			`Shortcut collision detected: "${normalizedKeys}" already registered${shortcut.description ? ` (trying to register: "${shortcut.description}")` : ''}`
		);
	}

	shortcuts[slug] = {
		...shortcut,
		keys: normalizedKeys,
		enabled: shortcut.enabled ?? true
	};

	if (!shortcutOrder.includes(slug)) {
		shortcutOrder.push(slug);
	}

	registeredCombos.add(normalizedKeys);
	syncShortcutRegistration(slug);
}

export function remove_shortcut(keys: Hotkey): void {
	const slug = normalizeHotkey(keys);
	const shortcut = shortcuts[slug];

	if (!shortcut) {
		console.warn(`Shortcut not found for keys: ${JSON.stringify(keys)}`);
		return;
	}

	registeredCombos.delete(shortcut.keys);
	delete shortcuts[slug];

	const index = shortcutOrder.indexOf(slug);
	if (index > -1) {
		shortcutOrder.splice(index, 1);
	}

	syncShortcutRegistration(slug);
}

export function toggle_shortcut(keys: Hotkey): void {
	const slug = normalizeHotkey(keys);
	const shortcut = shortcuts[slug];
	if (!shortcut) return;

	shortcut.enabled = !shortcut.enabled;
	syncShortcutRegistration(slug);
}

function getShortcuts(): Shortcut[] {
	return shortcutOrder
		.map((slug) => shortcuts[slug])
		.filter((shortcut): shortcut is Shortcut => shortcut !== undefined);
}

function filteredShortcuts(pressedKeys: string[]): Shortcut[] {
	const allShortcuts = getShortcuts();

	if (pressedKeys.length === 0) {
		return allShortcuts;
	}

	const filteredPressedKeys = pressedKeys.filter(
		(key) => ['?', '/', ' ', 'escape'].indexOf(key.toLowerCase()) === -1
	);

	return allShortcuts.filter((shortcut) => {
		const tokens = parsedHotkeyToTokens(parseHotkey(shortcut.keys));
		return tokens.some((token) =>
			filteredPressedKeys.some((pressedKey) => token.toLowerCase() === pressedKey.toLowerCase())
		);
	});
}

export const registry: ShortcutRegistry = {
	shortcuts,
	registeredCombos,
	configure: configureRegistry,
	add: add_shortcut,
	remove: remove_shortcut,
	toggle: toggle_shortcut,
	getShortcuts,
	filteredShortcuts
};

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
