<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	data-slot="dialog-title"
	class={['incant-dialog-title', className]}
	{...restProps}
/>

<style>
	:global([data-slot='dialog-title']) {
		font-size: var(--incant-font-size-lg, 1.125rem);
		line-height: 1;
		font-weight: 600;
	}
</style>
