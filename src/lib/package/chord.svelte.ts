import { PressedKeys } from 'runed';
import { on } from 'svelte/events';
import { SvelteSet } from 'svelte/reactivity';

export type Chord = {
	steps: string[][];
	description?: string;
	action: () => void;
	enabled?: boolean;
};

export const CHORD_TIMEOUT_MS = 1500;

export function isChordInput(keys: unknown): boolean {
	return (
		typeof keys === 'object' &&
		keys !== null &&
		'isChord' in keys &&
		(keys as { isChord: boolean }).isChord === true
	);
}

function sortCombo(combo: string[]): string[] {
	return [...combo].sort((a, b) => a.localeCompare(b));
}

function comboToString(combo: string[]): string {
	return combo.join('-');
}

export function normalizeChordSteps(steps: string[][]): string[][] {
	return steps.map((step) => sortCombo(step));
}

export function slugifyChord(steps: string[][]): string {
	const normalized = normalizeChordSteps(steps);
	return normalized.map((step) => comboToString(step).toLowerCase().replace(/\s+/g, '-')).join('>');
}

export class ChordRegistry {
	chords = $state<Record<string, Chord>>({});
	chordOrder: string[] = [];
	chordPrefixes = $state(new SvelteSet<string>());
	currentProgress = $state<{
		steps: string[][];
		currentIndex: number;
		expiresAt: number;
	} | null>(null);

	private pressedKeys = new PressedKeys();
	private chordTimeout: ReturnType<typeof setTimeout> | null = null;
	private isListening = false;
	private cleanupCallbacks: (() => void)[] = [];

	constructor() {}

	private startListening(): void {
		if (this.isListening) return;
		if (typeof window === 'undefined') return;

		this.isListening = true;

		// Set up escape key handler using svelte/events
		const escapeCleanup = on(window, 'keydown', (event) => {
			if (event.key === 'Escape') {
				this.resetChord();
			}
		});
		this.cleanupCallbacks.push(escapeCleanup);

		// Use $effect to sync chord listeners when chords change
		$effect(() => {
			this.syncChordListeners();
		});
	}

	private syncChordListeners(): void {
		// Clear existing chord-specific listeners (keep escape handler)
		// Note: We can't easily remove onKeys callbacks, so we rely on the enabled check

		// For each registered chord, set up listeners
		for (const chord of Object.values(this.chords)) {
			this.setupChordListener(chord);
		}
	}

	private setupChordListener(chord: Chord): void {
		if (!chord.enabled) return;

		const firstStep = chord.steps[0];
		if (!firstStep) return;

		// Listen for first step - triggers immediately on keydown (VS Code style)
		this.pressedKeys.onKeys(firstStep, () => {
			if (!chord.enabled) return;

			// If we're already in a chord progress for a different chord, ignore
			if (this.currentProgress) {
				const currentSlug = this.slugifyChord(this.currentProgress.steps);
				const thisSlug = this.slugifyChord(chord.steps);
				if (currentSlug !== thisSlug) {
					return;
				}
			}

			// Start the chord (shows progress UI immediately)
			this.startChord(chord);
		});

		// Listen for second step
		if (chord.steps.length > 1) {
			const secondStep = chord.steps[1];
			if (!secondStep) return;

			this.pressedKeys.onKeys(secondStep, () => {
				if (!chord.enabled) return;

				// Only complete if we're in progress for THIS chord
				if (
					this.currentProgress &&
					this.slugifyChord(this.currentProgress.steps) === this.slugifyChord(chord.steps) &&
					this.currentProgress.currentIndex === 0
				) {
					this.completeChord();
				}
			});
		}
	}

	normalizeChordSteps(steps: string[][]): string[][] {
		return normalizeChordSteps(steps);
	}

	slugifyChord(steps: string[][]): string {
		return slugifyChord(steps);
	}

	private comboToString(combo: string[]): string {
		return comboToString(combo);
	}

	private checkCollision(steps: string[][], description?: string): boolean {
		const slug = this.slugifyChord(steps);
		if (this.chords[slug]) {
			console.warn(
				`Chord collision detected: "${slug}" already registered${description ? ` (trying to register: "${description}")` : ''}`
			);
			return true;
		}
		return false;
	}

