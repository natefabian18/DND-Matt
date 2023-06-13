<script>
	//Base Credit to https://svelte.dev/repl/7d674cc78a3a44beb2c5a9381c7eb1a9?version=3.29.7

	export let left = 100;
	export let top = 100;

	export let width = 100;
	export let height = 100;

	let moving = false;

	function onMouseDown() {
		moving = true;
	}

	function onMouseMove(e) {
		if (moving) {
			left += e.movementX;
			top += e.movementY;
		}
	}

	function onMouseUp() {
		moving = false;
	}
</script>

<section
	on:mousedown={onMouseDown}
	on:touchstart={onMouseDown}
	style="left: {left}px; top: {top}px; width: {width}px; height: {height}px"
	class="draggable"
>
	<img draggable="false" src="/Pin.png" alt="Hek no pin" />
</section>

<svelte:window
	on:mouseup={onMouseUp}
	on:mousemove={onMouseMove}
	on:touchend={onMouseUp}
	on:touchmove={onMouseMove}
/>

<style>
	.draggable {
		user-select: none;
		cursor: move;
		border: solid 1px gray;
		position: absolute;
	}

	img {
		width: 100%;
		height: 100%;
	}
</style>
