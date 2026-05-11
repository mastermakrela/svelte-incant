import { getIsKeyHeld, type RegisterableHotkey } from '@tanstack/svelte-hotkeys';
import { watch } from 'runed';
import { mount, unmount } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import OverlayComponent from './overlay-component.svelte';
import { add_shortcut, isShortcutEnabled, remove_shortcut } from './palette.svelte.js';

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

type ShortcutInput = {
	hotkey: RegisterableHotkey;
	description?: string;
	action?: () => void;
	click?: boolean;
	preventDefault?: boolean;
	enabled?: boolean;
};

function setupAnchor(
	element: HTMLElement,
	targetNode: HTMLElement,
	isVoidElement: boolean,
	hotkey: RegisterableHotkey
): { anchor: HTMLDivElement; instance: ReturnType<typeof mount> } {
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
		props: { hotkey }
	});

	targetNode.appendChild(anchor);

	return { anchor, instance };
}

function setupOutline(element: HTMLElement, hotkey: RegisterableHotkey): void {
	element.style.transition = 'outline 0s, outline-offset 0s';

	const altHeld = getIsKeyHeld('Alt');
	watch(
		() => altHeld.held && isShortcutEnabled(hotkey),
		(should_show_outline) => {
			if (should_show_outline) {
				element.style.outline = '2px dotted #878787';
				element.style.outlineOffset = '2px';
			} else {
				element.style.outline = '';
				element.style.outlineOffset = '';
			}
		}
	);
}

export function shortcut(input: ShortcutInput): Attachment<HTMLElement> {
	return (element) => {
		add_shortcut({
			hotkey: input.hotkey,
			description: input.description,
			preventDefault: input.preventDefault,
			enabled: input.enabled,
			action: () => {
				element.focus();
				if (input.click !== false) {
					element.click();
				}
				input.action?.();
			}
		});

		let targetNode: HTMLElement | null = element;
		const tagName = element.tagName.toLowerCase();
		const isVoidElement = voidElements.has(tagName);

		if (isVoidElement) {
			targetNode = element.parentElement;
		}

		if (!targetNode) {
			remove_shortcut(input.hotkey);
			return () => {};
		}

		const { anchor, instance } = setupAnchor(element, targetNode, isVoidElement, input.hotkey);
		setupOutline(element, input.hotkey);

		return () => {
			unmount(instance);
			anchor.remove();
			remove_shortcut(input.hotkey);
		};
	};
}
