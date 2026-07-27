<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { Chord, Focus, Palette, shortcut } from '$lib';
	import ComboboxExample from '$lib/combobox-example.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import Header from '$lib/components/header.svelte';
	import Kbds from '$lib/package/components/kbds.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Kbd from '$lib/package/components/ui/kbd/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { PalettePosition } from '$lib/package/palette.svelte';

	const installCode = `bun add svelte-incant`;

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
  keys="Control+S"
  description="Save document"
  action={() => console.log('Save document')}
 />`;

	const focusCode =
		`<script>
  import { Focus } from 'svelte-incant';
 <` +
		`/script>

 <Focus keys="Control+E" description="Focus search input">
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
    keys: 'Meta+I',
    description: 'Focus text input'
   })}
  />`;

	const chordCode =
		`<script>
  import { Chord } from 'svelte-incant';
 <` +
		`/script>

 <!-- Array form: every step is type-checked and autocompletes -->
 <Chord
  steps={['Mod+K', 'B']}
  description="Open bookmarks"
  action={() => console.log('Open bookmarks')}
 />

 <!-- The space-separated string form still works, but is not checked -->
 <Chord steps="Mod+K B" description="Open bookmarks" action={() => {}} />`;

	const linkButtonDemoCode = `<div class="grid grid-cols-2 place-items-center gap-8">
	<Focus keys="Control+L" description="Opens a link" class="rounded">
		<Button href="https://mastermakrela.com" target="_blank" variant="link">
			Link
		</Button>
	</Focus>
	<Focus keys="Control+B" description="Clicks a button" class="rounded">
		<Button onclick={() => alert('Button clicked!')}>Button</Button>
	</Focus>
</div>`;

	const inputDemoCode =
		`<script>
  import { Focus } from 'svelte-incant';
  import { Input } from './components/ui/input';
 <` +
		`/script>

  <Focus keys="Control+E" description="Focus search input">
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

	const toggleCode =
		`<script>
  import { Palette } from 'svelte-incant';
 <` +
		`/script>

  <!-- Show toggle buttons for enabling/disabling shortcuts -->
  <Palette showToggles={true} />

  <!-- Hide toggle buttons (default behavior) -->
  <Palette showToggles={false} />`;

	const rebindCode =
		`<script>
  import { Palette } from 'svelte-incant';
 <` +
		`/script>

  <!-- Add a Rebind column: record a replacement combo for any shortcut -->
  <Palette showRebinding={true} />`;

	const defaultsCode =
		`<script>
  import { Palette } from 'svelte-incant';
 <` +
		`/script>

  <!-- App-wide defaults for every shortcut, chord and attachment -->
  <Palette sequenceTimeout={3000} preventDefault={true} />`;

	const derivedCode =
		`<script>
  import { shortcut } from 'svelte-incant';
 <` +
		`/script>

  <!-- No keys: the first alphanumeric character of the text wins -->
  <button {@attach shortcut()}>Duplicate</button>  <!-- binds Control+D -->

  <!-- An input has no text, so its <label> is used instead -->
  <label for="note">Quick note</label>
  <input id="note" {@attach shortcut()} />         <!-- binds Control+Q -->`;

	const outlineCode = `:root {
	--incant-outline-width: 2px;
	--incant-outline-style: dotted;
	--incant-outline-color: #878787;
	--incant-outline-offset: 2px;
}`;

	const outlineRadiusCode =
		`<!-- Focus wraps its children in a div and the outline lands on that
      wrapper, so the corner shape comes from Focus's own class -->
 <Focus keys="Control+B" description="Save" class="rounded-none">
  <Button>Save</Button>
 </Focus>

 <!-- The attachment has no wrapper, so the outline follows the
      element you attach it to -->
 <button class="rounded-none" {@attach shortcut({ keys: 'Control+S' })}>
  Save
 <` + `/button>`;

	/** Each preset only sets the properties it changes; the rest fall back to the defaults. */
	const outlinePresets = [
		{ label: 'Default', css: '' },
		{
			label: 'Sharp & solid',
			css: '--incant-outline-style: solid; --incant-outline-width: 1px; --incant-outline-offset: 0px; --incant-outline-color: currentColor;'
		},
		{
			label: 'Bold dashed',
			css: '--incant-outline-style: dashed; --incant-outline-width: 3px; --incant-outline-offset: 4px; --incant-outline-color: #e11d48;'
		}
	];

	let position = $state<PalettePosition>('bottom-right');
	let showRebinding = $state(false);
	let sequenceTimeout = $state(1500);
	let showDerived = $state(false);
	let outlinePreset = $state(0);
	let previewOutline = $state(false);

	const outlineCss = $derived(outlinePresets[outlinePreset]?.css ?? '');
