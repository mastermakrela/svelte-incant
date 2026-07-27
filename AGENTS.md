You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

### 5. btca CLI

You can ask questions about the following resources using btca:

```
btca ask -r <resource> -q "<question>"
```

Available resources:

- `svelte` - Svelte documentation (https://github.com/sveltejs/svelte.dev)
- `tailwindcss` - Tailwind CSS documentation (https://github.com/tailwindlabs/tailwindcss.com)
- `runed` - Runed library (https://github.com/svecosystem/runed)
- `bits-ui` - Bits UI component library (https://github.com/huntabyte/bits-ui)
- `tanstack-hotkeys` - TanStack HotKeys (https://github.com/tanstack/hotkeys)

## Project-Specific Guidelines

### Changelog Format

When creating or updating CHANGELOG.md, use the following style:

- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Keep descriptions concise and focused on the what/why, not the how
- Use a simple flat list - standard sections are unnecessary since prefixes make the type clear
- Avoid verbose descriptions - keep entries brief and scannable
- Use present tense ("Add feature" not "Added feature")

## Use svelte correctly

Instead of recreating `bind:this` using `{@attach track_container}`,
use `bind:this={container}`
