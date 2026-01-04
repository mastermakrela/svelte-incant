<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	data-slot="dialog-overlay"
	class={['incant-dialog-overlay', className]}
	{...restProps}
/>

<style>
	:global([data-slot='dialog-overlay']) {
		position: fixed;
		inset: 0;
		z-index: 50;
		background-color: var(--incant-colors-overlay, rgba(0, 0, 0, 0.5));
		animation: dialog-overlay-in 0.2s ease-out;
	}

	:global([data-slot='dialog-overlay'][data-state='closed']) {
		animation: dialog-overlay-out 0.2s ease-out;
	}

	@keyframes dialog-overlay-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes dialog-overlay-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>