</script>

<Palette {position} showToggles={true} {showRebinding} {sequenceTimeout} />

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

			<CodeBlock language="bash" code={installCode} />
		</section>

		<!-- Usage -->
		<section class="space-y-6">
			<h2 class="text-2xl font-semibold">Usage</h2>
			<div class="space-y-4">
				<p class="">Add Palette component to your root layout to enable shortcut overlay.</p>

				<CodeBlock language="xml" code={layoutCode} />

				<p class="">Register keyboard shortcuts with Shortcut component:</p>

				<CodeBlock language="xml" code={shortcutCode} />

				<p class="">
					For focusing elements (like inputs), or clicking buttons, use <code>Focus</code> component:
				</p>

				<CodeBlock language="xml" code={focusCode} />

				<p class="text-sm text-muted-foreground">
					This focuses the element it attaches to directly, as opposed to the <code>Focus</code>
					component, which wraps the children in a <code>div</code> and focuses that.
				</p>

				<p class="">or attach shortcuts directly to an element using:</p>

				<CodeBlock language="xml" code={attachCode} />

				<p class="text-sm text-muted-foreground">
					This focuses the element it attaches to directly, as opposed to the <code>Focus</code>
					component, which wraps the children in a <code>div</code> and focuses that.
				</p>

				<p class="">
					For sequential key combinations (chords), use <code>Chord</code> component. Chords are different
					from shortcuts - you press one combination (e.g., Cmd+K), then another (e.g., B) to activate
					them. They take priority over shortcuts on conflicts.
				</p>

				<CodeBlock language="xml" code={chordCode} />
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

			<h3 class="mb-4 text-lg font-medium">Use with links and buttons</h3>
			<Tabs.Root value="example" class="w-full">
				<Card.Root>
					<Card.Content class="grid h-80 place-items-center">
						<Tabs.Content value="example">
							<div class="grid grid-cols-2 place-items-center gap-8">
								<Focus keys="Control+L" description="Opens a link" class="rounded">
									<Button href="https://mastermakrela.com" target="_blank" variant="link">
										Link
									</Button>
								</Focus>
								<Focus keys="Control+B" description="Clicks a button" class="rounded">
									<Button onclick={() => alert('Button clicked!')}>Button</Button>
								</Focus>
							</div>
						</Tabs.Content>
						<Tabs.Content value="code">
							<CodeBlock language="xml" code={linkButtonDemoCode} />
						</Tabs.Content>
					</Card.Content>
				</Card.Root>
				<Tabs.List>
					<Tabs.Trigger value="example">Example</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>

			<h3 class="mb-4 text-lg font-medium">Use with inputs</h3>
			<p class="text-sm text-muted-foreground">
				Press <kbd class="rounded border bg-muted px-1 py-0.5 text-xs">⌥</kbd> (alt) to see the
				focus shortcut hint. Or press <Kbds keys="Control+E" /> to focus the input below.
			</p>
			<Tabs.Root value="example" class="w-full">
				<Card.Root>
					<Card.Content class="grid h-80 place-items-center">
						<Tabs.Content value="example">
							<Focus keys="Control+E" description="Focus search input" class="rounded">
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

			<h3 class="mb-4 text-lg font-medium">Key Chords</h3>
			<p class="text-sm text-muted-foreground">
				Press <Kbds keys="Mod+K" />, then <Kbd.Root>B</Kbd.Root> to open bookmarks. Press
				<Kbd.Root>Esc</Kbd.Root> to cancel an in-progress chord. Chords timeout after 1.5 seconds if not
				completed.
			</p>
			<Tabs.Root value="example" class="w-full">
				<Card.Root>
					<Card.Content class="grid h-80 place-items-center">
						<Tabs.Content value="example">
							<div class="space-y-4">
								<p class="text-center">
									Try pressing: <Kbds keys="Mod+K" /> → <Kbd.Root>B</Kbd.Root>
								</p>
								<p class="text-center text-sm text-muted-foreground">Or click the button below:</p>
								<div class="flex justify-center">
									<Button onclick={() => alert('Chord triggered!')}>Trigger Chord Manually</Button>
								</div>
								<Chord
									steps={['Mod+K', 'B']}
									description="Open bookmarks"
									action={() => alert('Chord triggered!')}
								/>
							</div>
						</Tabs.Content>
						<Tabs.Content value="code">
							<CodeBlock language="xml" code={chordCode} />
						</Tabs.Content>
					</Card.Content>
				</Card.Root>
				<Tabs.List>
					<Tabs.Trigger value="example">Example</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			<h3 class="mb-4 text-lg font-medium">Rebind shortcuts</h3>
			<p class="text-sm text-muted-foreground">
				With <code>showRebinding</code>, every palette row grows a
				<code>Rebind</code>
				button. Click it, press the combination you want, and the shortcut re-registers on the spot —
				<Kbd.Root>Esc</Kbd.Root>
				cancels, <Kbd.Root>⌫</Kbd.Root> restores the declared combo. For chords, press each step and
				<Kbd.Root>Enter</Kbd.Root> to save. Overrides live in memory only, so a reload brings the declared
				combos back.
			</p>
			<Tabs.Root value="example" class="w-full">
				<Card.Root>
					<Card.Content class="grid h-80 place-items-center">
						<Tabs.Content value="example">
							<div class="space-y-4 text-center">
								<Button onclick={() => (showRebinding = !showRebinding)}>
									{showRebinding ? 'Hide' : 'Show'} the Rebind column
								</Button>
								<p class="text-sm text-muted-foreground">
									Then open the palette and rebind, say, <Kbds keys="Control+B" /> to something else.
								</p>
							</div>
						</Tabs.Content>
						<Tabs.Content value="code">
							<CodeBlock language="xml" code={rebindCode} />
						</Tabs.Content>
					</Card.Content>
				</Card.Root>
				<Tabs.List>
					<Tabs.Trigger value="example">Example</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>

			<h3 class="mb-4 text-lg font-medium">Keys derived from text</h3>
			<p class="text-sm text-muted-foreground">
				Call <code>shortcut()</code> with no <code>keys</code> and the first alphanumeric character
				of the element's text becomes the shortcut, behind a modifier — <code>Control</code> by
				default, set app-wide with <code>deriveModifier</code>. An <code>&lt;input&gt;</code> has no
				text of its own, so its <code>&lt;label&gt;</code> is used instead.
			</p>
			<Tabs.Root value="example" class="w-full">
				<Card.Root>
					<Card.Content class="grid h-80 place-items-center">
						<Tabs.Content value="example">
							<div class="space-y-4 text-center">
								<Button variant="outline" onclick={() => (showDerived = !showDerived)}>
									{showDerived ? 'Unmount' : 'Mount'} the derived shortcuts
								</Button>
								{#if showDerived}
									<div class="flex items-center justify-center gap-4">
										<!-- "Duplicate" derives Control+D — "Bookmark" would collide with the
										     Focus demo's Control+B above, and preferences are keyed per combo. -->
										<Button
											onclick={() => alert('Duplicated!')}
											{@attach shortcut({ description: 'Duplicate (derived from the label)' })}
										>
											Duplicate
										</Button>
										<div class="space-y-1 text-left">
											<label for="derived-note" class="text-sm">Quick note</label>
											<Input
												id="derived-note"
												type="text"
												placeholder="…"
												{@attach shortcut({ description: 'Quick note (derived from the label)' })}
											/>
										</div>
									</div>
									<p class="text-sm text-muted-foreground">
										<Kbds keys="Control+D" /> clicks the button, <Kbds keys="Control+Q" /> focuses the
										input.
									</p>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="code">
							<CodeBlock language="xml" code={derivedCode} />
						</Tabs.Content>
					</Card.Content>
				</Card.Root>
				<Tabs.List>
					<Tabs.Trigger value="example">Example</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
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

			<div class="mt-8 space-y-4">
				<p class="">
					The <code>Palette</code> component also accepts a <code>showToggles</code> prop to control whether
					users can enable/disable shortcuts:
				</p>

				<CodeBlock language="xml" code={toggleCode} />

				<p class="text-sm text-muted-foreground">
					When <code>showToggles={true}</code>, users can toggle individual shortcuts on/off using
					the toggle buttons in the palette. When <code>showToggles={false}</code> (default), the toggle
					column is hidden and all shortcuts remain active.
				</p>
			</div>

			<div class="mt-8 space-y-4">
				<p class="">
					<code>Palette</code> also carries the app-wide defaults. They apply to every shortcut,
					chord and <code>shortcut()</code> attachment alike — a per-shortcut
					<code>preventDefault</code> still wins.
				</p>

				<CodeBlock language="xml" code={defaultsCode} />

				<p class="text-sm text-muted-foreground">
					Change the chord window and then try <Kbds keys="Mod+K" /> →
					<Kbd.Root>B</Kbd.Root> again:
				</p>
				<ul class="flex flex-wrap gap-2 text-xs">
					{#each [500, 1500, 3000] as ms (ms)}
						<li>
							<Button
								variant={sequenceTimeout === ms ? 'secondary' : 'ghost'}
								size="sm"
								onclick={() => (sequenceTimeout = ms)}
							>
								<code>sequenceTimeout={ms}</code>
							</Button>
						</li>
					{/each}
				</ul>
			</div>

			<div class="mt-8 space-y-4">
				<h3 class="text-lg font-medium">Styling the reveal outline</h3>

				<p class="">
					Holding the reveal modifier (<Kbd.Root>⌥</Kbd.Root> by default, see
					<code>revealModifier</code>) outlines every element that has a shortcut. That outline is a
					class — <code>.incant-revealed</code> — rather than an inline style, so it never overrides
					an <code>outline</code> of your own. Four custom properties control it:
				</p>

				<CodeBlock language="css" code={outlineCode} />

				<p class="">
					There is deliberately no radius variable: <code>outline</code> follows the element's own
					<code>border-radius</code>, so a project with sharp edges gets sharp outlines for free,
					and a rounded one gets rounded corners. The element that carries the outline differs
					between the two APIs:
				</p>

				<CodeBlock language="xml" code={outlineRadiusCode} />

				<p class="text-sm text-muted-foreground">
					Pick a preset and reveal the outline — the left box is rounded, the right one is square:
				</p>

				<Card.Root>
					<Card.Content class="space-y-6">
						<div class="flex flex-wrap gap-2 text-xs">
							{#each outlinePresets as preset, i (preset.label)}
								<Button
									variant={outlinePreset === i ? 'secondary' : 'ghost'}
									size="sm"
									onclick={() => (outlinePreset = i)}
								>
									{preset.label}
								</Button>
							{/each}
						</div>

						<div class="flex flex-wrap items-center justify-center gap-10 py-4" style={outlineCss}>
							<div
								class="rounded-lg border px-4 py-2 text-sm"
								class:incant-revealed={previewOutline}
							>
								rounded-lg
							</div>
							<div class="border px-4 py-2 text-sm" class:incant-revealed={previewOutline}>
								square
							</div>
						</div>

						<div class="text-center">
							<Button variant="outline" onclick={() => (previewOutline = !previewOutline)}>
								{previewOutline ? 'Hide' : 'Show'} the outline
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<!-- Footer -->
		<footer class="space-y-2 border-t pt-8 text-center text-sm text-muted-foreground">
			<p>
				Created by <a href="https://mastermakrela.com" target="_blank" class="hover:underline"
					>mastermakrela</a
				>
			</p>
			<p>
				<a href={resolve('/llms.txt')} target="_blank" class="hover:underline">llms.txt</a> - LLM-friendly
				documentation
			</p>
		</footer>
	</main>
</div>
