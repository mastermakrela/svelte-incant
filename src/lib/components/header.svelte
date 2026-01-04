<script lang="ts">
	import { shortcut } from '$lib';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Kbd from '$lib/package/components/ui/kbd/index.js';
	import GithubIcon from '@lucide/svelte/icons/github';
	import { useInterval } from 'runed';

	// All keyboard keys for the decorative background
	const allKeys = [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'0',
		'⌘',
		'⌥',
		'⌃',
		'⇧',
		'⇥',
		'↵',
		'⌫',
		'⎋',
		'←',
		'→',
		'↑',
		'↓',
		'/',
		'?',
		'.',
		',',
		';',
		"'",
		'[',
		']'
	];

	// Total number of keys to display
	const totalKeys = 500;

	// Helper to get a random key
	function getRandomKey() {
		return allKeys[Math.floor(Math.random() * allKeys.length)] ?? 'A';
	}

	// Helper to get random unique indices
	function getRandomIndices(count: number, max: number): number[] {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const indices = new Set<number>();
		while (indices.size < count) {
			indices.add(Math.floor(Math.random() * max));
		}
		return Array.from(indices);
	}

	// Key cell type with unique id for transitions
	type KeyCell = { id: number; key: string };

	// Initialize with random keys as a flat array
	let nextId = 0;
	let keyboardKeys = $state<KeyCell[]>(
		Array.from({ length: totalKeys }, () => ({ id: nextId++, key: getRandomKey() }))
	);

	useInterval(500, {
		callback: () => {
			const keysToChange = 7 + Math.floor(Math.random() * 4);
			const indices = getRandomIndices(keysToChange, totalKeys);

			for (const index of indices) {
				keyboardKeys[index] = { id: nextId++, key: getRandomKey() };
			}
		}
	});
</script>

<!-- Hero section with keyboard background -->
<header class="relative flex flex-col items-center justify-center overflow-hidden">
	<!-- Decorative keyboard background -->
	<!-- class="pointer-events-none absolute inset-0 grid place-content-center gap-1.5 p-1 select-none" -->
	<div
		class="pointer-events-none grid max-h-[40vh] w-full place-content-center gap-1.5 p-1 select-none"
		style="grid-template-columns: repeat(auto-fit, 2rem); justify-content: center;"
		aria-hidden="true"
	>
		{#each keyboardKeys as cell (cell.id)}
			<span
				class="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border/20 bg-muted/30 font-sans text-sm font-medium text-muted-foreground/30"
			>
				{cell.key}
			</span>
		{/each}
	</div>

	<!-- Gradient fade to white -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background: linear-gradient(to bottom, transparent 0%, transparent 40%, var(--background) 100%);"
	></div>

	<!-- Header content -->
	<div class="absolute bottom-16 z-10 space-y-4 px-4 text-center">
		<h1 class="text-4xl font-bold tracking-tight">Svelte Incant</h1>
		<p class="text-lg text-muted-foreground">
			A keyboard shortcut management library for Svelte.
			<br />
			Press <Kbd.Root>?</Kbd.Root> to see it in action. Or hold <Kbd.Root>Alt</Kbd.Root> to see the shortcut
			hints.
		</p>
		<div class="flex items-center justify-center gap-3 pt-4">
			<Button
				variant="outline"
				href="https://github.com/mastermakrela/svelte-incant"
				target="_blank"
				{@attach shortcut({
					keys: 'G',
					description: 'Open GitHub'
				})}
			>
				<GithubIcon class="mr-2 h-4 w-4" />
				GitHub
			</Button>
		</div>
	</div>
</header>
