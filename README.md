# Svelte Incant

A keyboard shortcut management library for Svelte 5.

## Installation

Install the package:

```bash
bun add svelte-incant
```

Peer dependencies (`svelte`, `bits-ui`) will be installed automatically.

The package uses CSS custom properties (CSS variables) for styling, which work with any CSS framework or plain CSS.

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

The `@attach` directive focuses the element it attaches to directly, as opposed to the `Focus` component, which wraps children in a `div` and focuses that.

## Features

- **Shortcut Palette**: Press `?` to open the shortcut palette and see all registered shortcuts
- **Route-specific Shortcuts**: Shortcuts only run when their component is mounted, allowing different shortcuts in different routes
- **Focus Management**: Easily manage focus states with keyboard shortcuts
- **Component-based**: Use components or directives to register shortcuts
- **Framework Agnostic**: Works with any CSS framework or plain CSS using CSS custom properties

## Customization

The package uses CSS custom properties (CSS variables) for styling. You can override these in your global CSS to customize the appearance:

```css
/* Example: Customize colors */
:root {
	--incant-colors-primary: hsl(210 100% 50%);
	--incant-colors-primary-foreground: hsl(0 0% 100%);
	--incant-kbd-bg: #1e293b;
	--incant-kbd-color: #e2e8f0;
}

/* Dark mode support */
.dark {
	--incant-colors-background: hsl(240 10% 3.9%);
	--incant-colors-foreground: hsl(0 0% 98%);
	--incant-colors-primary: hsl(0 0% 98%);
	--incant-colors-primary-foreground: hsl(240 5.9% 10%);
	--incant-colors-muted: hsl(240 3.7% 15.9%);
	--incant-colors-muted-foreground: hsl(240 5% 64.9%);
	--incant-colors-border: hsl(240 3.7% 15.9%);
	--incant-colors-overlay: hsla(0 0% 0% / 0.8);
	--incant-kbd-bg: #374151;
	--incant-kbd-color: #9ca3af;
}
```

### Available CSS Variables

**Colors:**

- `--incant-colors-background`: Main background color
- `--incant-colors-foreground`: Main text color
- `--incant-colors-primary`: Primary button background
- `--incant-colors-primary-foreground`: Primary button text
- `--incant-colors-muted`: Muted background
- `--incant-colors-muted-foreground`: Muted text
- `--incant-colors-border`: Border color
- `--incant-colors-overlay`: Dialog overlay
- `--incant-kbd-bg`: Keyboard key background
- `--incant-kbd-color`: Keyboard key text

**Spacing:**

- `--incant-spacing-1`: 0.25rem
- `--incant-spacing-2`: 0.5rem
- `--incant-spacing-3`: 0.75rem
- `--incant-spacing-4`: 1rem
- `--incant-spacing-6`: 1.5rem

**Typography:**

- `--incant-font-size-xs`: 0.75rem
- `--incant-font-size-sm`: 0.875rem
- `--incant-font-size-lg`: 1.125rem

**Border Radius:**

- `--incant-radius-sm`: 0.25rem
- `--incant-radius-md`: 0.375rem
- `--incant-radius-lg`: 0.5rem

**Shadows:**

- `--incant-shadow-xs`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `--incant-shadow-lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

## Troubleshooting

### Peer dependency errors

If you see errors about missing peer dependencies, ensure you have the required packages installed:

```bash
# Check if peer dependencies are installed
bun list | grep -E "(bits-ui|runed|@lucide/svelte)"

# If missing, install them manually
bun add bits-ui runed @lucide/svelte
```

### Styles are missing

If components appear unstyled:

1. **Check CSS imports**: Make sure you have a CSS file that includes your styles.
2. **CSS variables**: The package relies on CSS custom properties. Make sure you're not overriding them unintentionally.
3. **Build your project**: Sometimes you need to restart your development server for changes to take effect.

---

## Migration from v0.1.x

**v0.2.0 introduced a major change**: The library no longer requires Tailwind CSS and now uses CSS custom properties for styling. This makes the library more lightweight and framework-agnostic.

### What changed:

- **Removed dependency** on Tailwind CSS and shadcn-svelte
- **Replaced with** CSS custom properties for all styling
- **Improved compatibility** with any CSS framework or plain CSS

### If you're upgrading from v0.1.x:

1. **No code changes needed** - your components and shortcuts will work the same
2. **Optional**: If you want to customize appearance, use the CSS variables shown in the [Customization](#customization) section
3. **Optional**: Remove any Tailwind-specific configurations that were only needed for this library

The API remains identical, so existing code will continue to work without modification.
