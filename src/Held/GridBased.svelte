<script lang="ts">
	const mapX = 32;
	const mapY = 32;

	let Map: HTMLImageElement;

	let pinWidth = 100;

	let increments = [100 / mapX, 100 / mapY];

	let Player1Pos = [3, 1];
	let Player1PositionPercentage = [0, 0];

	console.log('Starting new user');

	let playerID = -1;

	import { onMount } from 'svelte';

	onMount(() => {
		console.log('Loaded');

		const ws = new WebSocket('ws://localhost:8080');

		ws.onopen = function (msg) {
			console.log(msg);
		};

		ws.onmessage = function (msg) {
			console.log(msg);
			let data = JSON.parse(msg.data);
			console.log(data);
			playerID = data.playerID;
		};
	});

	let imgUrl = '/map_32x32.png';

	function snapPin() {
		console.log(Map.width);
		pinWidth = Map.width / mapX;

		increments.forEach((value, index) => {
			Player1PositionPercentage[index] = Player1Pos[index] * increments[index];
		});
	}
</script>

<main>
	<div class="Content">
		<img class="MapImage" src={imgUrl} alt="Oh fuk where is the map?" bind:this={Map} />

		<div
			class="Pin"
			id="Player1"
			style="top: {Player1PositionPercentage[1]}%; left: {Player1PositionPercentage[0]}%;"
		>
			<img src="/Pin.png" alt="Oh fuk no pin" style="width: {pinWidth}px" />
		</div>
	</div>

	<div class="ToolBar">
		<h1>Hello User!</h1>
		<p>You are player {playerID}</p>
		<button on:click={snapPin}>Snap Player to Grid</button>
	</div>
</main>

<style>
	.ToolBar {
		position: absolute;
		top: 0.25em;
		left: 0.25em;
	}

	.Content {
		position: relative;
		width: max-content;
		height: max-content;
	}

	.Pin {
		position: absolute;
	}
</style>
