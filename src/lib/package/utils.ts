export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;
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
		right: '→',
		arrowup: '↑',
		arrowdown: '↓',
		arrowleft: '←',
		arrowright: '→'
	};

	const lower = key.toLowerCase();
	return symbols[lower] ?? key.toUpperCase();
}

export function getKeyLabel(key: string, isMac: boolean): string {
	const macSymbols: Record<string, string> = {
		control: '⌃',
		ctrl: '⌃',
		alt: '⌥',
		option: '⌥',
		shift: '⇧',
		meta: '⌘',
		command: '⌘',
		cmd: '⌘'
	};

	const textLabels: Record<string, string> = {
		control: 'Ctrl',
		ctrl: 'Ctrl',
		alt: 'Alt',
		option: 'Alt',
		shift: 'Shift',
		meta: 'Win',
		command: 'Win',
		cmd: 'Win',
		enter: 'Enter',
		return: 'Enter',
		backspace: 'Backspace',
		delete: 'Delete',
		escape: 'Esc',
		esc: 'Esc',
		tab: 'Tab',
		space: 'Space',
		up: '↑',
		down: '↓',
		left: '←',
		right: '→',
		arrowup: '↑',
		arrowdown: '↓',
		arrowleft: '←',
		arrowright: '→'
	};

	const lower = key.toLowerCase();

	if (isMac && macSymbols[lower]) {
		return macSymbols[lower];
	}

	return textLabels[lower] ?? key.toUpperCase();
}

export function getIsMac(): boolean {
	return typeof navigator !== 'undefined'
		? navigator.platform.toUpperCase().includes('MAC')
		: false;
}
