<script lang="ts">
	import { attach_shortcut } from '$lib/attachment.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Focus from '$lib/focus.svelte';
	import { add_shortcut, remove_shortcut, shortcuts } from '$lib/palette.svelte.js';
	import ShortcutComponent from '$lib/shortcut.svelte';
	import { cn } from '$lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	import { PressedKeys } from 'runed';

	const frameworks = [
		{
			value: 'sveltekit',
			label: 'SvelteKit'
		},
		{
			value: 'next.js',
			label: 'Next.js'
		},
		{
			value: 'nuxt.js',
			label: 'Nuxt.js'
		},
		{
			value: 'remix',
			label: 'Remix'
		},
		{
			value: 'astro',
			label: 'Astro'
		}
	];

	let open = $state(false);
	let value = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(frameworks.find((f) => f.value === value)?.label);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	let keys = $state('');
	let description = $state('');

	function handleAddShortcut() {
		if (!keys || !description) return;

		add_shortcut({
			keys: keys.split('+'),
			description: description,
			action: () => {
				console.log(`Shortcut triggered: ${keys}`);
			}
		});

		// Clear form
		keys = '';
		description = '';
	}

	function handleRemoveShortcut() {
		if (!keys) return;

		remove_shortcut({
			keys: keys,
			description: '',
			action: () => {}
		});

		keys = '';
	}

	const pressed_keys = new PressedKeys();
</script>

<pre class="fixed top-2 left-2">{JSON.stringify(pressed_keys.all, null, 2)}</pre>

<div class="container mx-auto max-w-2xl p-8">
	<h1 class="mb-6 text-2xl font-bold">Shortcut Manager</h1>

	<div class="mb-8 rounded-lg border p-6">
		<h2 class="mb-4 text-lg font-semibold">Add New Shortcut</h2>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleAddShortcut();
			}}
			class="space-y-4"
		>
			<Focus keys={['control', 'e']} description="Focus search input">
				<div>
					<label for="keys" class="mb-1 block text-sm font-medium">Keys</label>
					<input
						id="keys"
						type="text"
						bind:value={keys}
						placeholder="e.g., Ctrl+D or a"
						class="w-full rounded-md border px-3 py-2"
					/>
				</div>
			</Focus>

			<div>
				<label for="keys" class="mb-1 block text-sm font-medium">Keys</label>
				<input
					id="keys"
					type="text"
					bind:value={keys}
					placeholder="e.g., Ctrl+D or a"
					class="w-full rounded-md border px-3 py-2"
				/>
			</div>

			<div>
				<label for="description" class="mb-1 block text-sm font-medium">Description</label>
				<input
					id="description"
					type="text"
					bind:value={description}
					placeholder="e.g., Delete item"
					class="w-full rounded-md border px-3 py-2"
					{@attach attach_shortcut({ keys: ['control', 'x'], description: 'Focus description' })}
				/>
			</div>

			<div class="flex gap-2">
				<button type="submit" class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
					Add Shortcut
				</button>

				<button
					type="button"
					onclick={handleRemoveShortcut}
					class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					Remove Shortcut
				</button>
			</div>
		</form>
	</div>

	<div class="mb-8 space-y-8 rounded-lg border p-6">
		<h2 class="mb-4 text-lg font-semibold">Framework Combobox</h2>

		<Popover.Root bind:open>
			<Popover.Trigger bind:ref={triggerRef}>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="w-[200px] justify-between"
						role="combobox"
						aria-expanded={open}
						{@attach attach_shortcut({
							keys: ['meta', 'k'],
							description: 'Focus framework',
							action: () => {
								open = true;
							}
						})}
					>
						{selectedValue || 'Select a framework...'}
						<ChevronsUpDownIcon class="opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Search framework..." />
					<Command.List>
						<Command.Empty>No framework found.</Command.Empty>
						<Command.Group value="frameworks">
							{#each frameworks as framework (framework.value)}
								<Command.Item
									value={framework.value}
									onSelect={() => {
										value = framework.value;
										closeAndFocusTrigger();
									}}
								>
									<CheckIcon class={cn(value !== framework.value && 'text-transparent')} />
									{framework.label}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</div>

	<div class="rounded-lg border p-6">
		<h2 class="mb-4 text-lg font-semibold">Current Shortcuts</h2>
		<pre class="overflow-auto rounded bg-gray-100 p-4">{JSON.stringify(shortcuts, null, 2)}</pre>
	</div>
</div>

<ShortcutComponent
	keys={['control', 'A']}
	description="Delete item"
	action={() => {
		console.log('Delete shortcut triggered!');
		alert('Delete shortcut triggered!');
	}}
/>

<ShortcutComponent
	keys={['a']}
	description="lorem ipsum"
	action={() => {
		console.log('lorem ipsum');
	}}
/>
