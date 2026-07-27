import {
	normalizeHotkey,
	parseHotkey,
	type Hotkey,
	type HotkeySequence,
	type ParsedHotkey
} from '@tanstack/svelte-hotkeys';

declare module '@tanstack/hotkeys' {
	interface HotkeyMeta {
		/**
		 * Marks a registration as created by incant. The palette lists only its own
		 * registrations, not the ones the host app made against the shared manager.
		 */
		incant?: boolean;
		/**
		 * The combo as written in the markup, before any palette rebind. incant's
		 * per-shortcut preferences (enabled, rebound-to) are keyed by it, so it has to
		 * survive the round trip through the manager.
		 */
		declared?: string;
	}
}

/** A whitespace-separated list of hotkeys forming a chord, e.g. `"Mod+K B"`. */
export type SequenceSpec = string;

/**
 * The steps of a chord. Prefer the array form — every step is a {@link Hotkey}, so
 * each one gets IntelliSense and a typo is a compile error:
 *
 * ```svelte
 * <Chord steps={['Mod+K', 'B']} … />
 * <Chord steps="Mod+K B" … />   <!-- also accepted, but unchecked -->
 * ```
 */
export type SequenceInput = HotkeySequence | SequenceSpec;

function assertNonEmpty(spec: string, kind: 'sequence' | 'hotkey tokens'): string {
	const value = spec.trim();
	if (!value) {
		if (kind === 'sequence') throw new Error('sequence spec cannot be empty');
		throw new Error('hotkey tokens cannot be empty');
	}
	return value;
}

function parsedHotkeyToTokens(parsed: ParsedHotkey): string[] {
	const tokens = [...parsed.modifiers, parsed.key].map((token) => token.toLowerCase());
	return Array.from(new Set(tokens)).sort((a, b) => a.localeCompare(b));
}

/** Lower-cased, sorted tokens of a hotkey — used for matching against held keys. */
export function toHotkeyTokens(hotkey: Hotkey): string[] {
	return parsedHotkeyToTokens(parseHotkey(normalizeHotkey(hotkey)));
}

export function parseSequence(spec: SequenceSpec): HotkeySequence {
	return assertNonEmpty(spec, 'sequence')
		.split(/\s+/)
		.filter(Boolean)
		.map((step) => normalizeHotkey(step));
}

/** Both accepted chord shapes, narrowed to canonical steps. Blank input yields `[]`. */
export function toSequence(steps: SequenceInput): HotkeySequence {
	if (Array.isArray(steps)) return steps.map((step) => normalizeHotkey(step));
	return steps.trim() ? parseSequence(steps) : [];
}

export function toSequenceStepTokens(steps: SequenceInput): string[][] {
	return toSequence(steps).map((step) => toHotkeyTokens(step));
}

export function tokensToHotkey(tokens: string[]): Hotkey {
	const spec = tokens.map((token) => (token === ' ' ? 'Space' : token)).join('+');
	return normalizeHotkey(assertNonEmpty(spec, 'hotkey tokens'));
}
