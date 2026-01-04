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
	import { PressedKeys } from 'runed';
	import Kbds from './components/kbds.svelte';
	import * as Dialog from './components/ui/dialog/index.js';
	import * as Kbd from './components/ui/kbd/index.js';
	import * as Table from './components/ui/table';
	import * as Tooltip from './components/ui/tooltip';
	import { registry, slugify } from './palette.svelte.js';
	import Shortcut from './shortcut.svelte';

	let {
		position = 'bottom-right'
	}: {
		position?: PalettePosition;
	} = $props();

	let open = $state(false);
	let tooltip_open = $state(false);

	const pressed_keys = new PressedKeys();
	const all_keys = $derived(pressed_keys.all);

	const filtered_shortcuts = $derived.by(() => {
		const _all_keys = all_keys.filter((key) => ['?', '/', ' ', 'tab'].indexOf(key) === -1);
		return registry.filteredShortcuts(_all_keys);
	});

	const positionStyles = $derived.by(() => {
		switch (position) {
			case 'top-left':
				return 'left: 1rem; top: 1rem;';
			case 'top-center':
				return 'left: 50%; top: 1rem; transform: translateX(-50%);';
			case 'top-right':
				return 'right: 1rem; top: 1rem;';
			case 'bottom-left':
				return 'left: 1rem; bottom: 1rem;';
			case 'bottom-center':
				return 'left: 50%; bottom: 1rem; transform: translateX(-50%);';
			case 'bottom-right':
				return 'right: 1rem; bottom: 1rem;';
			case 'none':
				return 'display: none;';
			default:
				return 'right: 1rem; bottom: 1rem;';
		}
	});
</script>

<Shortcut keys={[['?'], ['/']]} description="Open shortcut palette" action={() => (open = !open)} />

<Tooltip.Provider delayDuration={0}>
	<!-- <Tooltip.Root bind:open={tooltip_open}> -->
	<Tooltip.Root bind:open={tooltip_open}>
		<Tooltip.Trigger onclick={() => (open = !open)}>
			{#snippet child({ props })}
				<button {...props} style={positionStyles} class={['incant-palette-trigger']}>
					<Keyboard />
				</button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			Press <Kbd.Root>?</Kbd.Root>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Keyboard Shortcuts</Dialog.Title>
			<Dialog.Description class="incant-palette-description">
				<p class="incant-palette-description-text">
					Press any key to filter shortcuts containing that key. Matching keys will be highlighted
					in green.
				</p>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Keys</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head class="incant-palette-cell-actions">Enabled</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered_shortcuts as shortcut (slugify(shortcut.keys))}
							<Table.Row>
								<Table.Cell class="incant-palette-cell-keys">
									<Kbds keys={shortcut.keys} />
								</Table.Cell>
								<Table.Cell>{shortcut.description}</Table.Cell>
								<Table.Cell class="incant-palette-cell-actions">
									<button
										type="button"
										class="incant-palette-toggle"
										onclick={() => registry.toggle(shortcut.keys)}
										aria-label={shortcut.enabled ? 'Disable shortcut' : 'Enable shortcut'}
										tabindex="0"
									>
										{#if shortcut.enabled !== false}
											<ToggleRight class="incant-palette-toggle-icon enabled" />
										{:else}
											<ToggleLeft class="incant-palette-toggle-icon disabled" />
										{/if}
									</button>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={3} class="incant-palette-empty-state">
									No shortcuts containing
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

	/* Empty State */
	:global(.incant-palette-empty-state) {
		text-align: center;
		padding: 1rem 0;
		font-size: var(--incant-font-size-sm, 0.875rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}
</style>