	add(chord: Omit<Chord, 'steps'> & { steps: string[][] }): void {
		this.startListening();

		const normalizedSteps = this.normalizeChordSteps(chord.steps);

		if (normalizedSteps.length === 0) {
			console.warn('Cannot add chord with no steps');
			return;
		}

		if (normalizedSteps.length < 2) {
			console.warn('Chords require at least 2 steps');
			return;
		}

		this.checkCollision(normalizedSteps, chord.description);

		const slug = this.slugifyChord(normalizedSteps);

		const firstStepString = this.comboToString(normalizedSteps[0]!);
		this.chordPrefixes.add(firstStepString);

		this.chords[slug] = {
			...chord,
			steps: normalizedSteps,
			enabled: chord.enabled ?? true
		};

		if (!this.chordOrder.includes(slug)) {
			this.chordOrder.push(slug);
		}

		// Set up listener for this chord
		this.setupChordListener(this.chords[slug]!);
	}

	remove(steps: string[][]): void {
		const slug = this.slugifyChord(steps);
		const chord = this.chords[slug];

		if (!chord) {
			console.warn(`Chord not found for steps: ${JSON.stringify(steps)}`);
			return;
		}

		const firstStepString = this.comboToString(chord.steps[0]!);
		const hasOtherChordsWithSamePrefix = Object.values(this.chords).some(
			(c) => c !== chord && c.steps[0] && this.comboToString(c.steps[0]) === firstStepString
		);

		if (!hasOtherChordsWithSamePrefix) {
			this.chordPrefixes.delete(firstStepString);
		}

		delete this.chords[slug];
		const index = this.chordOrder.indexOf(slug);
		if (index > -1) {
			this.chordOrder.splice(index, 1);
		}

		if (this.currentProgress && this.slugifyChord(this.currentProgress.steps) === slug) {
			this.resetChord();
		}
	}

	toggle(steps: string[][]): void {
		const slug = this.slugifyChord(steps);
		if (this.chords[slug]) {
			this.chords[slug].enabled = !this.chords[slug].enabled;
		}
	}

	getChords(): Chord[] {
		this.startListening();
		return this.chordOrder
			.map((slug) => this.chords[slug])
			.filter((chord): chord is Chord => chord !== undefined);
	}

	isChordPrefix(combo: string[]): boolean {
		const comboString = this.comboToString(sortCombo(combo));
		return this.chordPrefixes.has(comboString);
	}

	findChordForPrefix(combo: string[]): Chord | null {
		const comboString = this.comboToString(sortCombo(combo));
		return (
			this.getChords().find(
				(chord) => this.comboToString(chord.steps[0]!) === comboString && chord.enabled
			) || null
		);
	}

	startChord(chord: Chord): void {
		if (this.chordTimeout) {
			clearTimeout(this.chordTimeout);
		}

		this.currentProgress = {
			steps: chord.steps,
			currentIndex: 0,
			expiresAt: Date.now() + CHORD_TIMEOUT_MS
		};

		this.chordTimeout = setTimeout(() => {
			this.resetChord();
		}, CHORD_TIMEOUT_MS);
	}

	completeChord(): void {
		if (this.currentProgress) {
			const chord = this.chords[this.slugifyChord(this.currentProgress.steps)];
			if (chord && chord.enabled) {
				chord.action();
			}
		}
		this.resetChord();
	}

	resetChord(): void {
		if (this.chordTimeout) {
			clearTimeout(this.chordTimeout);
			this.chordTimeout = null;
		}
		this.currentProgress = null;
	}

	destroy(): void {
		for (const cleanup of this.cleanupCallbacks) {
			cleanup();
		}
		this.cleanupCallbacks = [];
		this.resetChord();
		this.isListening = false;
	}
}

let _registry: ChordRegistry | null = null;

function getRegistry(): ChordRegistry {
	if (!_registry) {
		_registry = new ChordRegistry();
	}
	return _registry;
}

// Export direct access to the registry for reactivity
export function getChordRegistry(): ChordRegistry {
	return getRegistry();
}

export const chordRegistry: ChordRegistry = new Proxy({} as ChordRegistry, {
	get(_, prop) {
		return getRegistry()[prop as keyof ChordRegistry];
	}
});

export const chords: Record<string, Chord> = new Proxy(
	{},
	{
		get(_, prop) {
			const registry = getRegistry();
			return registry.chords[prop as string];
		},
		has(_, prop) {
			const registry = getRegistry();
			return prop in registry.chords;
		}
	}
);

export function add_chord(chord: Omit<Chord, 'steps'> & { steps: string[][] }): void {
	getRegistry().add(chord);
}

export function remove_chord(steps: string[][]): void {
	getRegistry().remove(steps);
}

export function toggle_chord(steps: string[][]): void {
	getRegistry().toggle(steps);
}

export function get_current_progress(): {
	steps: string[][];
	currentIndex: number;
	expiresAt: number;
} | null {
	return getRegistry().currentProgress;
}
