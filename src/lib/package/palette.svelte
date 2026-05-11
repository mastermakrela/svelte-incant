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
	import { Keyboard, ToggleLeft, ToggleRight } from '@lucide/svelte';
	import {
		DEFAULT_SEQUENCE_TIMEOUT,
		formatHotkeySequence,
		getHeldKeys,
		getHotkeyRegistrations,
		type RawHotkey,
		type RegisterableHotkey
	} from '@tanstack/svelte-hotkeys';
	import { toggle_chord } from './chord.svelte.js';
	import CircularProgress from './components/circular-progress.svelte';
	import Kbds from './components/kbds.svelte';
	import * as Dialog from './components/ui/dialog/index.js';
	import * as Kbd from './components/ui/kbd/index.js';
	import * as Table from './components/ui/table';
	import * as Tooltip from './components/ui/tooltip';
	import { paletteState, togglePalette, toggle_shortcut } from './palette.svelte.js';
	import Shortcut from './shortcut.svelte';

	const PALETTE_HOTKEY: RawHotkey = { key: '?', shift: true };

	type PaletteItem =
		| {
				type: 'shortcut';
				key: string;
				hotkey: RegisterableHotkey;
				description?: string;
				enabled: boolean;
				toggle: () => void;
		  }
		| {
				type: 'chord';
				key: string;
				sequence: RegisterableHotkey[];
				description?: string;
				enabled: boolean;
				toggle: () => void;
		  };

	let {
		position = 'bottom-right',
		showToggles = false,
		formatShortcut,
		texts = {
			shortcutDescription: 'Open shortcut palette',
			tooltipContent: 'Press ?',
			dialogTitle: 'Keyboard Shortcuts',
			descriptionText:
				'Press any key to filter shortcuts containing that key. Matching keys will be highlighted in green.',
			tableHeaders: {
				keys: 'Keys',
				description: 'Description',
				enabled: 'Enabled'
			},
			toggleLabels: {
				enable: 'Enable shortcut',
				disable: 'Disable shortcut'
			},
			emptyState: 'No shortcuts containing'
		}
	}: {
		position?: PalettePosition;
		showToggles?: boolean;
		formatShortcut?: (
			hotkey: RegisterableHotkey | undefined,
			sequence: RegisterableHotkey[] | undefined,
			isMac: boolean
		) => string;
		texts?: {
			shortcutDescription?: string;
			tooltipContent?: string;
			dialogTitle?: string;
			descriptionText?: string;
			tableHeaders?: {
				keys?: string;
				description?: string;
				enabled?: string;
			};
			toggleLabels?: {
				enable?: string;
				disable?: string;
			};
			emptyState?: string;
		};
	} = $props();

	let tooltip_open = $state(false);

	const registrations = getHotkeyRegistrations();
	const heldKeys = getHeldKeys();

	const allItems: PaletteItem[] = $derived.by(() => {
		const items: PaletteItem[] = [];

		for (const reg of registrations.hotkeys) {
			items.push({
				type: 'shortcut',
				key: reg.hotkey,
				hotkey: reg.hotkey,
				description: reg.options.meta?.description,
				enabled: reg.options.enabled !== false,
				toggle: () => toggle_shortcut(reg.hotkey)
			});
		}

		for (const reg of registrations.sequences) {
			items.push({
				type: 'chord',
				key: formatHotkeySequence(reg.sequence),
				sequence: reg.sequence,
				description: reg.options.meta?.description,
				enabled: reg.options.enabled !== false,
				toggle: () => toggle_chord(reg.sequence)
			});
		}

		return items;
	});

	let expiryTick = $state(0);

	const activeChord = $derived.by(() => {
		void expiryTick;
		const now = Date.now();
		for (const reg of registrations.sequences) {
			if (reg.matchedStepCount === 0) continue;
			if (reg.matchedStepCount >= reg.sequence.length) continue;
			const timeout = reg.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT;
			const expiresAt = reg.partialMatchLastKeyTime + timeout;
			if (now >= expiresAt) continue;
			return {
				sequence: reg.sequence,
				completedSteps: reg.sequence.slice(0, reg.matchedStepCount),
				hasMore: reg.matchedStepCount < reg.sequence.length,
				expiresAt,
				timeout
			};
		}
		return null;
	});

	$effect(() => {
		const chord = activeChord;
		if (!chord) return;
		const remaining = chord.expiresAt - Date.now();
		if (remaining <= 0) return;
		const id = setTimeout(() => {
			expiryTick++;
		}, remaining + 16);
		return () => clearTimeout(id);
	});

	const filtered_items = $derived.by(() => {
		const pressed = heldKeys.keys.filter((key) => !['?', '/', ' ', 'Tab', 'Escape'].includes(key));
		if (pressed.length === 0) return allItems;

		const needles = pressed.map((k) => k.toLowerCase());

		return allItems.filter((item) => {
			const haystack =
				item.type === 'shortcut'
					? String(item.hotkey).toLowerCase()
					: item.sequence
							.map((s) => String(s))
							.join(' ')
							.toLowerCase();
			return needles.some((n) => haystack.includes(n));
		});
	});

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

<Shortcut hotkey={PALETTE_HOTKEY} description={texts.shortcutDescription} action={togglePalette} />

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
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered_items as item (item.key)}
							<Table.Row>
								<Table.Cell class="incant-palette-cell-keys">
									{#if item.type === 'shortcut'}
										<Kbds hotkey={item.hotkey} {formatShortcut} />
									{:else}
										<Kbds sequence={item.sequence} {formatShortcut} />
									{/if}
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
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={showToggles ? 3 : 2} class="incant-palette-empty-state">
									{texts.emptyState}
									{heldKeys.keys.join(' + ')}.
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

{#if activeChord}
	<div class="incant-chord-display">
		<Kbds sequence={activeChord.completedSteps} {formatShortcut} />
		{#if activeChord.hasMore}
			<span class="incant-chord-display-arrow">→</span>
			<div class="incant-chord-display-next">
				<div class="incant-chord-display-progress">
					<CircularProgress expiresAt={activeChord.expiresAt} duration={activeChord.timeout} />
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
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

	:global(.incant-palette-description) {
		margin: 2rem 0;
	}

	:global(.incant-palette-description-text) {
		margin-bottom: 1rem;
		font-size: var(--incant-font-size-sm, 0.875rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	:global(.incant-palette-cell-keys) {
		font-weight: 500;
	}

	:global(.incant-palette-cell-actions) {
		text-align: right;
	}

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
		color: #10b981;
	}

	:global(.incant-palette-toggle-icon.disabled) {
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	:global(.incant-palette-empty-state) {
		text-align: center;
		padding: 1rem 0;
		font-size: var(--incant-font-size-sm, 0.875rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
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
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		z-index: var(--incant-z-index-chord-display, 1000);
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
