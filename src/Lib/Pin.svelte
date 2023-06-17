<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { Global } from '../Lib/globals';

	//Base Credit to https://svelte.dev/repl/7d674cc78a3a44beb2c5a9381c7eb1a9?version=3.29.7
	export let Modified = false;

	//The Bind values as they are set from externally and set to after operations
	export let trueLeft = 100;
	export let trueTop = 100;
	export let name: string;

	export let hue: number = 0;

	const duration = 400;

	//The transitioned values used for animation and actual positioning
	let left = tweened(trueLeft, {
		duration,
		easing: cubicInOut
	});
	let top = tweened(trueTop, {
		duration,
		easing: cubicInOut
	});

	//the fake values that store the location virtually
	let fakeLeft = trueLeft;
	let fakeTop = trueTop;

	$: trueLeft, externalPositionChange();
	$: trueTop, externalPositionChange();

	export let width = 100;
	export let height = 100;

	let moving = false;

	function onMouseDown() {
		moving = true;
	}

	function onMouseMove(e: MouseEvent) {
		if (moving) {
			fakeLeft += e.movementX;
			fakeTop += e.movementY;

			left.set(fakeLeft, { duration: 1 });
			top.set(fakeTop, { duration: 1 });
		}
	}

	function onMouseUp() {
		if (fakeLeft == trueLeft && fakeTop == trueTop) {
			return;
		}

		Modified = true;
		moving = false;
		trueLeft = fakeLeft;
		trueTop = fakeTop;
	}

	function externalPositionChange() {
		//left = trueLeft;
		left.set(trueLeft);
		fakeLeft = trueLeft;
		//top = trueTop;
		top.set(trueTop);
		fakeTop = trueTop;
	}
</script>

<section on:mousedown={onMouseDown} style="left: {$left}px; top: {$top}px;" class="draggable">
	<div class="Container">
		<div class="PlayerName">
			<span>{name}</span>
			{#if $Global.DevTools}
				<span>left: {$left} Top: {$top}</span>
			{/if}
		</div>
		<img
			draggable="false"
			src="Pin.png"
			alt="Hek no pin"
			style="width: {width}px; height: {height}px; filter: hue-rotate({hue}deg)"
		/>
	</div>
</section>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<style>
	* {
		box-sizing: border-box;
	}
	.PlayerName {
		top: -100%;
		left: 50%;
		transform: translateX(-50%);
		position: absolute;
		text-align: center;
		color: white;
		background-color: gray;
		border-radius: 1em;
		opacity: 0;
		transition: 400ms;
		padding: 0.5em;
		font-size: 0.8em;
		z-index: -1;
	}

	section:hover .PlayerName {
		opacity: 1;
		z-index: 999;
	}

	.Container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.draggable {
		user-select: none;
		cursor: move;
		border: dotted 3px rgba(0, 0, 0, 0.25);
		position: absolute;
	}

	img {
		width: 100%;
		height: 100%;
	}
</style>
