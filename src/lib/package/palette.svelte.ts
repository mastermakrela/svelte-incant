import { PressedKeys, activeElement } from 'runed';
import { on } from 'svelte/events';
import { chordRegistry } from './chord.svelte.js';

export type Shortcut = {
	keys: string[][];
	description?: string;
	action: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
};

export function isArrayOfArrays(keys: unknown): keys is string[][] {
	return Array.isArray(keys) && keys.length > 0 && Array.isArray(keys[0]);
}

export function sortCombo(combo: string[]): string[] {
	return [...combo].sort((a, b) => a.localeCompare(b));
}

export function comboToString(combo: string[]): string {
	return combo.join('-');
}

export function normalizeKeys(keys: string | string[] | string[][]): string[][] {
	if (typeof keys === 'string') {
		return [[keys]];
	}

	if (keys.length === 0) {
		return [];
	}

	if (Array.isArray(keys[0])) {
		return (keys as string[][]).map((combo) => sortCombo(combo));
	}

	return [sortCombo(keys as string[])];
}

export function slugify(keys: string | string[] | string[][]): string {
	const normalized = normalizeKeys(keys);
	return normalized
		.map((combo) => comboToString(combo).toLowerCase().replace(/\s+/g, '-'))
		.join('|');
}

// Global config for shortcuts
const globalConfig = $state({
	preventDefault: false
});

class ShortcutRegistry {
	shortcuts = $state<Record<string, Shortcut>>({});
	private shortcutOrder: string[] = [];
	registeredCombos = $state(new Set<string>());

	private pressedKeys = new PressedKeys();
	private cleanupCallbacks = new Map<string, () => void>();
	private isListening = false;
	private preventDefaultCleanups: (() => void)[] = [];

	constructor() {}

	configure(config: { preventDefault?: boolean }): void {
		if (config.preventDefault !== undefined) {
			globalConfig.preventDefault = config.preventDefault;
			// Re-sync listeners to apply new config
			this.syncKeyboardListeners();
		}
	}

	private startListening(): void {
		if (this.isListening) {
			console.warn('Keyboard listeners already started');
			return;
		}

		this.isListening = true;
		$effect(() => {
			this.syncKeyboardListeners();

			return () => {
				this.isListening = false;
			};
		});
	}

	normalizeKeys(keys: string | string[] | string[][]): string[][] {
		return normalizeKeys(keys);
	}

	slugify(keys: string | string[] | string[][]): string {
		return slugify(keys);
	}

	private comboToString(combo: string[]): string {
		return comboToString(combo);
	}

	private checkCollision(keys: string[][], description?: string): boolean {
		for (const combo of keys) {
			const comboString = this.comboToString(combo);
			if (this.registeredCombos.has(comboString)) {
				console.warn(
					`Shortcut collision detected: "${comboString}" already registered${description ? ` (trying to register: "${description}")` : ''}`
				);
				return true;
			}
		}
		return false;
	}

	add(shortcut: Omit<Shortcut, 'keys'> & { keys: string | string[] | string[][] }): void {
		this.startListening();

		const normalizedKeys = this.normalizeKeys(shortcut.keys);

		if (normalizedKeys.length === 0) {
			console.warn('Cannot add shortcut with no keys');
			return;
		}

		this.checkCollision(normalizedKeys, shortcut.description);

		const slug = this.slugify(shortcut.keys);

		for (const combo of normalizedKeys) {
			const comboString = this.comboToString(combo);
			this.registeredCombos.add(comboString);
		}

		this.shortcuts[slug] = {
			...shortcut,
			keys: normalizedKeys,
			enabled: shortcut.enabled ?? true
		};

		if (!this.shortcutOrder.includes(slug)) {
			this.shortcutOrder.push(slug);
		}
	}

	remove(keys: string | string[] | string[][]): void {
		const slug = this.slugify(keys);
		const shortcut = this.shortcuts[slug];

		if (!shortcut) {
			console.warn(`Shortcut not found for keys: ${JSON.stringify(keys)}`);
			return;
		}

		for (const combo of shortcut.keys) {
			const comboString = this.comboToString(combo);
			this.registeredCombos.delete(comboString);
		}

		delete this.shortcuts[slug];
		const index = this.shortcutOrder.indexOf(slug);
		if (index > -1) {
			this.shortcutOrder.splice(index, 1);
		}
	}

	toggle(keys: string | string[] | string[][]): void {
		const slug = this.slugify(keys);
		if (this.shortcuts[slug]) {
			this.shortcuts[slug].enabled = !this.shortcuts[slug].enabled;
		}
	}

	getShortcuts(): Shortcut[] {
		this.startListening();
		return this.shortcutOrder
			.map((slug) => this.shortcuts[slug])
			.filter((shortcut): shortcut is Shortcut => shortcut !== undefined);
	}

	filteredShortcuts(pressedKeys: string[]): Shortcut[] {
		const allShortcuts = this.getShortcuts();

		if (pressedKeys.length === 0) {
			return allShortcuts;
		}

		const filteredPressedKeys = pressedKeys.filter(
			(key) => ['?', '/', ' ', 'escape'].indexOf(key) === -1
		);

		return allShortcuts.filter((shortcut) => {
			return shortcut.keys.some((keyCombo) =>
				keyCombo.some((key) =>
					filteredPressedKeys.some((pressedKey) => key.toLowerCase() === pressedKey.toLowerCase())
				)
			);
		});
	}

