export const prerender = true;

export async function GET() {
	const content = `# Svelte Incant - LLM Documentation

## Package Information
Name: svelte-incant
Version: 0.9.0
Description: A keyboard shortcut management library for Svelte 5
Repository: https://github.com/mastermakrela/svelte-incant
Documentation: https://svelte-incant.mastermakrela.com/
NPM: https://www.npmjs.com/package/svelte-incant

## Quick Overview
Svelte Incant is a modern keyboard shortcut management library designed specifically for Svelte 5. It provides:
- Shortcut Palette component for displaying all registered shortcuts
- Chord component for multi-step key sequences
- Focus management for keyboard navigation
- Route-specific shortcuts that only work when components are mounted
- Directive-based shortcut attachment (@attach)
- CSS custom properties for easy theming
- TypeScript support with full type safety

## Installation
\`\`\`bash
bun add svelte-incant
\`\`\`

## Core Components

### Palette Component
Main component that enables the shortcut overlay and displays all registered shortcuts.

Usage:
\`\`\`svelte
<script>
  import { Palette } from 'svelte-incant';
</script>

<Palette position="bottom-right" showToggles={true} />
\`\`\`

Props:
- position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'none' (default: 'bottom-right')
- showToggles: boolean (default: false) - Show enable/disable toggles for shortcuts
- revealModifier: 'Alt' | 'Control' | 'Shift' | 'Meta' (default: 'Alt') - Modifier the user holds to reveal an outline and a key badge on every element that has a shortcut
- showRebinding: boolean (default: false) - Add a column letting users record a replacement combo per shortcut. Esc cancels, Backspace restores the declared default.
- deriveModifier: 'Control' (default) | 'Alt' | 'Shift' | 'Meta' | null - Modifier prefixed to keys derived from element text when shortcut() is called with no keys; null derives bare keys
- sequenceTimeout: number, ms (default: 1500) - App-wide default for how long a chord waits for its next step
- preventDefault: boolean (default: false) - App-wide default for every shortcut and chord; per-shortcut props still win

sequenceTimeout and preventDefault are honoured by the Shortcut and Chord components and by the
shortcut() attachment alike.

### Rebinding
Overrides are keyed by the combo as declared in markup, so a rebound shortcut keeps its palette
position and its enabled/disabled state, and survives unmount/remount. They are in-memory only and
lost on reload; use the exported rebind() to persist them yourself:

\`\`\`ts
import { rebind } from 'svelte-incant';
rebind('Control+L', ['Control+Y']); // apply an override
rebind('Control+L', []); // clear it
\`\`\`

Rebinding onto an already-registered combo is allowed, not rejected: both shortcuts fire and
TanStack logs a conflict warning.

### Keys derived from element text
Call shortcut() with no keys and the first alphanumeric character of the element's text becomes the
shortcut, prefixed with the deriveModifier ('Control' by default). An <input> has no text of its
own, so its associated <label> is used instead. If nothing can be derived, nothing is registered
and a warning is logged.

\`\`\`svelte
<button {@attach shortcut()}>Duplicate</button>
<!-- binds Control+D -->
\`\`\`

Set deriveModifier={null} on <Palette /> for bare keys — they fire during ordinary typing, so this
is opt-in.

### Focus Component
Manages focus states with keyboard shortcuts.

Usage:
\`\`\`svelte
<script>
  import { Focus } from 'svelte-incant';
</script>

<Focus keys="Control+E" description="Focus search input">
  <input type="text" placeholder="Search..." />
</Focus>
\`\`\`

### Shortcut Component
Registers keyboard shortcuts that trigger actions.

Usage:
\`\`\`svelte
<script>
  import { Shortcut } from 'svelte-incant';
</script>

<Shortcut
  keys="Control+S"
  description="Save document"
  action={() => console.log('Save document')}
/>
\`\`\`

### Chord Component
Registers multi-step sequences. Prefer the array form: every step is typed as a \`Hotkey\`, so it
autocompletes and a typo is a compile error.

Usage:
\`\`\`svelte
<script>
  import { Chord } from 'svelte-incant';
</script>

<Chord
  steps={['Mod+K', 'B']}
  description="Open bookmarks"
  action={() => console.log('Open bookmarks')}
/>

<!-- Space-separated string form: still supported, but a plain string and unchecked -->
<Chord steps="Mod+K B" description="Open bookmarks" action={openBookmarks} />
\`\`\`

### Hotkey Syntax
- Single hotkeys use TanStack's plus notation, e.g. \`Control+S\`, \`Mod+K\`, \`Mod+Shift+S\`
- \`keys\` on \`Shortcut\`, \`Focus\` and \`shortcut()\` is typed as \`RegisterableHotkey\`
  (\`Hotkey | RawHotkey\`): valid combinations autocomplete and \`keys="Comtrol+S"\` is a type error
- Use \`Mod\` for the platform-adaptive modifier (Command on macOS, Control elsewhere)
- For hotkeys only known at runtime (user settings, config), pass a \`RawHotkey\` object instead of a
  string — no cast needed:
  \`\`\`svelte
  <Shortcut keys={{ key: 'S', mod: true, shift: true }} description="Save" action={save} />
  \`\`\`
- Chord sequences are best written as \`Hotkey\` arrays, e.g. \`{['Mod+K', 'B']}\`; the
  space-separated string \`"Mod+K B"\` is also accepted but unchecked

### @attach Directive
Attaches shortcuts directly to elements without wrapper divs.

Usage:
\`\`\`svelte
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
\`\`\`

## Key Features

### Route-Specific Shortcuts
Shortcuts are only active when their component is mounted, allowing different shortcuts in different routes.

### Shortcut Palette
Press '?' to open the shortcut palette and see all registered shortcuts with their descriptions.

### Focus Management
Built-in focus management for accessible keyboard navigation.

### Framework Agnostic Styling
Uses CSS custom properties that work with any CSS framework or plain CSS.

### TypeScript Support
Full TypeScript support with proper type definitions.

## CSS Custom Properties
The library uses CSS custom properties for theming:

\`\`\`css
/* Colors */
--incant-colors-background: hsl(0 0% 100%);
--incant-colors-foreground: hsl(240 10% 3.9%);
--incant-colors-primary: hsl(240 5.9% 10%);
--incant-colors-primary-foreground: hsl(0 0% 98%);
--incant-colors-muted: hsl(240 4.8% 95.9%);
--incant-colors-muted-foreground: hsl(240 3.8% 46.1%);
--incant-colors-border: hsl(240 5.9% 90%);
--incant-colors-overlay: hsla(0 0% 0% / 0.8);

/* Keyboard styling */
--incant-kbd-bg: #1e293b;
--incant-kbd-color: #e2e8f0;

/* Spacing */
--incant-spacing-1: 0.25rem;
--incant-spacing-2: 0.5rem;
--incant-spacing-3: 0.75rem;
--incant-spacing-4: 1rem;
--incant-spacing-6: 1.5rem;

/* Typography */
--incant-font-size-xs: 0.75rem;
--incant-font-size-sm: 0.875rem;
--incant-font-size-lg: 1.125rem;

/* Border radius */
--incant-radius-sm: 0.25rem;
--incant-radius-md: 0.375rem;
--incant-radius-lg: 0.5rem;
\`\`\`

## API Reference

### Exports
- Palette: Component for shortcut overlay
- Focus: Component for focus management
- Shortcut: Component for registering shortcuts
- Chord: Component for sequence shortcuts
- shortcut: Directive for attaching shortcuts
- openPalette / closePalette / togglePalette / paletteState: Programmatic palette control
- rebind: Apply or clear a stored key override
- shortcuts: Reactive read-only view of every registered incant shortcut
- Types: Hotkey, RawHotkey, RegisterableHotkey, HotkeySequence, SequenceInput, SequenceSpec,
  CanonicalModifier, IncantShortcut, ShortcutConfig, PalettePosition

### Peer Dependencies
- svelte: ^5.42.0
- bits-ui: ^2.0.0
- @tanstack/hotkeys: 0.8.0
- @tanstack/svelte-hotkeys: ^0.10.0

## Usage Patterns

### Basic Setup
1. Add Palette component to root layout
2. Register shortcuts throughout your app
3. Users press '?' to see available shortcuts

### Common Patterns
- Use Focus for input fields and search boxes
- Use Shortcut for actions like save, copy, paste
- Use Chord for command-palette style flows (e.g. \`{['Mod+K', 'B']}\`)
- Use @attach for elements that shouldn't be wrapped
- Configure Palette position based on your UI design

## Examples

### Text Editor Shortcuts
\`\`\`svelte
<script>
  import { Palette, Shortcut, Focus } from 'svelte-incant';
</script>

<Palette />

<Shortcut keys="Control+S" description="Save" action={save} />
<Shortcut keys="Control+Z" description="Undo" action={undo} />
<Shortcut keys="Control+Y" description="Redo" action={redo} />

<Focus keys="Control+F" description="Find">
  <input type="text" placeholder="Search..." />
</Focus>
\`\`\`

### Navigation Shortcuts
\`\`\`svelte
<script>
  import { Palette, Focus } from 'svelte-incant';
</script>

<Palette />

<Focus keys="Alt+H" description="Go home">
  <a href="/">Home</a>
</Focus>

<Focus keys="Alt+A" description="Go to about">
  <a href="/about">About</a>
</Focus>
\`\`\`

## Browser Support
- Modern browsers supporting ES modules
- Svelte 5+ required
- CSS custom properties support required for theming

## License
MIT License - https://github.com/mastermakrela/svelte-incant/blob/main/LICENSE

## Contributing
Contributions welcome! Please visit:
https://github.com/mastermakrela/svelte-incant/blob/main/CONTRIBUTING.md

## Support
- Issues: https://github.com/mastermakrela/svelte-incant/issues
- Documentation: https://svelte-incant.mastermakrela.com/
- Demo: https://svelte-incant.mastermakrela.com/

---
Generated on: ${new Date().toISOString()}
Package: svelte-incant v0.9.0
This file is designed to help LLMs understand and use this package effectively.
`;

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
