# Svelte Incant

A keyboard shortcut management library for Svelte 5.

## Installation

Install the package:

```bash
bun add svelte-incant
```

Peer dependencies (`svelte`, `bits-ui`, `@tanstack/hotkeys`, `@tanstack/svelte-hotkeys`) will be
installed automatically.

Incant uses [TanStack Hotkeys](https://tanstack.com/hotkeys) as its matching engine. Both TanStack
packages are peer dependencies so that your app and incant share **one** hotkey registry — every
manager is a module-level singleton, so a duplicate install would split registrations in two.
Shortcuts you register directly with TanStack Hotkeys live in that same registry (so conflict
warnings cover both), but the palette lists only the shortcuts registered through incant.

Requires Svelte `^5.42.0` (the TanStack Svelte adapter uses `createContext`).

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

Mount it unconditionally (not behind an `{#if}` or a lazy import): `Palette` carries the app-wide
defaults, and a `shortcut()` attachment that mounts first derives its key against the built-in
defaults instead.

Register keyboard shortcuts with the `Shortcut` component:

```svelte
<script>
	import { Shortcut } from 'svelte-incant';
</script>

<Shortcut
	keys="Control+S"
	description="Save document"
	action={(keys) => console.log('Save document', keys)}
/>
```

The `action` callback receives the matched key combo (`string[]`), which is helpful when multiple combos share one description (e.g., arrow keys for navigation).

### Hotkey syntax

Hotkeys use TanStack's plus notation (`Control+Shift+K`), and `keys` is typed as TanStack's
`RegisterableHotkey`, so your editor autocompletes every valid combination and a typo is a
**compile error** rather than a shortcut that silently never fires:

```svelte
<Shortcut keys="Mod+Shift+S" … />
<!-- <Shortcut keys="Comtrol+S" … />  ← Type error -->
```

Use `Mod` for the platform-adaptive modifier (Command on macOS, Control elsewhere).

If a hotkey is only known at runtime — read from user settings, a config file, a server response —
the string type can't check it. Pass a `RawHotkey` object instead; it is TanStack's escape hatch
and needs no cast:

```svelte
<script lang="ts">
	import type { RawHotkey } from 'svelte-incant';

	let { binding }: { binding: RawHotkey } = $props(); // e.g. { key: 'S', mod: true, shift: true }
</script>

<Shortcut keys={binding} description="Save document" action={save} />
```

For sequential key combinations (chords), use the `Chord` component. Chords are multi-step sequences where you press one combination (e.g., `Mod+K`), then another (e.g., `B`) to activate them.

Pass the steps as an array — each step is checked and autocompleted individually:

```svelte
<script>
	import { Chord } from 'svelte-incant';
</script>

<Chord
	steps={['Mod+K', 'B']}
	description="Open bookmarks"
	action={() => console.log('Open bookmarks')}
/>
```

The space-separated string form is still supported for dynamic sequences, but it is a plain
`string` and gets no checking:

```svelte
<Chord steps="Mod+K B" description="Open bookmarks" action={openBookmarks} />
```

For focusing elements (like inputs), use the `Focus` component:

```svelte
<script>
	import { Focus } from 'svelte-incant';
</script>

<Focus keys="Control+E" description="Focus search input">
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
		keys: 'Meta+I',
		description: 'Focus text input'
	})}
/>
```

The `@attach` directive focuses the element it attaches to directly, as opposed to the `Focus` component, which wraps children in a `div` and focuses that.

## Features

- **Shortcut Palette**: Press `?` to open the shortcut palette and see all registered shortcuts
- **Key Chords**: Support for sequential key combinations (e.g., `Cmd+K` then `B`)
- **Route-specific Shortcuts**: Shortcuts only run when their component is mounted, allowing different shortcuts in different routes
- **Focus Management**: Easily manage focus states with keyboard shortcuts
- **Component-based**: Use components or directives to register shortcuts
- **Framework Agnostic**: Works with any CSS framework or plain CSS using CSS custom properties

## Configuration

The `Palette` component accepts several props for customization:

```svelte
<Palette position="bottom-right" showToggles={true} />
```

### Palette Props

- `position`: Controls where the trigger button appears. Options: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right` (default), or `none` (hides the trigger).
- `showToggles`: Boolean (default `false`). If `true`, adds a column to the palette allowing users to manually enable/disable specific shortcuts.
- `revealModifier`: `'Alt'` (default), `'Control'`, `'Shift'` or `'Meta'`. The modifier the user holds to reveal an outline and a key badge on every element that has a shortcut.
- `showRebinding`: Boolean (default `false`). If `true`, adds a column letting users record a replacement combo for any shortcut. See below.
- `deriveModifier`: `'Control'` (default), `'Alt'`, `'Shift'`, `'Meta'` or `null`. Modifier prefixed to keys derived from element text when `shortcut()` is called with no `keys`. `null` derives bare keys.
- `sequenceTimeout`: Number, milliseconds (default `1500`). App-wide default for how long a chord waits for its next step.
- `preventDefault`: Boolean (default `false`). App-wide default for every shortcut and chord. Individual `Shortcut` / `Chord` / `shortcut()` props still win.

`sequenceTimeout` and `preventDefault` are read by the `Shortcut` and `Chord` components **and** by
the `shortcut()` attachment, so all three behave identically.

### Rebinding shortcuts

With `showRebinding`, each palette row gains a record button. Press any combination to rebind,
`Esc` to cancel, or `Backspace` to restore the shortcut's declared default.

```svelte
<Palette showRebinding={true} />
```

Overrides are keyed by the combo **as declared in your markup**, so a rebound shortcut keeps its
position in the palette and keeps its enabled/disabled state, and the override survives the
component unmounting and remounting.

Three limitations worth knowing:

- **Overrides are in-memory only.** They are lost on reload. `rebind()` is exported, so you can
  persist them yourself:

  ```ts
  import { rebind } from 'svelte-incant';

  rebind('Control+L', ['Control+Y']); // apply a stored override
  rebind('Control+L', []); // clear it, back to the declared default
  ```

- **Rebinding onto a combo that is already taken is allowed, not rejected.** Both shortcuts then
  fire, and TanStack logs a conflict warning to the console. If you need it to be exclusive,
  check against `shortcuts.current` before calling `rebind()`.
- Rebinding a chord records a whole sequence, so every step is replaced at once.

### Keys derived from element text

Call `shortcut()` with no `keys` and the first alphanumeric character of the element's text
becomes the shortcut, prefixed with a modifier:

```svelte
<button {@attach shortcut()}>Duplicate</button>
<!-- binds Control+D -->
```

An `<input>` has no text of its own, so its associated `<label>` is used instead.

The modifier is `Control` by default and is set app-wide with the `deriveModifier` prop on
`<Palette />`. A bare letter would fire during ordinary typing and collide with almost anything,
so it is opt-in:

```svelte
<Palette deriveModifier="Alt" />
<Palette deriveModifier={null} />
<!-- bare keys: B, Q — use with care -->
```

If no character can be derived, nothing is registered and a warning is logged. Derived keys are
still single characters and collide easily — the usual conflict warning applies.

### Styling the hold-to-reveal outline

The outline is a class (`.incant-revealed`), not an inline style, so it no longer overrides an
outline of your own. Tune it with the same CSS custom properties as everything else:

```css
:root {
	--incant-outline-width: 2px;
	--incant-outline-style: dotted;
	--incant-outline-color: #878787;
	--incant-outline-offset: 2px;
}
```

There is deliberately no radius variable: `outline` follows the element's own `border-radius`, so
a project with sharp edges gets sharp outlines for free. Which element carries the outline depends
on the API you use — `Focus` wraps its children in a `div` and outlines that wrapper, so the corner
shape comes from `Focus`'s own `class`, while the `shortcut()` attachment outlines the element it
is attached to:

```svelte
<Focus keys="Control+B" description="Save" class="rounded-none">
	<Button>Save</Button>
</Focus>

<button class="rounded-none" {@attach shortcut({ keys: 'Control+S' })}>Save</button>
```

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
