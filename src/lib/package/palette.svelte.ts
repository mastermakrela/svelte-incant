import {
	DEFAULT_SEQUENCE_TIMEOUT,
	formatHotkeySequence,
	getHeldKeys,
	getHotkeyRegistrations,
	getSequenceManager,
	normalizeHotkey,
	parseHotkey,
	type CanonicalModifier,
	type Hotkey,
	type HotkeyOptions,
	type HotkeySequence,
	type SequenceOptions,
	type SequenceRegistrationView
} from '@tanstack/svelte-hotkeys';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

/** How long a chord waits for its next step. TanStack's own default is 1000ms. */
export const SEQUENCE_TIMEOUT_MS = 1500;

/**
 * App-wide defaults, shared by every incant surface. `Palette` writes to it, everything
 * else reads — components and the `shortcut()` attachment alike.
 *
 * NOTE: deliberately *not* TanStack's `HotkeysProvider`. Provider defaults are only merged
 * in by `createHotkey`/`createHotkeySequence`; incant's attachment must call
 * `getHotkeyManager().register()` directly to stay global, and would silently ignore them.
 */
export const incantConfig = $state<{
	revealModifier: CanonicalModifier;
	deriveModifier: CanonicalModifier | null;
	sequenceTimeout: number;
	preventDefault: boolean;
}>({
	revealModifier: 'Alt',
	deriveModifier: 'Control',
	sequenceTimeout: SEQUENCE_TIMEOUT_MS,
	preventDefault: false
});

// ---------------------------------------------------------------------------
// Soft enable/disable
//
// The manager owns `enabled`, but nothing in it remembers a *user* preference,
// so incant keeps the set of hotkeys the palette toggled off and feeds it back
// through `options.enabled` on every registration.
// ---------------------------------------------------------------------------

const disabled = new SvelteSet<string>();

/**
 * `key` is always the *declared* combo — the one written in the markup — so a shortcut
 * keeps its enabled state across a rebind. See {@link rebind}.
 */
export function isEnabled(key: string): boolean {
	return !disabled.has(key);
}

export function toggleEnabled(key: string): void {
	if (!disabled.delete(key)) disabled.add(key);
}

// ---------------------------------------------------------------------------
// Rebinding
//
// Same shape as `disabled`, for the same reason: the manager has no memory of a
// *user* preference, so incant keeps one and applies it at registration time.
// Keyed by the declared combo — not the effective one — so the override survives
// the shortcut being unmounted and re-registered.
//
// In memory only: nothing is persisted, so overrides are lost on reload.
// ---------------------------------------------------------------------------

const overrides = new SvelteMap<string, HotkeySequence>();

/**
 * Overrides are keyed by the *normalized* declared combo — the shape
 * `normalizeRegisterableHotkey` gives the components — so a raw string from app code
 * (`'Control+L'`, which normalizes to `'Mod+L'` on Windows/Linux) still finds its row.
 */
function normalizeDeclared(declared: string): string {
	return formatHotkeySequence(
		declared
			.trim()
			.split(/\s+/)
			.filter(Boolean)
			.map((step) => normalizeHotkey(step))
	);
}

/**
 * Replace what a shortcut listens for. `steps` is one hotkey for a plain shortcut and
 * one per step for a chord; an empty array restores the declared combo.
 */
export function rebind(declared: string, steps: HotkeySequence): void {
	const key = normalizeDeclared(declared);
	if (steps.length === 0) overrides.delete(key);
	else
		overrides.set(
			key,
			steps.map((step) => normalizeHotkey(step))
		);
}

export function isRebound(declared: string): boolean {
	return overrides.has(declared);
}

/** The combo a plain shortcut should actually register, override applied. */
export function effectiveHotkey(declared: Hotkey): Hotkey {
	return overrides.get(declared)?.[0] ?? declared;
}

/** The steps a chord should actually register, override applied. */
export function effectiveSequence(declared: HotkeySequence): HotkeySequence {
	return overrides.get(sequenceKey(declared)) ?? declared;
}

