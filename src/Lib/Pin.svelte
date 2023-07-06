<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { Global } from '../Lib/globals';
	import { playerIDStore } from '../Lib/PlayerID';
	import { Store } from './StoreCollection';

	//Base Credit to https://svelte.dev/repl/7d674cc78a3a44beb2c5a9381c7eb1a9?version=3.29.7
	export let Modified = false;

	//The Bind values as they are set from externally and set to after operations
	export let trueLeft = 100;
	export let trueTop = 100;
	export let name: string;

	console.log('Pin Created');

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
	export let PinOwner: number;
	let moving = false;

	let isDM = false;
	Global.DMTools.subscribe((DM) => {
		isDM = DM;
	});

	let devTools = false;
	Global.DevTools.subscribe((IsDev) => {
		devTools = IsDev;
	});

	function onMouseDown() {
		if (PinOwner == $playerIDStore || isDM) {
			moving = true;
		} else {
			Store.Alert.set({
				BroadCast: false,
				duration: 800,
				Message: 'Thats not your pin',
				Color: 'red',
				TextColor: '#ffffff'
			});
		}
	}

	function onDragStart(e: TouchEvent) {
		if (PinOwner != $playerIDStore && !isDM) {
			moving = true;
			e.preventDefault();
		} else {
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (moving) {
			if (e.movementX == undefined) {
				fakeLeft = e.pageX;
				fakeTop = e.pageY;

				left.set(fakeLeft, { duration: 5000 });
				top.set(fakeTop, { duration: 5000 });

				return;
			} else {
				fakeLeft += e.movementX;
				fakeTop += e.movementY;
			}

			left.set(fakeLeft, { duration: 1 });
			top.set(fakeTop, { duration: 1 });
		}
	}

	let dragEndTimeout: any;
	function onDragMove(e: TouchEvent) {
		if (moving) {
			left.set(e.touches[0].pageX, { duration: 1 });
			top.set(e.touches[0].pageY, { duration: 1 });
			if (dragEndTimeout != undefined) {
				clearTimeout(dragEndTimeout);
			}
			dragEndTimeout = setTimeout(() => {
				trueLeft = e.touches[0].pageX;
				trueTop = e.touches[0].pageY;
				Modified = true;
				moving = false;
			}, 1000);
		}
	}

	function onMouseUp() {
		moving = false;
		if (fakeLeft == trueLeft && fakeTop == trueTop) {
			return;
		}

		Modified = true;
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

<section
	on:mousedown={onMouseDown}
	on:touchstart={onDragStart}
	on:touchmove={onDragMove}
	style="left: {$left}px; top: {$top}px;
	z-index: {PinOwner == $playerIDStore || isDM ? 5000 : 1000}
	"
	class="draggable"
>
	<div class="Container">
		<div class="PlayerName">
			<span>{name}</span>
			{#if devTools}
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
