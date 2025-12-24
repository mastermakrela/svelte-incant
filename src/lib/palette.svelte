<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Keyboard, ToggleLeft, ToggleRight } from '@lucide/svelte';
	import { activeElement, PressedKeys, watch } from 'runed';
	import { formatKeysForDisplay, shortcuts, slugify, toggle_shortcut } from './palette.svelte.js';
	import Shortcut from './shortcut.svelte';

	let open = $state(false);
	let tooltip_open = $state(false);

	const pressed_keys = new PressedKeys();
	const all_keys = $derived(pressed_keys.all);

	const filtered_shortcuts = $derived.by(() => {
		const all_shortcuts = Object.values(shortcuts);

		const _all_keys = all_keys.filter((key) => ['?', '/', ' '].indexOf(key) === -1);

		// If no keys are pressed, show all shortcuts
		if (_all_keys.length === 0) {
			return all_shortcuts;
		}

		// Filter shortcuts that contain any of the pressed keys
		return all_shortcuts.filter((shortcut) => {
			// Normalize keys to always be an array of arrays
			let normalizedKeys: string[][];
			if (typeof shortcut.keys === 'string') {
				normalizedKeys = [[shortcut.keys]];
			} else if (Array.isArray(shortcut.keys)) {
				if (shortcut.keys.length > 0 && typeof shortcut.keys[0] === 'string') {
					normalizedKeys = [shortcut.keys as string[]];
				} else {
					normalizedKeys = shortcut.keys as string[][];
				}
			} else {
				normalizedKeys = [];
			}

			// Check if any of the shortcut's key combinations contain any of the pressed keys
			return normalizedKeys.some((keyCombo: string[]) =>
				keyCombo.some((key: string) =>
					_all_keys.some((pressedKey) => key.toLowerCase() === pressedKey.toLowerCase())
				)
			);
		});
	});

	const keys = new PressedKeys();

	function isTypingElement(element: Element | null): boolean {
		// TODO: come up with better heuristic
		return false;
		if (!element) return false;

		const tagName = element.tagName.toLowerCase();

		// Check for contenteditable elements
		if (element.isContentEditable) return true;

		// Check for textarea
		if (tagName === 'textarea') return true;

		// Check for input elements with text-like types
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

	watch(
		() => Object.keys(shortcuts),
		() => {
			console.log('shortcuts', $state.snapshot(shortcuts));
			for (const shortcut_slug in shortcuts) {
				const shortcut = shortcuts[shortcut_slug];
				if (!shortcut) continue;
				keys.onKeys(shortcut.keys, () => {
					const target = activeElement.current;

					if (shortcut.enabled && !isTypingElement(target)) {
						shortcut.action();
					}
				});
			}
		}
	);
</script>

<!-- <Shortcut keys={[['?'], ['/']]} description="Open shortcut palette" action={() => (open = !open)} /> -->
<Shortcut
	keys={['/']}
	description="Open shortcut palette"
	action={() => {
		open = !open;
	}}
/>
<!-- <Shortcut
	keys={['a']}
	description="lorem ipsum"
	action={() => {
		console.log('lorem ipsum');
	}}
/> -->

<Tooltip.Provider delayDuration={0}>
	<Tooltip.Root bind:open={tooltip_open}>
		<Tooltip.Trigger
			class={[buttonVariants({ size: 'icon-lg' }), 'fixed right-4 bottom-4 cursor-pointer']}
			onclick={() => {
				open = !open;
			}}
		>
			<Keyboard />
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
			<Dialog.Description class="my-8">
				<p class="mb-4 text-sm text-muted-foreground">
					Press any key to filter shortcuts containing that key. Matching keys will be highlighted
					in green.
				</p>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Keys</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head class="text-right">Enabled</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered_shortcuts as shortcut (slugify(shortcut.keys))}
							<Table.Row>
								<Table.Cell class="font-medium">
									<Kbd.Group>
										{#each formatKeysForDisplay(shortcut.keys) as item, index (index)}
											{#if item.type === 'kbd'}
												<Kbd.Root>
													{item.content}
												</Kbd.Root>
											{:else}
												<span>{item.content}</span>
											{/if}
										{/each}
									</Kbd.Group>
								</Table.Cell>
								<Table.Cell>{shortcut.description}</Table.Cell>
								<Table.Cell class="text-right">
									<button
										class="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
										onclick={() => toggle_shortcut(shortcut)}
										aria-label={shortcut.enabled ? 'Disable shortcut' : 'Enable shortcut'}
									>
										{#if shortcut.enabled !== false}
											<ToggleRight class="h-5 w-5 text-green-500" />
										{:else}
											<ToggleLeft class="h-5 w-5 text-muted-foreground" />
										{/if}
									</button>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={3} class="text-center py-4 text-sm text-muted-foreground">
									No shortcuts containing
									<Kbd.Root>
										{formatKeysForDisplay(all_keys)
											.map((item) => item.content)
											.join(' ')}
									</Kbd.Root>
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
