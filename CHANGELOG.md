# Changelog

## [0.8.0] - 2026-05-11

### Breaking

- Public API moved from array notation (`keys: ['meta', 'k']`, `steps: [['meta','k'],['b']]`) to TanStack hotkey strings (`hotkey: 'Mod+K'`, `sequence: ['Mod+K', 'B']`). Cross-platform `Mod` automatically resolves to `Cmd` on macOS, `Ctrl` elsewhere.
- `<Shortcut>` prop `keys` → `hotkey`; `<Chord>` prop `steps` → `sequence`; `<Focus>` prop `keys` → `hotkey`; `shortcut({ keys })` attachment input → `shortcut({ hotkey })`.
- `add_shortcut`, `remove_shortcut`, `toggle_shortcut` signatures changed to take the new string form.
- `add_chord`, `remove_chord`, `toggle_chord` similarly.
- `formatShortcut` callback signature changed to `(hotkey, sequence, isMac) => string`.
- Removed exports: `chordRegistry`, `chords`, `get_current_progress`, `shortcuts` proxy, `normalizeKeys`, `slugify`, `isArrayOfArrays`, `slugifyChord`, `normalizeChordSteps`, `ChordRegistry`, `isChordInput`.
- Removed the `incant-focus-disabled` CSS class from `<Focus>` (the dotted outline is already gated by `isShortcutEnabled`).

### Changed

- Internal hotkey engine replaced with `@tanstack/svelte-hotkeys`. Brings native key-state tracking (`getHeldKeys`, `getIsKeyHeld`), built-in `ignoreInputs` typing-element guard, `preventDefault`, `conflictBehavior`, type-safe hotkey strings, and an introspection API (`getHotkeyRegistrations()`).
- Chords now register as TanStack sequences (`createHotkeySequence`); in-flight chord progress is read directly from `SequenceRegistrationView.matchedStepCount` + `partialMatchLastKeyTime`. Progress UI invalidates correctly at timeout, even without a subsequent keystroke.
- `Palette` palette-open shortcut is registered with `RawHotkey` form `{ key: '?', shift: true }` to match `Shift+/`.
- Chord timeout is configurable per-chord (`add_chord({ ..., timeout })`); `<CircularProgress>` reads the actual timeout instead of hardcoding the default.

### Fixed

- Bug: `<CircularProgress>` denominator was hardcoded to `CHORD_TIMEOUT_MS`, breaking the progress ring for chords with custom timeouts.

### Tooling

- Dropped `eslint` / `typescript-eslint` / `eslint-config-prettier` / `@eslint/compat` / `@eslint/js` / `globals` / `prettier-plugin-organize-imports`.
- Added `oxlint` and `oxfmt` (see `.oxlintrc.json`, `.oxfmtrc.json`).
- Scripts: `format`, `lint`, `lint:fix` now use `oxfmt`/`oxlint` + `prettier` for `*.svelte` only.
- Dependencies bumped to current minor versions (svelte 5.55, bits-ui 2.18, tailwindcss 4.3, vite 7.3.3, vitest 4.1, svelte-kit 2.59, playwright 1.60, etc.).

## [0.7.1] - 2026-03-27

- fix: Bind `Dialog.Root` directly to `paletteState.open` instead of a derived copy to keep two-way sync working
- fix: Remove `/` from default palette shortcut keys (keep only `?`) to avoid conflicts
- fix: Add cleanup teardown in `startListening` effect so `isListening` resets on destroy; warn if listeners are started twice

## [0.7.0] - 2026-02-17

- feat: Add `formatShortcut` prop to `Palette` for custom keyboard shortcut display formatting
- feat: Add `preventDefault` prop to `Shortcut` component
- feat: Add `getKeyLabel()` utility for platform-aware key labels (⌘ on Mac, Win on Windows)

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
