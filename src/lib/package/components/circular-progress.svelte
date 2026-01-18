<script lang="ts">
	import { CHORD_TIMEOUT_MS } from '../chord.svelte.js';

	let { expiresAt }: { expiresAt: number } = $props();

	let progress = $state(1);
	let frame: number;

	function update() {
		const now = Date.now();
		const remaining = Math.max(0, expiresAt - now);
		progress = remaining / CHORD_TIMEOUT_MS;

		if (remaining > 0) {
			frame = requestAnimationFrame(update);
		} else {
			progress = 0;
		}
	}

	$effect(() => {
		update();
		return () => cancelAnimationFrame(frame);
	});
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
