# Svelte Incant

A keyboard shortcut management library for Svelte 5.

## Installation

### Prerequisites

This package requires **Tailwind CSS 4** and **shadcn-svelte** to be installed and configured in your project.

### Setup

1. **Install and configure Tailwind CSS** (if not already):

   ```bash
   bunx sv add tailwind
   ```

2. **Initialize shadcn-svelte** (if not already):

   ```bash
   bunx shadcn-svelte@latest init
   ```

   Follow the official [shadcn-svelte installation guide](https://shadcn-svelte.com/docs/installation) for detailed instructions.

3. **Install the package** (peer dependencies are installed automatically):

   ```bash
   bun add svelte-incant
   ```

4. **Add @source directive** to your CSS file where Tailwind is configured (e.g., `src/app.css` or similar):

   ```css
   @import 'tailwindcss';

   /* Add this line to include svelte-incant utility classes */
   @source '../../node_modules/svelte-incant/**/*.{svelte,js,ts}';

   /* rest of your styles here */
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

The `@attach` directive focuses the element it attaches to directly, as opposed to the `Focus` component, which wraps children in a `div` and focuses that.

## Features

- **Shortcut Palette**: Press `?` to open the shortcut palette and see all registered shortcuts
- **Route-specific Shortcuts**: Shortcuts only run when their component is mounted, allowing different shortcuts in different routes
- **Focus Management**: Easily manage focus states with keyboard shortcuts
- **Component-based**: Use components or directives to register shortcuts
- **Shadcn-svelte Integration**: Full styling integration with shadcn-svelte components

## Troubleshooting

### Styles are missing or components look unstyled

1. **Check @source directive**: Make sure you added the `@source` directive to your CSS file as shown in the installation steps.

2. **Verify Tailwind 4**: Ensure you're using Tailwind CSS v4, as the `@source` directive is a v4 feature:

   ```bash
   bun list tailwindcss
   ```

3. **Check shadcn-svelte setup**: Make sure shadcn-svelte is properly initialized with all required CSS variables and theme configuration.

4. **Build your project**: Sometimes you need to restart your development server or rebuild your project for changes to take effect.

### Peer dependency errors

If you see errors about missing peer dependencies, ensure you have the required packages installed:

```bash
# Check if peer dependencies are installed
bun list | grep -E "(bits-ui|runed|@lucide/svelte)"

# If missing, install them manually
bun add bits-ui runed @lucide/svelte
```
