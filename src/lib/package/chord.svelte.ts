import {
	getSequenceManager,
	matchesKeyboardEvent,
	normalizeHotkey,
	type Hotkey,
	type SequenceOptions
} from '@tanstack/hotkeys';
import { on } from 'svelte/events';
import { SvelteSet } from 'svelte/reactivity';
import { parseSequence, tokensToHotkey, type SequenceSpec } from './hotkey-utils.js';

export type Chord = {
	steps: Hotkey[];
	description?: string;
	action: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
};

export const CHORD_TIMEOUT_MS = 1500;

export function isChordInput(keys: unknown): keys is { isChord: true } {
	return (
		typeof keys === 'object' &&
		keys !== null &&
		'isChord' in keys &&
		(keys as { isChord: boolean }).isChord === true
	);
}

export function normalizeChordSteps(steps: SequenceSpec | Hotkey[]): Hotkey[] {
	return Array.isArray(steps) ? steps.map((step) => normalizeHotkey(step)) : parseSequence(steps);
}

export function slugifyChord(steps: SequenceSpec | Hotkey[]): string {
	const normalized = normalizeChordSteps(steps);
	return normalized.join(' ');
}

type ChordProgress = {
	steps: Hotkey[];
	currentIndex: number;
	expiresAt: number;
};

export class ChordRegistry {
	chords = $state<Record<string, Chord>>({});
	chordOrder: string[] = [];
	chordPrefixes = $state(new SvelteSet<string>());
	currentProgress = $state<ChordProgress | null>(null);

	private chordTimeout: ReturnType<typeof setTimeout> | null = null;
	private isListening = false;
	private cleanupCallbacks: (() => void)[] = [];
	private sequenceCleanups: Record<string, () => void> = {};

	constructor() {}

	private startListening(): void {
		if (this.isListening) return;
		if (typeof window === 'undefined') return;

		this.isListening = true;

		const keydownCleanup = on(window, 'keydown', (event) => {
			this.handleKeyDown(event);
		});
		this.cleanupCallbacks.push(keydownCleanup);
	}

