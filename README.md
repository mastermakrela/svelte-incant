# Svelte Incant

A keyboard shortcut management library for Svelte 5.

## Installation

```sh
bun install svelte-incant
```

## Usage

Add `Palette` component to your root layout to enable the shortcut overlay:

```svelte
<script>
	import { Palette } from 'svelte-incant';
</script>

<Palette />

<!-- ... -->
```

Register keyboard shortcuts with the `Shortcut` component:

```svelte
<script>
	import { Shortcut } from 'svelte-incant';
</script>

<Shortcut
	keys={['control', 's']}
	description="Save document"
	action={() => console.log('Save document')}
/>
```

For focusing elements (like inputs), use the `Focus` component:

```svelte
<script>
	import { Focus } from 'svelte-incant';
</script>

<Focus keys={['control', 'e']} description="Focus search input">
	<input type="text" placeholder="Search..." />
</Focus>
```

Or attach shortcuts directly to an element using the `@attach` directive:

```svelte
<script>
	import { shortcut } from 'svelte-incant';
</script>

<input
	type="text"
	placeholder="Type something..."
	{@attach shortcut({
		keys: ['meta', 'i'],
		description: 'Focus text input'
	})}
/>
```

The `@attach` directive focuses the element it attaches to directly, as opposed to the `Focus` component, which wraps the children in a `div` and focuses that.

## Features

- **Shortcut Palette**: Press `?` to open the shortcut palette and see all registered shortcuts
- **Route-specific Shortcuts**: Shortcuts only run when their component is mounted, allowing different shortcuts in different routes
- **Focus Management**: Easily manage focus states with keyboard shortcuts
- **Component-based**: Use components or directives to register shortcuts
