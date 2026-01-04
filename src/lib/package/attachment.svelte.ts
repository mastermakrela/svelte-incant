import { PressedKeys, watch } from 'runed';
import { mount, unmount } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import OverlayComponent from './overlay-component.svelte';
import {
	add_shortcut,
	remove_shortcut,
	shortcuts,
	slugify,
	type Shortcut
} from './palette.svelte.js';

const pressed_keys = new PressedKeys();

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
	keys: string | string[] | string[][];
	action?: () => void;
};

function setupAnchor(
	element: HTMLElement,
	targetNode: HTMLElement,
	isVoidElement: boolean,
	keys: string | string[] | string[][]
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

function setupOutline(element: HTMLElement, keys: string | string[] | string[][]): void {
	element.style.transition = 'outline 0s, outline-offset 0s';

	const slug = slugify(keys);

	watch(
		() => {
			const altPressed = pressed_keys.has('alt');
			const shortcut = shortcuts[slug];
			const isEnabled = shortcut?.enabled ?? true;
			return altPressed && isEnabled;
		},
		(should_show_outline) => {
			if (should_show_outline) {
				element.style.outline = '2px dotted currentColor';
				element.style.outlineOffset = '2px';
			} else {
				element.style.outline = '';
				element.style.outlineOffset = '';
			}
		}
	);
}

export function shortcut(shortcut: ShortcutInput): Attachment<HTMLElement> {
	return (element) => {
		const action = () => {
			element.focus();
			element.click();
			shortcut.action?.();
		};

		const shortcutData = {
			...shortcut,
			action
		};

		add_shortcut(shortcutData);

		let targetNode: HTMLElement | null = element;
		const tagName = element.tagName.toLowerCase();
		const isVoidElement = voidElements.has(tagName);

		if (isVoidElement) {
			targetNode = element.parentElement;
		}

		if (!targetNode) {
			remove_shortcut(shortcut.keys);
			return () => {};
		}

		const { anchor, instance } = setupAnchor(element, targetNode, isVoidElement, shortcut.keys);
		setupOutline(element, shortcut.keys);

		return () => {
			unmount(instance);
			anchor.remove();
			remove_shortcut(shortcut.keys);
		};
	};
}
