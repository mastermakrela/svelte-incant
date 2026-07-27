<script lang="ts">
	/** Remaining fraction of the chord timeout, 1 → full ring, 0 → empty. */
	let { progress }: { progress: number } = $props();
</script>

<svg class="incant-circular-progress" viewBox="0 0 24 24">
	<circle class="bg" cx="12" cy="12" r="10" />
	<circle class="fg" cx="12" cy="12" r="10" style:stroke-dashoffset={63 * (1 - progress)} />
</svg>

<style>
	.incant-circular-progress {
		width: 1em;
		height: 1em;
		transform: rotate(-90deg);
	}
	circle {
		fill: none;
		stroke-width: 4;
	}
	.bg {
		stroke: currentColor;
		opacity: 0.2;
	}
	.fg {
		stroke: currentColor;
		stroke-dasharray: 63;
		stroke-linecap: round;
	}
</style>
