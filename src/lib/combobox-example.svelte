<script lang="ts">
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { shortcut } from '$lib/package/attachment.svelte.js';

	import { cn } from '$lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

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

	const comboboxDemoCode =
		`<script>
  import { shortcut } from 'svelte-incant';
  import { Button } from './components/ui/button';
  import * as Popover from './components/ui/popover';
  <` +
		`/script>

  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          class="w-[200px] justify-between"
          role="combobox"
          aria-expanded={open}
          {@attach shortcut({
            keys: ['meta', 'k'],
            description: 'Focus framework combobox'
          })}
        >
          {selectedValue || 'Select a framework...'}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <!-- Popover content -->
  </Popover.Root>`;

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<p class="text-sm text-muted-foreground">
	Press <kbd class="rounded border bg-muted px-1 py-0.5 text-xs">⌥</kbd> (alt) to see the focus
	shortcut hint. Press <kbd class="rounded border bg-muted px-1 py-0.5 text-xs">⌘ K</kbd> to focus the
	combobox.
</p>

<Tabs.Root value="example" class="w-full">
	<Card.Root>
		<Tabs.Content value="example">
			<Card.Content class="grid h-80 place-items-center">
				<Popover.Root bind:open>
					<Popover.Trigger bind:ref={triggerRef}>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								class="w-[200px] justify-between"
								role="combobox"
								aria-expanded={open}
								{@attach shortcut({
									keys: ['meta', 'k'],
									description: 'Focus framework combobox'
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
											<CheckIcon
												class={cn(value !== framework.value ? 'text-transparent' : undefined)}
											/>
											{framework.label}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</Card.Content>
		</Tabs.Content>
		<Tabs.Content value="code">
			<Card.Content>
				<CodeBlock language="xml" code={comboboxDemoCode} />

				<p class="mt-4 text-sm text-muted-foreground">
					Full combobox code from <a
						href="https://shadcn-svelte.com/docs/components/combobox"
						target="_blank"
						class="font-mono underline"
					>
						https://shadcn-svelte.com/docs/components/combobox
					</a>
				</p>
			</Card.Content>
		</Tabs.Content>
	</Card.Root>
	<Tabs.List>
		<Tabs.Trigger value="example">Example</Tabs.Trigger>
		<Tabs.Trigger value="code">Code</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>