// ---------------------------------------------------------------------------
// Registration options
// ---------------------------------------------------------------------------

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

export function isTypingElement(element: EventTarget | null): boolean {
	if (!(element instanceof Element)) return false;

	const tagName = element.tagName.toLowerCase();

	if ((element as HTMLElement).isContentEditable) return true;
	if (tagName === 'textarea' || tagName === 'select') return true;
	if (tagName === 'input') {
		return TEXT_INPUT_TYPES.has((element as HTMLInputElement).type.toLowerCase());
	}

	return false;
}

/**
 * Whether a combo may fire while the user is typing in an input. TanStack's own
 * default exempts only Ctrl/Meta combos and Escape; incant additionally exempts
 * `Alt+key`, so Alt-derived shortcuts keep working inside inputs. Shift-only and
 * unmodified combos ARE typing (a capital letter is `Shift+key`), so the manager
 * ignores them before it applies `preventDefault` — a callback-side guard could not
 * stop the event's default action.
 */
function firesWhileTyping(hotkey: Hotkey | undefined): boolean {
	if (!hotkey) return false;
	const parsed = parseHotkey(hotkey);
	return parsed.ctrl || parsed.meta || parsed.alt || parsed.key === 'Escape';
}

/**
 * The options the palette mutates at runtime, shared by initial registration and the
 * `setOptions` updates — one definition so the two cannot drift.
 */
export function dynamicHotkeyOptions(
	declared: string,
	preventDefault?: boolean
): { enabled: boolean; preventDefault: boolean } {
	return {
		enabled: isEnabled(declared),
		preventDefault: preventDefault ?? incantConfig.preventDefault
	};
}

/**
 * Registration options are always target-less: incant's shortcuts are global.
 * `declared` is the combo written in the markup, which is what the enable/disable and
 * rebind preferences are keyed by — it travels in `meta` so the palette can find it again.
 * `effective` is what is actually registered (override applied); the typing exemption is
 * computed from it, since that is what the user presses.
 */
export function hotkeyOptions(
	declared: Hotkey,
	description?: string,
	preventDefault?: boolean,
	effective: Hotkey = declared
): Omit<HotkeyOptions, 'target'> {
	return {
		...dynamicHotkeyOptions(declared, preventDefault),
		eventType: 'keydown',
		ignoreInputs: !firesWhileTyping(effective),
		requireReset: true,
		stopPropagation: false,
		meta: { incant: true, description, declared }
	};
}

export function sequenceKey(steps: Hotkey[]): string {
	return formatHotkeySequence(steps);
}

export function sequenceOptions(
	declared: HotkeySequence,
	description?: string,
	preventDefault?: boolean,
	effective: HotkeySequence = declared
): Omit<SequenceOptions, 'target'> {
	return {
		...dynamicHotkeyOptions(sequenceKey(declared), preventDefault),
		ignoreInputs: !firesWhileTyping(effective[0]),
		stopPropagation: false,
		timeout: incantConfig.sequenceTimeout,
		meta: { incant: true, description, declared: sequenceKey(declared) }
	};
}

/**
 * A shortcut that is also the first step of an enabled chord must not fire on its own —
 * the chord takes priority. Read imperatively from the callback, so it always sees the
 * current registrations.
 */
export function isSequencePrefix(hotkey: Hotkey): boolean {
	for (const reg of getSequenceManager().registrations.state.values()) {
		if (reg.options.enabled !== false && reg.sequence[0] === hotkey) return true;
	}
	return false;
}

// ---------------------------------------------------------------------------
// Reactive views over the managers
// ---------------------------------------------------------------------------

const registrations = getHotkeyRegistrations();
const heldKeys = getHeldKeys();

/** True while the hold-to-reveal modifier is down. Held keys are canonical-cased. */
export function isRevealModifierHeld(): boolean {
	const modifier = incantConfig.revealModifier.toLowerCase();
	return heldKeys.keys.some((key) => key.toLowerCase() === modifier);
}

