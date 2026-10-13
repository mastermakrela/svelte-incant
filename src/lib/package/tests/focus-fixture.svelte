<script lang="ts">
	import Focus from '../focus.svelte';

	let { onAncestorClick, onChildClick }: { onAncestorClick: () => void; onChildClick: () => void } =
		$props();
</script>

<div onclick={onAncestorClick} role="presentation">
	<Focus keys="Control+Y" description="Fixture">
		<button onclick={onChildClick}>Go</button>
	</Focus>
</div>