	private handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			this.resetChord();
			return;
		}

		if (this.currentProgress && Date.now() > this.currentProgress.expiresAt) {
			this.resetChord();
		}

		const activeSlug = this.currentProgress ? slugifyChord(this.currentProgress.steps) : null;
		const activeChord = activeSlug ? this.chords[activeSlug] : null;

		if (!activeChord || activeChord.enabled === false) {
			const firstStepChord = this.findMatchingFirstStep(event);
			if (firstStepChord) {
				this.startChord(firstStepChord);
				if (firstStepChord.preventDefault) {
					event.preventDefault();
				}
			}
			return;
		}

		const expectedNextStep = activeChord.steps[this.currentProgress!.currentIndex + 1];
		if (expectedNextStep && matchesKeyboardEvent(event, expectedNextStep)) {
			this.advanceChord();
			if (activeChord.preventDefault) {
				event.preventDefault();
			}
			return;
		}

		if (matchesKeyboardEvent(event, activeChord.steps[0]!)) {
			this.startChord(activeChord);
			if (activeChord.preventDefault) {
				event.preventDefault();
			}
			return;
		}

		const nextChord = this.findMatchingFirstStep(event);
		if (nextChord) {
			this.startChord(nextChord);
			if (nextChord.preventDefault) {
				event.preventDefault();
			}
			return;
		}

		this.resetChord();
	}

	private findMatchingFirstStep(event: KeyboardEvent): Chord | null {
		return (
			this.getChords().find(
				(chord) =>
					chord.enabled !== false && chord.steps[0] && matchesKeyboardEvent(event, chord.steps[0])
			) || null
		);
	}

	private syncChordListeners(): void {
		for (const cleanup of Object.values(this.sequenceCleanups)) {
			cleanup();
		}
		this.sequenceCleanups = {};

		for (const [slug, chord] of Object.entries(this.chords)) {
			if (!chord.steps.length) continue;
			const options: SequenceOptions = {
				enabled: chord.enabled ?? true,
				ignoreInputs: false,
				preventDefault: chord.preventDefault ?? false,
				stopPropagation: false,
				timeout: CHORD_TIMEOUT_MS
			};

			const cleanup = getSequenceManager().register(
				chord.steps,
				() => {
					if (chord.enabled !== false) {
						chord.action();
					}
					this.resetChord();
				},
				options
			);

			this.sequenceCleanups[slug] = cleanup;
		}
	}

	private checkCollision(steps: Hotkey[], description?: string): boolean {
		const slug = slugifyChord(steps);
		if (this.chords[slug]) {
			console.warn(
				`Chord collision detected: "${slug}" already registered${description ? ` (trying to register: "${description}")` : ''}`
			);
			return true;
		}
		return false;
	}

	add(chord: Omit<Chord, 'steps'> & { steps: SequenceSpec }): void {
		this.startListening();

		let normalizedSteps: Hotkey[];
		try {
			normalizedSteps = normalizeChordSteps(chord.steps);
		} catch (error) {
			console.warn(`Cannot add chord: ${(error as Error).message}`);
			return;
		}

		if (normalizedSteps.length === 0) {
			console.warn('Cannot add chord with no steps');
			return;
		}

		if (normalizedSteps.length < 2) {
			console.warn('Chords require at least 2 steps');
			return;
		}

		this.checkCollision(normalizedSteps, chord.description);

		const slug = slugifyChord(normalizedSteps);
		this.chordPrefixes.add(normalizedSteps[0]!);

		this.chords[slug] = {
			...chord,
			steps: normalizedSteps,
			enabled: chord.enabled ?? true
		};

		if (!this.chordOrder.includes(slug)) {
			this.chordOrder.push(slug);
		}

		this.syncChordListeners();
	}

	remove(steps: SequenceSpec | Hotkey[]): void {
		let normalizedSteps: Hotkey[];
		try {
			normalizedSteps = normalizeChordSteps(steps);
		} catch {
			console.warn(`Chord not found for steps: ${JSON.stringify(steps)}`);
			return;
		}

		const slug = slugifyChord(normalizedSteps);
		const chord = this.chords[slug];

		if (!chord) {
			console.warn(`Chord not found for steps: ${JSON.stringify(steps)}`);
			return;
		}

		const firstStep = chord.steps[0]!;
		const hasOtherChordsWithSamePrefix = Object.values(this.chords).some(
			(c) => c !== chord && c.steps[0] === firstStep
		);

		if (!hasOtherChordsWithSamePrefix) {
			this.chordPrefixes.delete(firstStep);
		}

		delete this.chords[slug];
		const index = this.chordOrder.indexOf(slug);
		if (index > -1) {
			this.chordOrder.splice(index, 1);
		}

		const cleanup = this.sequenceCleanups[slug];
		cleanup?.();
		delete this.sequenceCleanups[slug];

		if (this.currentProgress && slugifyChord(this.currentProgress.steps) === slug) {
			this.resetChord();
		}
	}

	toggle(steps: SequenceSpec | Hotkey[]): void {
		const slug = slugifyChord(steps);
		if (this.chords[slug]) {
			this.chords[slug].enabled = !this.chords[slug].enabled;
			this.syncChordListeners();
		}
	}

	getChords(): Chord[] {
		this.startListening();
		return this.chordOrder
			.map((slug) => this.chords[slug])
			.filter((chord): chord is Chord => chord !== undefined);
	}

	isChordPrefix(combo: Hotkey | string[]): boolean {
		const value = Array.isArray(combo) ? tokensToHotkey(combo) : normalizeHotkey(combo);
		return this.chordPrefixes.has(value);
	}

	findChordForPrefix(combo: Hotkey | string[]): Chord | null {
		const value = Array.isArray(combo) ? tokensToHotkey(combo) : normalizeHotkey(combo);
		return (
			this.getChords().find((chord) => chord.steps[0] === value && chord.enabled !== false) || null
		);
	}

	startChord(chord: Chord): void {
		this.currentProgress = {
			steps: chord.steps,
			currentIndex: 0,
			expiresAt: Date.now() + CHORD_TIMEOUT_MS
		};

		this.resetChordTimeout();
	}

	private advanceChord(): void {
		if (!this.currentProgress) return;

		const nextIndex = this.currentProgress.currentIndex + 1;
		this.currentProgress = {
			...this.currentProgress,
			currentIndex: nextIndex,
			expiresAt: Date.now() + CHORD_TIMEOUT_MS
		};

		this.resetChordTimeout();
	}

	resetChord(): void {
		if (this.chordTimeout) {
			clearTimeout(this.chordTimeout);
			this.chordTimeout = null;
		}
		this.currentProgress = null;
	}

	private resetChordTimeout(): void {
		if (this.chordTimeout) {
			clearTimeout(this.chordTimeout);
		}

		this.chordTimeout = setTimeout(() => {
			this.resetChord();
		}, CHORD_TIMEOUT_MS);
	}

	destroy(): void {
		for (const cleanup of this.cleanupCallbacks) {
			cleanup();
		}
		this.cleanupCallbacks = [];

		for (const cleanup of Object.values(this.sequenceCleanups)) {
			cleanup();
		}
		this.sequenceCleanups = {};

		this.resetChord();
		this.isListening = false;
	}
}

export const chordRegistry = new ChordRegistry();

export const chords = chordRegistry.chords;

export const add_chord = chordRegistry.add.bind(chordRegistry);
export const remove_chord = chordRegistry.remove.bind(chordRegistry);
export const toggle_chord = chordRegistry.toggle.bind(chordRegistry);
export const get_current_progress = () => chordRegistry.currentProgress;
