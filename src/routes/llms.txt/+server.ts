export const prerender = true;

export async function GET() {
	const content = `# Svelte Incant - LLM Documentation

## Package Information
Name: svelte-incant
Version: 0.4.0
Description: A keyboard shortcut management library for Svelte 5
Repository: https://github.com/mastermakrela/svelte-incant
Documentation: https://svelte-incant.mastermakrela.com/
NPM: https://www.npmjs.com/package/svelte-incant

## Quick Overview
Svelte Incant is a modern keyboard shortcut management library designed specifically for Svelte 5. It provides:
- Shortcut Palette component for displaying all registered shortcuts
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

### Focus Component
Manages focus states with keyboard shortcuts.

Usage:
\`\`\`svelte
<script>
  import { Focus } from 'svelte-incant';
</script>

<Focus keys={['control', 'e']} description="Focus search input">
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
  keys={['control', 's']}
  description="Save document"
  action={() => console.log('Save document')}
/>
\`\`\`

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
    keys: ['meta', 'i'],
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
- shortcut: Directive for attaching shortcuts
- getIsMac(): Utility function to detect macOS
- keyToSymbol(): Utility function for key symbol conversion

### Peer Dependencies
- svelte: ^5.0.0
- bits-ui: ^2.0.0

## Usage Patterns

### Basic Setup
1. Add Palette component to root layout
2. Register shortcuts throughout your app
3. Users press '?' to see available shortcuts

### Common Patterns
- Use Focus for input fields and search boxes
- Use Shortcut for actions like save, copy, paste
- Use @attach for elements that shouldn't be wrapped
- Configure Palette position based on your UI design

## Examples

### Text Editor Shortcuts
\`\`\`svelte
<script>
  import { Palette, Shortcut, Focus } from 'svelte-incant';
</script>

<Palette />

<Shortcut keys={['control', 's']} description="Save" action={save} />
<Shortcut keys={['control', 'z']} description="Undo" action={undo} />
<Shortcut keys={['control', 'y']} description="Redo" action={redo} />

<Focus keys={['control', 'f']} description="Find">
  <input type="text" placeholder="Search..." />
</Focus>
\`\`\`

### Navigation Shortcuts
\`\`\`svelte
<script>
  import { Palette, Focus } from 'svelte-incant';
</script>

<Palette />

<Focus keys={['alt', 'h']} description="Go home">
  <a href="/">Home</a>
</Focus>

<Focus keys={['alt', 'a']} description="Go to about">
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
Package: svelte-incant v0.4.0
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
