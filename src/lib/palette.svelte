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
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Keyboard, ToggleLeft, ToggleRight } from '@lucide/svelte';
	import { PressedKeys } from 'runed';
	import { registry, slugify } from './palette.svelte.js';
	import Shortcut from './shortcut.svelte';
	import Kbds from '$lib/components/kbds.svelte';

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
		const _all_keys = all_keys.filter((key) => ['?', '/', ' '].indexOf(key) === -1);
		return registry.filteredShortcuts(_all_keys);
	});

	const positionClass = $derived.by(() => {
		switch (position) {
			case 'top-left':
				return 'fixed left-4 top-4';
			case 'top-center':
				return 'fixed left-1/2 top-4 -translate-x-1/2';
			case 'top-right':
				return 'fixed right-4 top-4';
			case 'bottom-left':
				return 'fixed left-4 bottom-4';
			case 'bottom-center':
				return 'fixed left-1/2 bottom-4 -translate-x-1/2';
			case 'bottom-right':
				return 'fixed right-4 bottom-4';
			case 'none':
				return '';
		}
	});
</script>

<Shortcut keys={[['?'], ['/']]} description="Open shortcut palette" action={() => (open = !open)} />

<Tooltip.Provider delayDuration={0}>
	<Tooltip.Root bind:open={tooltip_open}>
		<Tooltip.Trigger
			class={[buttonVariants({ size: 'icon-lg' }), positionClass, 'cursor-pointer']}
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
									<Kbds keys={shortcut.keys} />
								</Table.Cell>
								<Table.Cell>{shortcut.description}</Table.Cell>
								<Table.Cell class="text-right">
									<button
										class="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
										onclick={() => registry.toggle(shortcut.keys)}
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
