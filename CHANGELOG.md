# Changelog

## [0.9.0] - 2026-07-27

- feat: Delegate the hotkey engine to `@tanstack/svelte-hotkeys`, replacing incant's hand-rolled registry, chord matcher and held-key tracker
- feat: Add `revealModifier` prop to `Palette` (`'Alt'` default) to choose the hold-to-reveal modifier
- feat: Style the hold-to-reveal outline with `--incant-outline-*` custom properties instead of inline styles, so it no longer overrides an author outline
- fix: Chord progress now drains and hides on timeout
- fix: Remove the unbounded module-level attachment cache that let two elements with identical config clobber each other
- perf: Toggling a shortcut updates the registration in place instead of re-registering, so palette rows no longer reorder
- breaking: `@tanstack/hotkeys` and `@tanstack/svelte-hotkeys` are now peer dependencies — install both so your app and incant share one registry
- breaking: Require Svelte `^5.42.0` (the TanStack Svelte adapter uses `createContext`)
- breaking: `shortcuts` is now `{ current: IncantShortcut[] }` in registration order, covering shortcuts and chords, instead of a keyed record
- feat: `keys` on `Shortcut`, `Focus` and `shortcut()` is now TanStack's `RegisterableHotkey`, so valid combos autocomplete and a typo like `keys="Comtrol+S"` is a compile error instead of a shortcut that never fires
- feat: `Chord` accepts `steps={['Mod+K', 'B']}` — a `Hotkey[]` with per-step autocomplete; the `"Mod+K B"` string form still works
- breaking: Remove `chordRegistry`, `chords` and `get_current_progress`; add `IncantShortcut`, `ShortcutConfig`, `CanonicalModifier`, `RawHotkey`, `RegisterableHotkey`, `HotkeySequence` and `SequenceInput`
- breaking: Remove `add_shortcut`, `remove_shortcut`, `toggle_shortcut`, `isShortcutEnabled`, `add_chord`, `remove_chord`, `toggle_chord`, `isChordEnabled`, `getIsMac`, `getKeyLabel` and `keyToSymbol` — register through the components or the `shortcut()` attachment
- breaking: Shortcuts no longer call `preventDefault`/`stopPropagation` by default; opt in per shortcut or app-wide via `preventDefault` on `Palette`
- breaking: A held key fires its shortcut once instead of auto-repeating; release the keys to fire again
- fix: Shortcuts and chords without `Ctrl`/`Meta`/`Alt` no longer fire while typing in an input (a capital letter is `Shift+key`), and the ignore happens before `preventDefault` so the keystroke still types
- breaking: Remove the `HotkeyInput` type; use `RegisterableHotkey` (pass a `RawHotkey` object for hotkeys built at runtime)
- feat: Add `showRebinding` prop to `Palette` — users can record a replacement combo per shortcut (`Esc` cancels, `Backspace` restores the default); overrides are in-memory, keyed by the declared combo
- feat: Export `rebind(declared, steps)` so apps can persist and restore user overrides themselves
- feat: Add app-wide `sequenceTimeout` and `preventDefault` defaults to `Palette`, honoured by components and the `shortcut()` attachment alike
- feat: `shortcut()` derives the hotkey from the element's text (or its `<label>`) when `keys` is omitted; the modifier prefix is configurable via `deriveModifier` on `Palette`
- fix: A shortcut that focuses a text field no longer lets its own triggering keystroke get typed into that field
- docs: Canonicalise every example to checked casing (`Control+S`, not `control+s`)
- breaking: Drop the undocumented `enabled` input on shortcuts and chords; enable/disable is the palette's toggle only

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
