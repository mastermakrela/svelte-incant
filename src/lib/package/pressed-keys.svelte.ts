import { getKeyStateTracker } from '@tanstack/hotkeys';

type Cleanup = () => void;

const HELD_KEY_ALIASES: Record<string, string> = {
	control: 'control',
	alt: 'alt',
	shift: 'shift',
	meta: 'meta',
	space: ' ',
	escape: 'escape'
};

function normalizeHeldKey(key: string): string {
	const lower = key.toLowerCase();
	return HELD_KEY_ALIASES[lower] ?? lower;
}

function normalizePressedKeys(keys: string[]): string[] {
	return Array.from(
		new Set(
			keys.map((key) => normalizeHeldKey(key))
		)
	).sort((a, b) => a.localeCompare(b));
}

export function getPressedKeys(): string[] {
	if (typeof window === 'undefined') return [];
	return normalizePressedKeys(getKeyStateTracker().getHeldKeys());
}

export function subscribePressedKeys(listener: (keys: string[]) => void): Cleanup {
	if (typeof window === 'undefined') {
		listener([]);
		return () => {};
	}

	const tracker = getKeyStateTracker();
	const emit = () => listener(getPressedKeys());
	emit();

	const unsubscribe = tracker.store.subscribe(emit);

	return () => {
		unsubscribe();
	};
}
