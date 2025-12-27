import { PressedKeys, activeElement } from 'runed';

export type Shortcut = {
	keys: string[][];
	description?: string;
	action: () => void;
	enabled?: boolean;
};

class ShortcutRegistry {
	shortcuts = $state<Record<string, Shortcut>>({});
	registeredCombos = $state(new Set<string>());

	private pressedKeys = new PressedKeys();
	private cleanupCallbacks = new Map<string, () => void>();
	private isListening = false;

	constructor() {}

	private startListening(): void {
		if (this.isListening) return;

		this.isListening = true;
		$effect(() => {
			this.syncKeyboardListeners();
		});
	}

	normalizeKeys(keys: string | string[] | string[][]): string[][] {
		if (typeof keys === 'string') {
			return [[keys]];
		}

		if (keys.length === 0) {
			return [];
		}

		if (Array.isArray(keys[0])) {
			return (keys as string[][]).map((combo) => this.sortCombo(combo));
		}

		return [this.sortCombo(keys as string[])];
	}

	private sortCombo(combo: string[]): string[] {
		return [...combo].sort((a, b) => a.localeCompare(b));
	}

	private comboToString(combo: string[]): string {
		return combo.join('-');
	}

	slugify(keys: string | string[] | string[][]): string {
		const normalized = this.normalizeKeys(keys);
		return normalized
			.map((combo) => this.comboToString(combo).toLowerCase().replace(/\s+/g, '-'))
			.join('|');
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
	}

	toggle(keys: string | string[] | string[][]): void {
		const slug = this.slugify(keys);
		if (this.shortcuts[slug]) {
			this.shortcuts[slug].enabled = !this.shortcuts[slug].enabled;
		}
	}

	getShortcuts(): Shortcut[] {
		this.startListening();
		return Object.values(this.shortcuts);
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
		for (const keyCombo of shortcut.keys) {
			this.pressedKeys.onKeys(keyCombo, () => {
				const target = activeElement.current;
				const hasModifier = this.hasModifierKey(keyCombo);

				if (shortcut.enabled && (hasModifier || !this.isTypingElement(target))) {
					shortcut.action();
				}
			});
		}

		return () => {};
	}

	private hasModifierKey(keys: string[]): boolean {
		const modifierKeys = ['control', 'ctrl', 'alt', 'meta', 'command', 'cmd'];
		return keys.some((key) => modifierKeys.includes(key.toLowerCase()));
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

export const registry = new ShortcutRegistry();

export const shortcuts = registry.shortcuts;

export function add_shortcut(
	shortcut: Omit<Shortcut, 'keys'> & { keys: string | string[] | string[][] }
): void {
	registry.add(shortcut);
}

export function remove_shortcut(keys: string | string[] | string[][]): void {
	registry.remove(keys);
}

export function toggle_shortcut(keys: string | string[] | string[][]): void {
	registry.toggle(keys);
}

export function slugify(keys: string | string[] | string[][]): string {
	return registry.slugify(keys);
}

export function isArrayOfArrays(keys: unknown): keys is string[][] {
	return Array.isArray(keys) && keys.length > 0 && Array.isArray(keys[0]);
}

export function normalizeKeys(keys: string | string[] | string[][]): string[][] {
	return registry.normalizeKeys(keys);
}
