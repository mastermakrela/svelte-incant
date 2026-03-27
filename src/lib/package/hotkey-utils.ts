import { normalizeHotkey, parseHotkey, type Hotkey, type ParsedHotkey } from '@tanstack/hotkeys';

export type SequenceSpec = string;

function assertNonEmpty(spec: string, kind: 'sequence' | 'hotkey tokens'): string {
	const value = spec.trim();
	if (!value) {
		if (kind === 'sequence') throw new Error('sequence spec cannot be empty');
		throw new Error('hotkey tokens cannot be empty');
	}
	return value;
}

function parsedHotkeyToTokens(parsed: ParsedHotkey): string[] {
	const tokens: string[] = [];
	if (parsed.ctrl) tokens.push('control');
	if (parsed.alt) tokens.push('alt');
	if (parsed.shift) tokens.push('shift');
	if (parsed.meta) tokens.push('meta');

	const key = parsed.key;
	tokens.push(key === 'Space' ? ' ' : key.toLowerCase());

	return Array.from(new Set(tokens)).sort((a, b) => a.localeCompare(b));
}

export function toHotkeyTokens(hotkey: Hotkey): string[] {
	return parsedHotkeyToTokens(parseHotkey(normalizeHotkey(hotkey)));
}

export function parseSequence(spec: SequenceSpec): Hotkey[] {
	return assertNonEmpty(String(spec), 'sequence')
		.split(/\s+/)
		.filter(Boolean)
		.map((step) => normalizeHotkey(step));
}

export function toSequenceStepTokens(spec: SequenceSpec | Hotkey[]): string[][] {
	const steps = Array.isArray(spec)
		? spec.map((step) => normalizeHotkey(step))
		: parseSequence(spec);
	return steps.map((step) => toHotkeyTokens(step));
}

export function tokensToHotkey(tokens: string[]): Hotkey {
	const spec = tokens.map((token) => (token === ' ' ? 'Space' : token)).join('+');
	return normalizeHotkey(assertNonEmpty(spec, 'hotkey tokens'));
}
