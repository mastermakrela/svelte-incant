# Changelog

## [0.8.0] - 2026-02-13

- feat: Migrate runtime hotkey engine to `@tanstack/hotkeys`
- feat: Replace custom shortcut/chord DSL with strict TanStack-style specs (breaking)
- feat: Remove `slugify` helper API and use normalized hotkey strings directly (breaking)
- feat: Track chord progress with timeout reset and Escape cancel
- docs: Update examples and package docs to `Control+K` / `Mod+K B` syntax
- test: Rewrite shortcut and chord unit coverage for strict DSL behavior

## [0.7.0] - 2026-02-04

- feat: Replace shortcut and chord definitions with plus-notation key specs (breaking)
- feat: Normalize key specs to `KeyboardEvent.key` tokens with aliases
- chore: Update docs and examples to string-based key specs

## [0.6.2] - 2026-02-04

- feat: Pass matched key combo to shortcut action callback

## [0.6.1] - 2026-02-03

- fix: Dialog max-width changed to `fit-content` to prevent description overflow
- fix: `Shortcut` and `Chord` components now use `$effect` instead of `onMount` for proper reactivity when props change

## [0.6.0] - 2026-02-03

- feat: Add programmatic palette control with `openPalette()`, `closePalette()`, `togglePalette()` functions and `paletteState` reactive object
- feat: Implement shortcut specificity - more specific shortcuts (e.g., `Shift+F`) now take priority over less specific ones (e.g., `F`)
- feat: Add `preventDefault` option to shortcuts for preventing browser default behavior
- fix: Focus hints now stack vertically when space is narrow
- fix: Modifier keys display first in keyboard hints (e.g., `Ctrl+Shift+F` instead of `F+Ctrl+Shift`)

## [0.5.2] - 2026-02-01

- feat: Add CSS variables for z-index customization (`--incant-z-index-trigger`, `--incant-z-index-chord-display`, `--incant-z-index-dialog`, `--incant-z-index-overlay`)

## [0.5.1] - 2026-02-01

- fix: Disable Dialog.Content portal for `Palette` component so dialog renders inline

## [0.5.0] - 2026-01-19

- feat: Add `Chord` component for sequential keyboard shortcuts (e.g. `Cmd+K`, `B`)

## [0.4.1] - 2026-01-05

- chore: Move docs-only dependencies to devDependencies to reduce package install size
- chore: Remove Tailwind CSS, tailwind-animate, and prettier-tailwind plugin from production dependencies

## [0.4.0] - 2026-01-05

- feat: Preserve shortcuts registration order in palette display
- feat: Add optional `showToggles` prop to `Palette` component
- feat: Add full internationalization support for palette dialog
- feat: Add optional `click` property to `Focus` component and `shortcut()` directive
- feat: Export `getIsMac()` and `keyToSymbol()` utilities
- feat: Dynamic key display adapts to user's operating system
- fix: Make focus and attachment behavior consistent
- fix: Improve element selection logic in `Focus` component
