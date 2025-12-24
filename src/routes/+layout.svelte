<script lang="ts">
	import Focus from '$lib/focus.svelte';
	import Palette from '$lib/palette.svelte';
	import Shortcut from '$lib/shortcut.svelte';
	import { PressedKeys } from 'runed';

	import './layout.css';

	const { children } = $props();

	const pressed_keys = new PressedKeys();
</script>

<pre class="fixed top-2 left-2">{JSON.stringify(pressed_keys.all, null, 2)}</pre>

<Palette />

{@render children()}

<!-- <Shortcut
	keys={['a']}
	description="lorem ipsum"
	action={() => {
		console.log('lorem ipsum');
	}}
/>

<main class="p-8">
	<Focus keys={['control', 'e']} description="Focus search input">
		<div>
			<label for="keys" class="mb-1 block text-sm font-medium">Keys</label>
			<input
				id="keys"
				type="text"
				placeholder="e.g., Ctrl+D or a"
				class="w-full rounded-md border px-3 py-2"
			/>
		</div>
	</Focus>
</main> -->