/** Whether a shortcut's outline + badge should currently be shown. */
export function isRevealed(declared: Hotkey): boolean {
	return isEnabled(declared) && isRevealModifierHeld();
}

/** Keys currently held down, canonical-cased (`'Control'`, `'A'`, `'Space'`). */
export function heldKeyNames(): string[] {
	return heldKeys.keys;
}

export type IncantShortcut = {
	/** The manager's registration id — stable for the lifetime of the registration. */
	id: string;
	/** The combo as written in the markup. Enable/disable and rebind are keyed by it. */
	declared: string;
	/** What it currently listens for: one entry for a plain shortcut, one per chord step. */
	steps: Hotkey[];
	isChord: boolean;
	description?: string;
	enabled: boolean;
	toggle: () => void;
	/** True while an override is in effect, i.e. `steps` differs from `declared`. */
	rebound: boolean;
	/** Listen for `steps` instead. Pass `[]` to restore the declared combo. */
	rebind: (steps: HotkeySequence) => void;
};

function toRow(
	id: string,
	declared: string,
	steps: Hotkey[],
	isChord: boolean,
	description?: string
): IncantShortcut {
	return {
		id,
		declared,
		steps,
		isChord,
		description,
		enabled: isEnabled(declared),
		toggle: () => toggleEnabled(declared),
		rebound: isRebound(declared),
		rebind: (next) => rebind(declared, next)
	};
}

/**
 * Rebinding re-registers a shortcut, which appends it to the manager's
 * insertion-ordered registry — so registry order alone would move the row to the
 * bottom of the palette. Rows are sorted by the first time their declared combo was
 * seen instead, which survives any re-registration.
 */
const rowOrder = new Map<string, number>();

function orderOf(declared: string): number {
	let index = rowOrder.get(declared);
	if (index === undefined) {
		index = rowOrder.size;
		rowOrder.set(declared, index);
	}
	return index;
}

function listIncantShortcuts(): IncantShortcut[] {
	const rows: IncantShortcut[] = [];

	for (const reg of registrations.hotkeys) {
		const meta = reg.options.meta;
		if (!meta?.incant) continue;
		rows.push(toRow(reg.id, meta.declared ?? reg.hotkey, [reg.hotkey], false, meta.description));
	}

	for (const reg of incantSequences()) {
		const meta = reg.options.meta;
		rows.push(
			toRow(
				reg.id,
				meta?.declared ?? sequenceKey(reg.sequence),
				reg.sequence,
				true,
				meta?.description
			)
		);
	}

	return rows.sort((a, b) => orderOf(a.declared) - orderOf(b.declared));
}

export function incantSequences(): SequenceRegistrationView[] {
	return registrations.sequences.filter((reg) => reg.options.meta?.incant);
}

/**
 * Every shortcut and chord incant knows about, in registration order.
 * Reactive — read `.current` inside an effect, a derived or a template.
 */
export const shortcuts: { readonly current: IncantShortcut[] } = {
	get current() {
		return listIncantShortcuts();
	}
};

// ---------------------------------------------------------------------------
// Chord progress
//
// Nothing fires when a partial match times out — expiry is evaluated lazily on the
// next key — so the UI has to re-evaluate it against a clock of its own.
// Ported from `@tanstack/hotkeys-devtools`, which does not export these.
// ---------------------------------------------------------------------------

export function effectiveSequenceMatchedSteps(reg: SequenceRegistrationView, now: number): number {
	const timeout = reg.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT;
	if (
		reg.matchedStepCount <= 0 ||
		reg.partialMatchLastKeyTime <= 0 ||
		now - reg.partialMatchLastKeyTime > timeout
	) {
		return 0;
	}
	return reg.matchedStepCount;
}

export function needsSequenceProgressClock(regs: SequenceRegistrationView[], now: number): boolean {
	return regs.some((reg) => effectiveSequenceMatchedSteps(reg, now) > 0);
}

// ---------------------------------------------------------------------------
// Palette visibility
// ---------------------------------------------------------------------------

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
