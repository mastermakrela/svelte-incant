import { mount, unmount } from 'svelte';
import { add_shortcut, remove_shortcut, type Shortcut } from './palette.svelte.js';
import OverlayComponent, { type OverlayComponentProps } from '$lib/overlay-component.svelte';
import { PressedKeys, watch } from 'runed';
import type { Attachment } from 'svelte/attachments';

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

export function attach_shortcut(
	shortcut: Omit<Shortcut, 'action'> & { action?: () => void }
): Attachment<HTMLElement> {
	return (element) => {
		const action = () => {
			element.focus();
			shortcut.action?.();
		};
		const s: Shortcut = { ...shortcut, action };

		add_shortcut(s);

		// Create overlay container (anchor)
		const anchor = document.createElement('div');
		anchor.style.pointerEvents = 'none'; // Pass through clicks

		let targetNode: HTMLElement | null = element;
		const tagName = element.tagName.toLowerCase();

		if (voidElements.has(tagName)) {
			// Cannot append to void element, append to parent
			targetNode = element.parentElement;
			if (targetNode) {
				anchor.style.position = 'absolute';
				anchor.style.left = `${element.offsetLeft}px`;
				anchor.style.top = `${element.offsetTop}px`;
				anchor.style.width = `${element.offsetWidth}px`;
				anchor.style.height = `${element.offsetHeight}px`;
			}
		} else {
			// Append to element itself
			// Ensure element is positioned so anchor (absolute) is relative to it
			const style = window.getComputedStyle(element);
			if (style.position === 'static') {
				element.style.position = 'relative';
			}

			// Anchor fills the element
			anchor.style.position = 'absolute';
			anchor.style.top = '0';
			anchor.style.left = '0';
			anchor.style.width = '100%';
			anchor.style.height = '100%';
		}

		let instance: Record<string, unknown>;

		if (targetNode) {
			// Mount the component to the anchor
			instance = mount<OverlayComponentProps, Record<string, unknown>>(OverlayComponent, {
				target: anchor,
				props: {
					keys: shortcut.keys
				}
			});

			targetNode.appendChild(anchor);
		}

		element.style.transition = 'outline 0s, outline-offset 0s';

		watch(
			() => pressed_keys.has('alt'),
			(value) => {
				if (value) {
					element.style.outline = '2px dotted currentColor';
					element.style.outlineOffset = '2px';
				} else {
					element.style.outline = '';
					element.style.outlineOffset = '';
				}
			}
		);

		return () => {
			if (instance) {
				unmount(instance);
			}
			anchor.remove();
			remove_shortcut(s);
		};
	};
}
