# Changelog

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
