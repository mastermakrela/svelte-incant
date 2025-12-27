import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function keyToSymbol(key: string): string {
	const symbols: Record<string, string> = {
		control: '⌃',
		ctrl: '⌃',
		alt: '⌥',
		option: '⌥',
		shift: '⇧',
		meta: '⌘',
		command: '⌘',
		cmd: '⌘',
		enter: '↵',
		return: '↵',
		backspace: '⌫',
		delete: '⌦',
		escape: '⎋',
		esc: '⎋',
		tab: '⇥',
		space: '␣',
		up: '↑',
		down: '↓',
		left: '←',
		right: '→'
	};

	const lower = key.toLowerCase();
	return symbols[lower] ?? key.toUpperCase();
}

// export const isMac = $derived(browser ? navigator.platform.includes('MAC') : false);
