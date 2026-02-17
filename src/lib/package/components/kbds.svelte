<script lang="ts">
	import * as Kbd from './ui/kbd/index.js';
	import { getKeyLabel, getIsMac } from '../utils.js';

	let {
		keys,
		isChord = false,
		formatShortcut
	}: {
		keys: string | string[] | string[][];
		isChord?: boolean;
		formatShortcut?: (keys: string[][], isChord: boolean, isMac: boolean) => string;
	} = $props();

	const isMac = getIsMac();

	type KeyCombination = string[];

	const MODIFIER_KEYS = new Set([
		'control',
		'ctrl',
		'alt',
		'option',
		'shift',
		'meta',
		'command',
		'cmd'
	]);

	function isModifier(key: string): boolean {
		return MODIFIER_KEYS.has(key.toLowerCase());
	}

	function sortKeys(keys: string[]): string[] {
		return [...keys].sort((a, b) => {
			const aIsModifier = isModifier(a);
			const bIsModifier = isModifier(b);
			if (aIsModifier && !bIsModifier) return -1;
			if (!aIsModifier && bIsModifier) return 1;
			return 0;
		});
	}

	let keyGroups: KeyCombination[] = $derived(
		typeof keys === 'string'
			? [[keys]]
			: Array.isArray(keys) && keys.length > 0 && typeof keys[0] === 'string'
				? [sortKeys(keys as string[])]
				: (keys as KeyCombination[]).map(sortKeys)
	);

	let isChordMode: boolean = $derived(isChord === true);

	const formatter: Intl.ListFormat = $derived(
		new Intl.ListFormat(
			undefined,
			isChordMode
				? {
						style: 'narrow',
						type: 'unit'
					}
				: {
						style: 'long',
						type: 'disjunction'
					}
		)
	);

	const formattedParts = $derived.by(() => {
		const combos = keyGroups.map((group) => group.map((key) => getKeyLabel(key, isMac)).join(' '));
		return formatter.formatToParts(combos);
	});

	const customFormatted = $derived(
		formatShortcut ? formatShortcut(keyGroups, isChordMode, isMac) : null
	);
</script>

{#if customFormatted !== null}
	<Kbd.Group class="incant-kbds-container">
		<Kbd.Root>{customFormatted}</Kbd.Root>
	</Kbd.Group>
{:else}
	<Kbd.Group class="incant-kbds-container">
		{#each formattedParts as part (part)}
			{#if part.type === 'element'}
				<Kbd.Root>{part.value}</Kbd.Root>
			{:else if isChordMode}
				<span class="incant-kbds-chord-separator">→</span>
			{:else}
				<span class="incant-kbds-separator">{part.value}</span>
			{/if}
		{/each}
	</Kbd.Group>
{/if}

<style>
	.incant-kbds-separator {
		margin: 0 var(--incant-spacing-1, 0.25rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}

	.incant-kbds-chord-separator {
		margin: 0 var(--incant-spacing-1, 0.25rem);
		color: var(--incant-colors-muted-foreground, hsl(240 3.8% 46.1%));
	}
</style>
