<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import xml from 'highlight.js/lib/languages/xml';
	import copy from 'copy-to-clipboard';
	import type { HTMLAttributes } from 'svelte/elements';

	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('xml', xml);

	let codeElement: HTMLElement;

	function escapeHtml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#x27;');
	}

	type Props = {
		autodetect?: boolean;
		language?: string;
		ignoreIllegals?: boolean;
		code?: string;
		setLanguage?: (language: string) => void;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		autodetect = true,
		language = '',
		setLanguage = () => {},
		ignoreIllegals = true,
		code,
		...restProps
	}: Props = $props();

	let copying = $state(0);
	let highlightedCode: string = $state('');

	const cannotDetectLanguage = $derived(!autodetect && !hljs.getLanguage(language));

	const className = $derived(
		cannotDetectLanguage ? '' : `hljs ${language} ${restProps.class ?? ''}`
	);

	$effect(() => {
		if (!code) return;
		if (cannotDetectLanguage) {
			highlightedCode = escapeHtml(code);
		}

		if (autodetect) {
			const result = hljs.highlightAuto(code);
			setLanguage(result.language ?? '');
			highlightedCode = result.value;
		} else {
			const result = hljs.highlight(code, {
				language,
				ignoreIllegals
			});
			highlightedCode = result.value;
		}
	});

	$effect(() => {
		if (codeElement) {
			// eslint-disable-next-line svelte/no-dom-manipulating
			codeElement.innerHTML = highlightedCode;
		}
	});

	function onCopy() {
		if (!code) return;
		copy(code);
		copying++;
		setTimeout(() => {
			copying--;
		}, 2000);
	}
</script>

<div class="outerWrapper">
	<button class="copyButton" onclick={onCopy} aria-label="Copy code">
		{#if copying}
			<div>
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="none"
					shape-rendering="geometricPrecision"
				>
					<path d="M20 6L9 17l-5-5" />
				</svg>
			</div>
		{:else}
			<div>
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="none"
					shape-rendering="geometricPrecision"
				>
					<path
						d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"
					/>
				</svg>
			</div>
		{/if}
	</button>

	<div class="wrapper">
		<div class={`${className} root`}>
			<code bind:this={codeElement}></code>
		</div>
	</div>
</div>

<style>
	:root {
		--gray0: light-dark(#fff, oklch(0.205 0 0));
		--gray1: light-dark(hsl(0, 0%, 99%), oklch(0.185 0 0));
		--gray2: light-dark(hsl(0, 0%, 97.3%), oklch(0.165 0 0));
		--gray3: light-dark(hsl(0, 0%, 95.1%), oklch(1 0 0 / 10%));
		--gray4: light-dark(hsl(0, 0%, 93%), oklch(1 0 0 / 15%));
		--gray12: light-dark(hsl(0, 0%, 9%), oklch(0.985 0 0));
	}

	/*
	 * GitHub syntax theme, both modes in one pass. highlight.js ships `github.css`
	 * and `github-dark.css` as separate files that each hardcode one mode, so
	 * importing either would need the other overridden token by token. The selector
	 * groups are identical between them, so pairing the colours in `light-dark()`
	 * states each group once. `:global` is required: the highlighted markup is
	 * assigned as innerHTML and never passes through the Svelte compiler.
	 */
	:global(.hljs) {
		color: light-dark(#24292e, #c9d1d9);
	}

	:global(
		.hljs-doctag,
		.hljs-keyword,
		.hljs-meta .hljs-keyword,
		.hljs-template-tag,
		.hljs-template-variable,
		.hljs-type,
		.hljs-variable.language_
	) {
		color: light-dark(#d73a49, #ff7b72);
	}

	:global(.hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_) {
		color: light-dark(#6f42c1, #d2a8ff);
	}

	:global(
		.hljs-attr,
		.hljs-attribute,
		.hljs-literal,
		.hljs-meta,
		.hljs-number,
		.hljs-operator,
		.hljs-variable,
		.hljs-selector-attr,
		.hljs-selector-class,
		.hljs-selector-id
	) {
		color: light-dark(#005cc5, #79c0ff);
	}

	:global(.hljs-regexp, .hljs-string, .hljs-meta .hljs-string) {
		color: light-dark(#032f62, #a5d6ff);
	}

	:global(.hljs-built_in, .hljs-symbol) {
		color: light-dark(#e36209, #ffa657);
	}

	:global(.hljs-comment, .hljs-code, .hljs-formula) {
		color: light-dark(#6a737d, #8b949e);
	}

	:global(.hljs-name, .hljs-quote, .hljs-selector-tag, .hljs-selector-pseudo) {
		color: light-dark(#22863a, #7ee787);
	}

	:global(.hljs-subst) {
		color: light-dark(#24292e, #c9d1d9);
	}

	:global(.hljs-section) {
		color: light-dark(#005cc5, #1f6feb);
		font-weight: bold;
	}

	:global(.hljs-bullet) {
		color: light-dark(#735c0f, #f2cc60);
	}

	:global(.hljs-emphasis) {
		color: light-dark(#24292e, #c9d1d9);
		font-style: italic;
	}

	:global(.hljs-strong) {
		color: light-dark(#24292e, #c9d1d9);
		font-weight: bold;
	}

	:global(.hljs-addition) {
		color: light-dark(#22863a, #aff5b4);
		background-color: light-dark(#f0fff4, #033a16);
	}

	:global(.hljs-deletion) {
		color: light-dark(#b31d28, #ffdcd7);
		background-color: light-dark(#ffeef0, #67060c);
	}

	.root {
		padding: 16px;
		margin: 0;
		background: var(--gray1);
		border-radius: 0;
		position: relative;
		line-height: 17px;
		white-space: pre-wrap;
		background: linear-gradient(to top, var(--gray2), var(--gray1) 16px);
	}

	.wrapper {
		overflow: hidden;
		margin: 0;
		position: relative;
		border-radius: 6px;
		margin-top: 16px;
		border: 1px solid var(--gray3);
	}

	.copyButton {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 1;
		width: 26px;
		height: 26px;
		border: 1px solid var(--gray4);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gray0);
		cursor: pointer;
		opacity: 0;
		color: var(--gray12);
		transition:
			background 200ms,
			box-shadow 200ms,
			opacity 200ms;
	}

	.copyButton:hover {
		background: var(--gray1);
	}

	.copyButton:focus-visible {
		box-shadow: 0 0 0 1px var(--gray4);
	}

	.copyButton > div {
		display: flex;
	}

	.outerWrapper {
		position: relative;
	}

	.outerWrapper:hover .copyButton {
		opacity: 1;
	}

	code {
		font-size: 12px;
	}
</style>
