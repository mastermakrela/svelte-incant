import { normalizeHotkey, type Hotkey } from '@tanstack/hotkeys';
import { mount, unmount, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import OverlayComponent from './overlay-component.svelte';
import { add_shortcut, remove_shortcut, shortcuts, type Shortcut } from './palette.svelte.js';
import { subscribePressedKeys } from './pressed-keys.svelte.js';

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

type ShortcutInput = Omit<Shortcut, 'action' | 'keys'> & {
	keys: Hotkey;
	action?: (keys: string[]) => void;
	click?: boolean;
	preventDefault?: boolean;
};

type ShortcutAttachmentRecord = {
	config: ShortcutInput;
	attachment: Attachment<HTMLElement>;
};

const shortcutAttachmentCache: Record<string, ShortcutAttachmentRecord> = {};

function shortcutCacheKey(shortcut: ShortcutInput): string {
	const normalizedKeys = normalizeHotkey(shortcut.keys);
	return JSON.stringify({
		keys: normalizedKeys,
		description: shortcut.description ?? '',
		click: shortcut.click !== false,
		preventDefault: shortcut.preventDefault ?? false
	});
}

function setupAnchor(
	element: HTMLElement,
	targetNode: HTMLElement,
	isVoidElement: boolean,
	keys: Hotkey
): { anchor: HTMLDivElement; instance: Record<string, unknown> } {
	const anchor = document.createElement('div');
	anchor.style.pointerEvents = 'none';

	if (isVoidElement) {
		anchor.style.position = 'absolute';
		anchor.style.left = `${element.offsetLeft}px`;
		anchor.style.top = `${element.offsetTop}px`;
		anchor.style.width = `${element.offsetWidth}px`;
		anchor.style.height = `${element.offsetHeight}px`;
	} else {
		const style = window.getComputedStyle(element);
		if (style.position === 'static') {
			element.style.position = 'relative';
		}
		anchor.style.position = 'absolute';
		anchor.style.top = '0';
		anchor.style.left = '0';
		anchor.style.width = '100%';
		anchor.style.height = '100%';
	}

	const instance = mount(OverlayComponent, {
		target: anchor,
		props: { keys }
	}) as Record<string, unknown>;

	targetNode.appendChild(anchor);

	return { anchor, instance };
}

function setupOutline(element: HTMLElement, keys: Hotkey): () => void {
	element.style.transition = 'outline 0s, outline-offset 0s';

	const slug = normalizeHotkey(keys);
	let latestPressedKeys: string[] = [];

	const updateOutline = () => {
		const altPressed = latestPressedKeys.includes('alt');
		const isEnabled = untrack(() => shortcuts[slug]?.enabled ?? true);

		if (altPressed && isEnabled) {
			element.style.outline = '2px dotted #878787';
			element.style.outlineOffset = '2px';
		} else {
			element.style.outline = '';
			element.style.outlineOffset = '';
		}
	};

	const unsubscribePressedKeys = subscribePressedKeys((pressedKeys) => {
		latestPressedKeys = pressedKeys;
		updateOutline();
	});

	return () => {
		element.style.outline = '';
		element.style.outlineOffset = '';
		unsubscribePressedKeys();
	};
}

export function shortcut(shortcut: ShortcutInput): Attachment<HTMLElement> {
	const cacheKey = shortcutCacheKey(shortcut);
	const cached = shortcutAttachmentCache[cacheKey];
	if (cached) {
		cached.config = shortcut;
		return cached.attachment;
	}

	const record: ShortcutAttachmentRecord = {
		config: shortcut,
		attachment: () => {}
	};

	const attachment: Attachment<HTMLElement> = (element) => {
		const current = record.config;
		const shortcutKeys = current.keys;
		const action = (keys: string[]) => {
			const latest = record.config;
			element.focus();
			if (latest.click !== false) {
				element.click();
			}
			latest.action?.(keys);
		};

		untrack(() => {
			add_shortcut({
				...current,
				action
			});
		});

		let targetNode: HTMLElement | null = element;
		const tagName = element.tagName.toLowerCase();
		const isVoidElement = voidElements.has(tagName);

		if (isVoidElement) {
			targetNode = element.parentElement;
		}

		if (!targetNode) {
			untrack(() => {
				remove_shortcut(shortcutKeys);
			});
			return () => {};
		}

		const { anchor, instance } = setupAnchor(element, targetNode, isVoidElement, shortcutKeys);
		const cleanupOutline = setupOutline(element, shortcutKeys);

		return () => {
			cleanupOutline();
			unmount(instance);
			anchor.remove();
			untrack(() => {
				remove_shortcut(shortcutKeys);
			});
		};
	};

	record.attachment = attachment;
	shortcutAttachmentCache[cacheKey] = record;
	return attachment;
}