	private syncKeyboardListeners(): void {
		for (const [slug, cleanup] of this.cleanupCallbacks) {
			cleanup();
			this.cleanupCallbacks.delete(slug);
		}

		for (const [slug, shortcut] of Object.entries(this.shortcuts)) {
			const cleanup = this.setupKeyboardListener(shortcut);
			this.cleanupCallbacks.set(slug, cleanup);
		}
	}

	private setupKeyboardListener(shortcut: Shortcut): () => void {
		const cleanups: (() => void)[] = [];

		for (const keyCombo of shortcut.keys) {
			// Set up pressed keys listener for action
			this.pressedKeys.onKeys(keyCombo, () => {
				const target = activeElement.current;
				const hasModifier = this.hasModifierKey(keyCombo);

				if (shortcut.enabled && (hasModifier || !this.isTypingElement(target))) {
					if (this.isChordPrefix(keyCombo)) {
						return;
					}
					// Check if a more specific shortcut should take priority
					if (this.hasMoreSpecificMatch(keyCombo)) {
						return; // Let the more specific shortcut handle this
					}
					shortcut.action();
				}
			});

			// Set up preventDefault listener if enabled globally or for this shortcut
			const shouldPreventDefault = shortcut.preventDefault ?? globalConfig.preventDefault;
			if (shouldPreventDefault && typeof window !== 'undefined') {
				const cleanup = on(
					window,
					'keydown',
					(event: KeyboardEvent) => {
						// Check if keys match this shortcut
						const allPressed = this.pressedKeys.all;
						const sortedPressed = [...allPressed].sort((a: string, b: string) =>
							a.localeCompare(b)
						);
						const sortedCombo = [...keyCombo].sort((a, b) => a.localeCompare(b));

						if (
							sortedPressed.length === sortedCombo.length &&
							sortedPressed.every(
								(key: string, i: number) => key.toLowerCase() === sortedCombo[i]!.toLowerCase()
							)
						) {
							// Only prevent default if not in typing element (unless has modifier)
							const target = event.target as Element;
							const hasModifier = this.hasModifierKey(keyCombo);
							if (shortcut.enabled && (hasModifier || !this.isTypingElement(target))) {
								event.preventDefault();
							}
						}
					},
					{ capture: true }
				);
				cleanups.push(cleanup);
			}
		}

		return () => {
			for (const cleanup of cleanups) {
				cleanup();
			}
		};
	}

	private hasModifierKey(keys: string[]): boolean {
		const modifierKeys = ['control', 'ctrl', 'alt', 'meta', 'command', 'cmd'];
		return keys.some((key) => modifierKeys.includes(key.toLowerCase()));
	}

	/**
	 * Calculate specificity score for a key combination.
	 * More keys = higher specificity = should take priority.
	 */
	private getSpecificity(combo: string[]): number {
		return combo.length;
	}

	/**
	 * Check if there's a more specific shortcut that matches current pressed keys.
	 * Returns true if the given combo is NOT the most specific match.
	 */
	private hasMoreSpecificMatch(combo: string[]): boolean {
		const currentSpecificity = this.getSpecificity(combo);
		const allPressed = this.pressedKeys.all;

		// Check all registered shortcuts for a more specific match
		for (const shortcut of Object.values(this.shortcuts)) {
			if (!shortcut.enabled) continue;

			for (const otherCombo of shortcut.keys) {
				const otherSpecificity = this.getSpecificity(otherCombo);

				// Only consider more specific combos (more keys)
				if (otherSpecificity <= currentSpecificity) continue;

				// Check if the more specific combo is currently pressed
				const allKeysPresent = otherCombo.every((key) =>
					allPressed.some((pressed) => pressed.toLowerCase() === key.toLowerCase())
				);

				if (allKeysPresent) {
					return true; // Found a more specific match
				}
			}
		}

		return false;
	}

	private isChordPrefix(keys: string[]): boolean {
		return chordRegistry.isChordPrefix(keys);
	}

	private isTypingElement(element: Element | null): boolean {
		if (!element) return false;

		const tagName = element.tagName.toLowerCase();

		if ((element as HTMLElement).isContentEditable) return true;

		if (tagName === 'textarea') return true;

		if (tagName === 'input') {
			const inputType = (element as HTMLInputElement).type.toLowerCase();
			const textTypes = [
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
			];
			return textTypes.includes(inputType);
		}

		return false;
	}
}

let _registry: ShortcutRegistry | null = null;

function getRegistry(): ShortcutRegistry {
	if (!_registry) {
		_registry = new ShortcutRegistry();
	}
	return _registry;
}

export const registry: ShortcutRegistry = new Proxy({} as ShortcutRegistry, {
	get(_, prop) {
		return getRegistry()[prop as keyof ShortcutRegistry];
	}
});

export const shortcuts: Record<string, Shortcut> = new Proxy(
	{},
	{
		get(_, prop) {
			const registry = getRegistry();
			return registry.shortcuts[prop as string];
		},
		has(_, prop) {
			const registry = getRegistry();
			return prop in registry.shortcuts;
		}
	}
);

export function add_shortcut(
	shortcut: Omit<Shortcut, 'keys'> & { keys: string | string[] | string[][] }
): void {
	getRegistry().add(shortcut);
}

export function remove_shortcut(keys: string | string[] | string[][]): void {
	getRegistry().remove(keys);
}

export function toggle_shortcut(keys: string | string[] | string[][]): void {
	getRegistry().toggle(keys);
}

// Global palette state for programmatic control
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
