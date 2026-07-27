import {
	getHotkeyManager,
	normalizeHotkey,
	normalizeRegisterableHotkey,
	type Hotkey,
	type RegisterableHotkey
} from '@tanstack/svelte-hotkeys';
import { mount, unmount, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { toHotkeyTokens } from './hotkey-utils.js';
import OverlayComponent from './overlay-component.svelte';
import {
	dynamicHotkeyOptions,
	effectiveHotkey,
	hotkeyOptions,
	incantConfig,
	isRevealed,
	isSequencePrefix,
	isTypingElement
} from './palette.svelte.js';

const voidElements = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]);

export type ShortcutConfig = {
	/**
	 * A checked hotkey string (`'Mod+Shift+S'`) or a `RawHotkey` object built at runtime.
	 * Omit it to derive the key from the element's own text — see {@link deriveHotkey}.
	 */
	keys?: RegisterableHotkey;
	description?: string;
	action?: (keys: string[]) => void;
	/** Click the element when the shortcut fires, on top of focusing it. Defaults to `true`. */
	click?: boolean;
	/** Defaults to the app-wide `preventDefault` set on `<Palette />`. */
	preventDefault?: boolean;
};

const warnedAbout = new WeakSet<Element>();

/**
 * The text a key can be derived from. An `<input>` has none of its own, so its
 * `<label>` stands in.
 */
function labelText(element: HTMLElement): string {
	if (element instanceof HTMLInputElement) {
		return Array.from(element.labels ?? [], (label) => label.textContent).join(' ');
	}
	return element.textContent ?? '';
}

/**
 * The first alphanumeric character of the element's text, prefixed with
 * `incantConfig.deriveModifier`, so `<button {@attach shortcut()}>Bookmark</button>` binds
 * `Control+B`. A bare letter would fire on ordinary typing and collide with everything, so
 * the modifier is on by default; set `deriveModifier={null}` on `<Palette />` for bare keys.
 * Collisions are left to TanStack's `conflictBehavior`, which warns about them.
 */
function deriveHotkey(element: HTMLElement): Hotkey | null {
	const char = labelText(element).match(/[a-z0-9]/i)?.[0];
	if (char) {
		const modifier = incantConfig.deriveModifier;
		const key = char.toUpperCase();
		return normalizeHotkey(modifier ? `${modifier}+${key}` : key);
	}

	if (!warnedAbout.has(element)) {
		warnedAbout.add(element);
		console.warn('[incant] shortcut(): no `keys`, and no text to derive one from', element);
	}
	return null;
}

/** Absolutely positioned host for the hold-to-reveal badge. */
function createAnchor(element: HTMLElement, isVoidElement: boolean): HTMLDivElement {
	const anchor = document.createElement('div');
	anchor.style.pointerEvents = 'none';
	anchor.style.position = 'absolute';

	if (isVoidElement) {
		anchor.style.left = `${element.offsetLeft}px`;
		anchor.style.top = `${element.offsetTop}px`;
		anchor.style.width = `${element.offsetWidth}px`;
		anchor.style.height = `${element.offsetHeight}px`;
	} else {
		if (window.getComputedStyle(element).position === 'static') {
			element.style.position = 'relative';
		}
		anchor.style.top = '0';
		anchor.style.left = '0';
		anchor.style.width = '100%';
		anchor.style.height = '100%';
	}

	return anchor;
}

/**
 * Registers a global shortcut that focuses (and by default clicks) the element it is
 * attached to, and shows the hold-to-reveal outline + badge for it.
 */
export function shortcut(config: ShortcutConfig = {}): Attachment<HTMLElement> {
	return (element) => {
		// The *declared* combo. Every user preference — enabled, rebound-to — is keyed by
		// it, so it must not change when the shortcut is rebound.
		const declared = config.keys ? normalizeRegisterableHotkey(config.keys) : deriveHotkey(element);
		if (!declared) return;

		// NOTE: deliberately NOT `createHotkeyAttachment`. That registers with
		// `target: element`, so the shortcut would only fire once the element already
		// has focus. incant's shortcuts are global, so register against `document`.
		$effect(() => {
			const hotkey = effectiveHotkey(declared);
			const handle = getHotkeyManager().register(
				hotkey,
				(event) => {
					if (isSequencePrefix(hotkey)) return;

					element.focus();
					if (config.click !== false) element.click();
					config.action?.(toHotkeyTokens(hotkey));

					// If the shortcut moved focus into a text field (the element itself, or a
					// field inside it, as with `<Focus>`), the very keystroke that triggered it
					// would carry on to its default action and get typed into that field.
					if (isTypingElement(element.ownerDocument.activeElement)) event.preventDefault();
				},
				untrack(() => hotkeyOptions(declared, config.description, config.preventDefault, hotkey))
			);

			// Toggling from the palette must not re-register: that would move the row to
			// the end of the (insertion-ordered) registry. Same for the app-wide defaults.
			$effect(() => {
				handle.setOptions(dynamicHotkeyOptions(declared, config.preventDefault));
			});

			return () => handle.unregister();
		});

		const isVoidElement = voidElements.has(element.tagName.toLowerCase());
		const host = isVoidElement ? element.parentElement : element;
		if (!host) return;

		const anchor = createAnchor(element, isVoidElement);
		const overlay = mount(OverlayComponent, { target: anchor, props: { declared } });
		host.appendChild(anchor);

		$effect(() => {
			element.classList.toggle('incant-revealed', isRevealed(declared));
		});

		return () => {
			element.classList.remove('incant-revealed');
			unmount(overlay);
			anchor.remove();
		};
	};
}
