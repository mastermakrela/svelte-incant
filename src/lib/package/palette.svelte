<script lang="ts" module>
	export type PalettePosition =
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right'
		| 'none';
</script>

<script lang="ts">
	import {
		createHotkeyRecorder,
		createHotkeySequenceRecorder,
		type CanonicalModifier,
		type HotkeyConflictOptions,
		type HotkeySequence,
		type RecorderKeyMode,
		type RecorderRejection
	} from '@tanstack/svelte-hotkeys';
	import { Keyboard, Pencil, ToggleLeft, ToggleRight } from '@lucide/svelte';
	import CircularProgress from './components/circular-progress.svelte';
	import Kbds from './components/kbds.svelte';
	import * as Dialog from './components/ui/dialog/index.js';
	import * as Kbd from './components/ui/kbd/index.js';
	import * as Table from './components/ui/table';
	import * as Tooltip from './components/ui/tooltip';
	import { isStepHeld } from './hotkey-utils.js';
	import {
		effectiveSequenceMatchedSteps,
		heldKeyCodes,
		heldKeyNames,
		incantConfig,
		incantSequences,
		needsSequenceProgressClock,
		paletteState,
		rebind,
		shortcuts,
		togglePalette,
		SEQUENCE_TIMEOUT_MS,
		type IncantShortcut
	} from './palette.svelte.js';
	import Shortcut from './shortcut.svelte';

	let {
		position = 'bottom-right',
		showToggles = false,
		showRebinding = false,
		revealModifier = 'Alt',
		deriveModifier = 'Control',
		sequenceTimeout = SEQUENCE_TIMEOUT_MS,
		preventDefault = false,
		recordBy = 'key',
		detectConflicts = true,
		texts = {
			shortcutDescription: 'Open shortcut palette',
			tooltipContent: 'Press ?',
			dialogTitle: 'Keyboard Shortcuts',
			descriptionText:
				'Press any key to filter shortcuts containing that key. Matching keys will be highlighted in green.',
			tableHeaders: {
				keys: 'Keys',
				description: 'Description',
				enabled: 'Enabled',
				rebind: 'Rebind'
			},
			toggleLabels: {
				enable: 'Enable shortcut',
				disable: 'Disable shortcut'
			},
			rebindLabels: {
				start: 'Record a new key combination',
				recording: 'Press keys… Esc cancels, ⌫ restores the default',
				recordingChord: 'Press each step… Enter saves, ⌫ undoes, Esc cancels',
				conflict: 'Already used by another shortcut — press a different combination'
			},
			emptyState: 'No shortcuts containing'
		}
	}: {
		position?: PalettePosition;
		showToggles?: boolean;
		/** Let the user record a replacement combo for any listed shortcut. */
		showRebinding?: boolean;
		/** Modifier the user holds to reveal the outline + badge on every shortcut element. */
		revealModifier?: CanonicalModifier;
		/**
		 * Modifier prefixed to keys derived from element text by `shortcut()` with no `keys`.
		 * `null` derives bare keys, which fire on ordinary typing — rarely what you want.
		 */
		deriveModifier?: CanonicalModifier | null;
		/** App-wide chord step timeout, in ms. */
		sequenceTimeout?: number;
		/** App-wide default for `preventDefault` on every shortcut and chord. */
		preventDefault?: boolean;
		/**
		 * What the rebind recorder captures: `'key'` records the logical character (what the
		 * key produces, e.g. `S`), `'code'` records the physical key (`[KeyS]`, layout-independent).
		 * Defaults to `'key'` to match every other combo in this library, which is logical.
		 */
		recordBy?: RecorderKeyMode;
		/**
		 * Reject a recorded combo that's already registered elsewhere in the live registry
		 * (including a sequence-prefix conflict), instead of letting both fire. The row stays
		 * in recording mode and `texts.rebindLabels.conflict` is shown; the previous binding
		 * is untouched. Set `false` to restore the pre-0.9.0 behaviour of allowing it (both
		 * fire, TanStack logs a console warning).
		 */
		detectConflicts?: boolean;
		texts?: {
			shortcutDescription?: string;
			tooltipContent?: string;
			dialogTitle?: string;
			descriptionText?: string;
			tableHeaders?: {
				keys?: string;
				description?: string;
				enabled?: string;
				rebind?: string;
			};
			toggleLabels?: {
				enable?: string;
				disable?: string;
			};
			rebindLabels?: {
				start?: string;
				recording?: string;
				recordingChord?: string;
				conflict?: string;
			};
			emptyState?: string;
		};
	} = $props();

	let tooltip_open = $state(false);

	// `deriveModifier` is read once, when an attachment derives its key at mount. Effects run
	// after that, so it has to be written synchronously here or an attachment mounting before
	// this palette would derive against the stale default. Capturing only the initial value is
	// the point here; the effect below keeps it in sync afterwards.
	// svelte-ignore state_referenced_locally
	incantConfig.deriveModifier = deriveModifier;

	// The one place the app-wide defaults are written. Everything else — components and
	// the `shortcut()` attachment alike — reads them back out of `incantConfig`.
	$effect(() => {
		incantConfig.revealModifier = revealModifier;
		incantConfig.deriveModifier = deriveModifier;
		incantConfig.sequenceTimeout = sequenceTimeout;
		incantConfig.preventDefault = preventDefault;
	});

	// Rebinding. Both recorders call `onDestroy` internally, so they can only be created
	// at component init — hence one pair for the whole palette, keyed by the declared
	// combo of whichever row is currently recording.
	let recording = $state<string | null>(null);
	// Rejection is surfaced while `recording` stays truthy: `detectConflicts` (and any
	// other rejection reason) leaves the recorder active rather than cancelling it, so the
	// row keeps listening — the message just needs to be shown alongside it.
	let rejection = $state<RecorderRejection | null>(null);

	function finish(steps: HotkeySequence) {
		if (recording) rebind(recording, steps);
		recording = null;
		rejection = null;
	}

	function onReject(next: RecorderRejection) {
		rejection = next;
	}

	// A row must not conflict with *itself* — recording the combo it already listens for
	// would otherwise be flagged the moment `detectConflicts` sees its own live
	// registration. Excluding by declared combo (rather than registration id) survives the
	// re-registration a successful rebind causes, matching how `rebind`/`isRebound` are
	// keyed elsewhere in this file.
	const conflictOptions = $derived<HotkeyConflictOptions | false>(
		detectConflicts && recording
			? {
					includeDisabled: true,
					exclude: (reg) => reg.options.meta?.declared === recording
				}
			: false
	);

	// Passing a getter (rather than a plain options object) keeps `recordBy` reactive:
	// the adapter re-runs `setOptions` in its own `$effect` whenever the getter's
	// dependencies change, so the recorder never needs to be recreated for a prop change.
	const recorder = createHotkeyRecorder(() => ({
		ignoreInputs: false,
		recordBy,
		detectConflicts: conflictOptions,
		onRecord: (hotkey) => finish([hotkey]),
		onCancel: () => {
			recording = null;
			rejection = null;
		},
		// 0.9.0: clearing a recording (⌫ with nothing captured) calls only `onClear`, not
		// `onRecord` with an empty value — restoring the declared default now lives here.
		onClear: () => finish([]),
		onReject
	}));

	const sequenceRecorder = createHotkeySequenceRecorder(() => ({
		ignoreInputs: false,
		recordBy,
		detectConflicts: conflictOptions,
		onRecord: (steps) => finish(steps),
		onCancel: () => {
			recording = null;
			rejection = null;
		},
		onClear: () => finish([]),
		onReject
	}));

	function startRecording(item: IncantShortcut) {
		recording = item.declared;
		rejection = null;
		if (item.isChord) sequenceRecorder.startRecording();
		else recorder.startRecording();
	}

	/** Registration `meta.description` of the shortcut a rejected candidate collides with. */
	function conflictDescription(current: RecorderRejection | null): string | undefined {
		return current?.conflicts?.[0]?.registration.options.meta?.description;
	}

	// Held keys are canonical-cased (`'Control'`), hotkey tokens are lower-cased.
	const all_keys = $derived(heldKeyNames().map((key) => key.toLowerCase()));

	const filtered_shortcuts = $derived.by(() => {
		const pressed = all_keys.filter((key) => !['?', '/', 'space', 'tab'].includes(key));
		if (pressed.length === 0) return shortcuts.current;

		const codes = heldKeyCodes();
		return shortcuts.current.filter((item) =>
			item.steps.some((step) => isStepHeld(step, pressed, codes))
		);
	});

	// Chord progress. `matchedStepCount` only changes when the manager sees a key, and
	// nothing fires when a partial match times out — so drive the countdown from one
	// shared rAF, started only while at least one chord is actually mid-match.
	let now = $state(Date.now());

	$effect(() => {
		const sequences = incantSequences();
		if (!needsSequenceProgressClock(sequences, Date.now())) return;

		let frame = requestAnimationFrame(function tick() {
			now = Date.now();
			if (needsSequenceProgressClock(sequences, now)) frame = requestAnimationFrame(tick);
		});

		return () => cancelAnimationFrame(frame);
	});

	const chordDisplays = $derived.by(() =>
		incantSequences()
			.map((reg) => ({ reg, matched: effectiveSequenceMatchedSteps(reg, now) }))
			.filter(({ matched }) => matched > 0)
			.map(({ reg, matched }) => ({
				id: reg.id,
				completedSteps: reg.sequence.slice(0, matched),
				hasMore: matched < reg.sequence.length,
				progress: Math.max(
					0,
					1 - (now - reg.partialMatchLastKeyTime) / (reg.options.timeout ?? SEQUENCE_TIMEOUT_MS)
				)
			}))
	);

	const POSITION_STYLES: Record<PalettePosition, string> = {
		'top-left': 'left: 1rem; top: 1rem;',
		'top-center': 'left: 50%; top: 1rem; transform: translateX(-50%);',
		'top-right': 'right: 1rem; top: 1rem;',
		'bottom-left': 'left: 1rem; bottom: 1rem;',
		'bottom-center': 'left: 50%; bottom: 1rem; transform: translateX(-50%);',
		'bottom-right': 'right: 1rem; bottom: 1rem;',
		none: 'display: none;'
	};

	const positionStyles = $derived(POSITION_STYLES[position]);
