<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let { ref = $bindable(null), ...restProps }: DialogPrimitive.CloseProps = $props();
</script>

<DialogPrimitive.Close
	bind:ref
	data-slot="dialog-close"
	class={['incant-dialog-close-button', restProps.class]}
	{...restProps}
/>

<style>
	:global([data-slot='dialog-close']) {
		border-radius: var(--incant-radius-sm, 0.25rem);
		background: transparent;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	:global([data-slot='dialog-close']:hover) {
		opacity: 0.8;
	}

	:global([data-slot='dialog-close']:focus) {
		outline: 2px solid var(--incant-colors-ring, hsl(240 5.9% 10%));
		outline-offset: 2px;
	}
</style>
