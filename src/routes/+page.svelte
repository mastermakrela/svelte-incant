<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Focus } from '$lib';
	import ComboboxExample from '$lib/combobox-example.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import Header from '$lib/components/header.svelte';
	import Kbds from '$lib/components/kbds.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Palette, { type PalettePosition } from '$lib/palette.svelte';

	const installCode = `bun install svelte-incant`;

	const layoutCode =
		`<script>
  import { Palette } from 'svelte-incant';
 <` +
		`/script>

 <Palette />

 <!-- ... -->
 `;

	const shortcutCode =
		`<script>
  import { Shortcut } from 'svelte-incant';
 <` +
		`/script>

 <Shortcut
  keys={['control', 's']}
  description="Save document"
  action={() => console.log('Save document')}
 />`;

	const focusCode =
		`<script>
  import { Focus } from 'svelte-incant';
 <` +
		`/script>

 <Focus keys={['control', 'e']} description="Focus search input">
  <input type="text" placeholder="Search..." />
 </Focus>`;

	const attachCode =
		`<script>
  import { shortcut } from 'svelte-incant';
  <` +
		`/script>

  <input
   type="text"
   placeholder="Type something..."
   {@attach shortcut({
    keys: ['meta', 'i'],
     description: 'Focus text input',
   })}
  />`;

	const inputDemoCode =
		`<script>
  import { Focus } from 'svelte-incant';
  import { Input } from './components/ui/input';
 <` +
		`/script>

  <Focus keys={['control', 'e']} description="Focus search input" class="rounded">
    <Input type="text" placeholder="Search..." />
  </Focus>`;

	const positionCode =
		`<script>
  import { Palette } from 'svelte-incant';
 <` +
		`/script>

  <!-- Position the palette trigger in top-left corner -->
  <Palette position="top-left" />

  <!-- Hide the trigger button completely -->
  <Palette position="none" />`;

	let position = $state<PalettePosition>('bottom-right');
</script>

<Palette {position} />

<svelte:head>
	<title>Svelte Incant</title>
	<meta name="description" content="A keyboard shortcut management library for Svelte" />
</svelte:head>

<Header />

<div class="flex flex-col items-center px-4">
	<main class="w-full max-w-2xl space-y-16 py-16">
		<!-- Installation -->
		<section class="space-y-6">
			<h2 class="text-2xl font-semibold">Installation</h2>
			<CodeBlock language="javascript" code={installCode} />
		</section>

		<!-- Usage -->
		<section class="space-y-6">
			<h2 class="text-2xl font-semibold">Usage</h2>
			<div class="space-y-4">
				<p class="">Add Palette component to your root layout to enable shortcut overlay.</p>

				<CodeBlock language="xml" code={layoutCode} />

				<p class="">Register keyboard shortcuts with Shortcut component:</p>

				<CodeBlock language="xml" code={shortcutCode} />

				<p class="">For focusing elements (like inputs), use <code>Focus</code> component:</p>

				<CodeBlock language="xml" code={focusCode} />

				<p class="">or attach shortcuts directly to an element using:</p>

				<CodeBlock language="xml" code={attachCode} />

				<p class="text-sm text-muted-foreground">
					This focuses the element it attaches to directly, as opposed to the <code>Focus</code>
					component, which wraps the children in a <code>div</code> and focuses that.
				</p>
			</div>

			<hr class="my-8" />

			<p>
				<code>Shortcuts</code> appear in the <code>Palette</code> and run their actions, as long as the
				component is mounted. That means you ca easily have different shortcuts in different routes of
				your site.
			</p>
		</section>

		<!-- Demo -->
		<section class="space-y-6">
			<h2 class="text-2xl font-semibold">Demo</h2>

			<h3 class="text-lg font-medium">Show Incant Palette</h3>
			<Card.Root>
				<Card.Content class="grid h-80 place-items-center">
					<p class="text-center text-muted-foreground">
						Press <Kbd.Root>?</Kbd.Root> to open shortcut palette and see all registered shortcuts.
						<br />
						Or click the button it bottom right corner of the screen.
					</p>
				</Card.Content>
			</Card.Root>

			<h3 class="mb-4 text-lg font-medium">Use with inputs</h3>
			<p class="text-sm text-muted-foreground">
				Press <kbd class="rounded border bg-muted px-1 py-0.5 text-xs">⌥</kbd> (alt) to see the
				focus shortcut hint. Or press <Kbds keys={['control', 'e']} /> to focus the input below.
			</p>
			<Tabs.Root value="example" class="w-full">
				<Card.Root>
					<Card.Content class="grid h-80 place-items-center">
						<Tabs.Content value="example">
							<Focus keys={['control', 'e']} description="Focus search input" class="rounded">
								<Input type="text" placeholder="Search..." />
							</Focus>
						</Tabs.Content>
						<Tabs.Content value="code">
							<CodeBlock language="xml" code={inputDemoCode} />
						</Tabs.Content>
					</Card.Content>
				</Card.Root>
				<Tabs.List>
					<Tabs.Trigger value="example">Example</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>

			<h3 class="mb-4 text-lg font-medium">Use with complex components</h3>
			<ComboboxExample />
		</section>

		<!-- Configuration -->
		<section class="space-y-6">
			<h2 class="text-2xl font-semibold">Configuration</h2>
			<div class="space-y-4">
				<p class="">
					The <code>Palette</code> component accepts a <code>position</code> prop to control where the
					trigger button appears:
				</p>

				<CodeBlock language="xml" code={positionCode} />

				<p class="">Available positions:</p>
				<ul class="flex flex-wrap gap-2 text-xs">
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'top-left')}
							><code>top-left</code></Button
						>
					</li>
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'top-center')}
							><code>top-center</code></Button
						>
					</li>
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'top-right')}
							><code>top-right</code></Button
						>
					</li>
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'bottom-left')}
							><code>bottom-left</code></Button
						>
					</li>
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'bottom-center')}
							><code>bottom-center</code></Button
						>
					</li>
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'bottom-right')}
							><code>bottom-right</code></Button
						> (default)
					</li>
					<li>
						<Button variant="ghost" size="sm" onclick={() => (position = 'none')}
							><code>none</code></Button
						> (hides the trigger button)
					</li>
				</ul>
			</div>
		</section>

		<!-- Footer -->
		<footer class="space-y-2 border-t pt-8 text-center text-sm text-muted-foreground">
			<p>
				Created by <a href="https://mastermakrela.com" target="_blank" class="hover:underline"
					>mastermakrela</a
				>
			</p>
		</footer>
	</main>
</div>