</script>

<!-- `?` as a RawHotkey: on every layout, whatever produces `?` (Shift+/ on US,
     Shift+ß on QWERTZ) matches — the string `'?'` would fail TanStack's shiftKey check. -->
<Shortcut
	keys={{ key: '?', shift: true }}
	description={texts.shortcutDescription}
	action={togglePalette}
/>

<Tooltip.Provider delayDuration={0}>
	<Tooltip.Root bind:open={tooltip_open}>
		<Tooltip.Trigger onclick={togglePalette}>
			{#snippet child({ props })}
				<button {...props} style={positionStyles} class={['incant-palette-trigger']}>
					<Keyboard />
				</button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			{texts.tooltipContent}
			<Kbd.Root>?</Kbd.Root>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>

<Dialog.Root bind:open={paletteState.open}>
	<Dialog.Content portalProps={{ disabled: true }}>
		<Dialog.Header>
			<Dialog.Title>{texts.dialogTitle}</Dialog.Title>
			<Dialog.Description class="incant-palette-description">
				<p class="incant-palette-description-text">
					{texts.descriptionText}
				</p>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{texts.tableHeaders?.keys ?? 'Keys'}</Table.Head>
							<Table.Head>{texts.tableHeaders?.description ?? 'Description'}</Table.Head>
							{#if showToggles}
								<Table.Head class="incant-palette-cell-actions"
									>{texts.tableHeaders?.enabled ?? 'Enabled'}</Table.Head
								>
							{/if}
							{#if showRebinding}
								<Table.Head class="incant-palette-cell-actions"
									>{texts.tableHeaders?.rebind ?? 'Rebind'}</Table.Head
								>
							{/if}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered_shortcuts as item (item.id)}
							<Table.Row>
								<Table.Cell class="incant-palette-cell-keys">
									<Kbds keys={item.steps} isChord={item.isChord} />
								</Table.Cell>
								<Table.Cell>{item.description}</Table.Cell>
								{#if showToggles}
									<Table.Cell class="incant-palette-cell-actions">
										<button
											type="button"
											class="incant-palette-toggle"
											onclick={() => item.toggle()}
											aria-label={item.enabled
												? (texts.toggleLabels?.disable ?? 'Disable shortcut')
												: (texts.toggleLabels?.enable ?? 'Enable shortcut')}
											tabindex="0"
										>
											{#if item.enabled}
												<ToggleRight class="incant-palette-toggle-icon enabled" />
											{:else}
												<ToggleLeft class="incant-palette-toggle-icon disabled" />
											{/if}
										</button>
									</Table.Cell>
								{/if}
								{#if showRebinding}
									<Table.Cell class="incant-palette-cell-actions">
										{#if recording === item.declared}
											<span class="incant-palette-recording">
												{#if item.isChord}
													<Kbds keys={sequenceRecorder.steps} isChord={true} />
													{texts.rebindLabels?.recordingChord ??
														'Press each step… Enter saves, ⌫ undoes, Esc cancels'}
												{:else}
													{texts.rebindLabels?.recording ??
														'Press keys… Esc cancels, ⌫ restores the default'}
												{/if}
											</span>
											{#if rejection}
												<span class="incant-palette-rebind-conflict">
													{#if rejection.reason === 'conflict'}
														{texts.rebindLabels?.conflict ??
															'Already used by another shortcut — press a different combination'}
														{#if conflictDescription(rejection)}
															({conflictDescription(rejection)})
														{/if}
													{:else}
														{rejection.message}
													{/if}
												</span>
											{/if}
										{:else}
											<button
												type="button"
												class={[
													'incant-palette-toggle',
													{ 'incant-palette-rebound': item.rebound }
												]}
												onclick={() => startRecording(item)}
												aria-label={texts.rebindLabels?.start ?? 'Record a new key combination'}
												tabindex="0"
											>
												<Pencil class="incant-palette-toggle-icon" />
											</button>
										{/if}
									</Table.Cell>
								{/if}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell
									colspan={2 + (showToggles ? 1 : 0) + (showRebinding ? 1 : 0)}
									class="incant-palette-empty-state"
								>
									{texts.emptyState}
									<Kbds keys={all_keys} />

									.
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

{#if chordDisplays.length > 0}
	<div class="incant-chord-displays">
		{#each chordDisplays as chord (chord.id)}
			<div class="incant-chord-display">
				<Kbds keys={chord.completedSteps} isChord={true} />
				{#if chord.hasMore}
					<span class="incant-chord-display-arrow">→</span>
					<div class="incant-chord-display-next">
						<div class="incant-chord-display-progress">
							<CircularProgress progress={chord.progress} />
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	/* CSS Variables Default Values */
	:root {
		--incant-colors-primary: oklch(0.205 0 0);
		--incant-colors-primary-foreground: oklch(0.985 0 0);
		--incant-colors-ring: oklch(0.708 0 0);
		--incant-colors-accent: oklch(0.97 0 0);
		--incant-colors-accent-foreground: oklch(0.205 0 0);
		--incant-colors-muted: oklch(0.97 0 0);
		--incant-colors-muted-foreground: oklch(0.556 0 0);
		--incant-colors-border: oklch(0.922 0 0);
		--incant-colors-overlay: hsla(0 0% 0% / 0.8);
		--incant-kbd-bg: #f3f4f6;
		--incant-kbd-color: #6b7280;
		--incant-outline-width: 2px;
		--incant-outline-style: dotted;
		--incant-outline-color: #878787;
		--incant-outline-offset: 2px;
		--incant-spacing-1: 0.25rem;
		--incant-spacing-2: 0.5rem;
		--incant-spacing-3: 0.75rem;
		--incant-spacing-4: 1rem;
		--incant-spacing-6: 1.5rem;
		--incant-font-size-xs: 0.75rem;
		--incant-font-size-sm: 0.875rem;
		--incant-font-size-lg: 1.125rem;
		--incant-radius-sm: 0.25rem;
		--incant-radius-md: 0.375rem;
		--incant-radius-lg: 0.5rem;
		--incant-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		--incant-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		--incant-z-index-trigger: 40;
		--incant-z-index-chord-display: 1000;
		--incant-z-index-dialog: 50;
		--incant-z-index-overlay: 50;
	}

	/* Palette Trigger Button */
	:global(.incant-palette-trigger) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--incant-radius-md, 0.375rem);
		background-color: var(--incant-colors-primary, hsl(240 5.9% 10%));
		color: var(--incant-colors-primary-foreground, hsl(0 0% 98%));
		font-size: var(--incant-font-size-sm, 0.875rem);
		font-weight: 500;
		white-space: nowrap;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		outline: none;
		box-shadow: var(--incant-shadow-xs, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		position: fixed;
		z-index: var(--incant-z-index-trigger, 40);
	}

	:global(.incant-palette-trigger:hover) {
		background-color: oklch(from var(--incant-colors-primary) l c h / 0.9);
	}

	:global(.incant-palette-trigger:focus-visible) {
		outline: 2px solid var(--incant-colors-ring, hsl(240 5.9% 10%));
		outline-offset: 2px;
	}

	:global(.incant-palette-trigger:disabled) {
		pointer-events: none;
		opacity: 0.5;
	}

	:global(.incant-palette-trigger svg) {
		pointer-events: none;
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
	}

	/* Palette Description */
	:global(.incant-palette-description) {
		margin: 2rem 0;
	}

	:global(.incant-palette-description-text) {
		margin-bottom: 1rem;
		font-size: var(--incant-font-size-sm, 0.875rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	/* Palette Table Cells */
	:global(.incant-palette-cell-keys) {
		font-weight: 500;
	}

	:global(.incant-palette-cell-actions) {
		text-align: right;
	}

	/* Toggle Button */
	:global(.incant-palette-toggle) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: var(--incant-radius-md, 0.375rem);
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	:global(.incant-palette-toggle:hover) {
		background-color: var(--incant-colors-accent, hsl(240 4.8% 95.9%));
		color: var(--incant-colors-accent-foreground, hsl(240 5.9% 10%));
	}

	:global(.incant-palette-toggle:focus-visible) {
		outline: 2px solid var(--incant-colors-ring, hsl(240 5.9% 10%));
		outline-offset: 2px;
	}

	:global(.incant-palette-toggle-icon) {
		width: 1.25rem;
		height: 1.25rem;
	}

	:global(.incant-palette-toggle-icon.enabled) {
		color: #10b981; /* green-500 */
	}

	:global(.incant-palette-toggle-icon.disabled) {
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	/* Rebinding */
	:global(.incant-palette-rebound) {
		color: #10b981; /* green-500 — this row is no longer on its declared combo */
	}

	/*
	 * The hint wraps rather than forcing the cell wide: it is the widest thing in the
	 * Rebind column, and `nowrap` pushed the whole table past the dialog on narrow
	 * screens (~605px of table in a 358px dialog at 390px wide). `flex-wrap` keeps the
	 * chord `Kbds` intact while the text beside it reflows.
	 */
	:global(.incant-palette-recording) {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--incant-spacing-2, 0.5rem);
		font-size: var(--incant-font-size-xs, 0.75rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
		white-space: normal;
		text-align: right;
	}

	:global(.incant-palette-rebind-conflict) {
		display: block;
		margin-top: var(--incant-spacing-1, 0.25rem);
		font-size: var(--incant-font-size-xs, 0.75rem);
		color: #ef4444; /* red-500 */
		white-space: normal;
		text-align: right;
	}

	/* Empty State */
	:global(.incant-palette-empty-state) {
		text-align: center;
		padding: 1rem 0;
		font-size: var(--incant-font-size-sm, 0.875rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	/* Chord Display — one panel per chord currently mid-match */
	:global(.incant-chord-displays) {
		display: flex;
		flex-direction: column-reverse;
		align-items: flex-start;
		gap: 0.5rem;
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		z-index: var(--incant-z-index-chord-display, 1000);
	}

	:global(.incant-chord-display) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: var(--incant-radius-md, 0.375rem);
		background-color: var(--incant-colors-primary, hsl(240 5.9% 10%));
		color: var(--incant-colors-primary-foreground, hsl(0 0% 98%));
		font-size: var(--incant-font-size-sm, 0.875rem);
		font-weight: 500;
		white-space: nowrap;
		box-shadow: var(--incant-shadow-xs, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
	}

	:global(.incant-chord-display-arrow) {
		font-weight: 500;
	}

	:global(.incant-chord-display-next) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		position: relative;
		min-width: 1.25rem;
		height: 1.25rem;
	}

	:global(.incant-chord-display-progress) {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		opacity: 0.8;
	}
</style>
