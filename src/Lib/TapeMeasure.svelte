<script lang="ts">
	import { Alert } from './Alert';
	import { Global } from './globals';
	import * as MessageFormats from './MessageTypes';

	/** Number of pixels that comprise a unit square. */
	export let UnitWidth: number;
	export let Enabled: boolean;
	export let UnitMult: number;
	let startingPoint: Array<number> = [];
	let endingPoint: Array<number> = [];

	let Socket: WebSocket;
	Global.WebSocketConnection.subscribe((Sock) => {
		Socket = Sock;
	});

	Global.TapeMeasureValues.subscribe((values) => {
		startingPoint = [values.StartX, values.StartY];
		endingPoint = [values.EndX, values.EndY];
	});

	function OnTapeStart(e: MouseEvent) {
		startingPoint = [e.clientX, e.clientY];
	}

	function OnTapeEnd(e: MouseEvent) {
		endingPoint = [e.clientX, e.clientY];
		Alert.set({
			BroadCast: true,
			duration: 2000,
			Message: `Distance Measured as ${CalculateDistance()} feet`,
			Color: 'green',
			TextColor: 'white'
		});

		let msg: MessageFormats.TapeMeasureMoved = {
			MsgType: MessageFormats.MessageTypes.TapeMeasureMoved,
			TapeMeasurePositions: {
				StartX: startingPoint[0],
				StartY: startingPoint[1],
				EndX: endingPoint[0],
				EndY: endingPoint[1]
			}
		};

		Socket.send(JSON.stringify(msg));
	}

	function CalculateDistance() {
		let x = endingPoint[0] - startingPoint[0];
		let y = endingPoint[1] - startingPoint[1];

		let calc = x * x + y * y;

		let distInPx = Math.sqrt(calc);

		return Math.floor(distInPx / UnitWidth) * UnitMult;
	}
</script>

<div class="Container" on:mousedown={OnTapeStart} on:mouseup={OnTapeEnd}>
	{#if Enabled}
		<div
			class="Start Point"
			style="width: {UnitWidth}px; top: {startingPoint[1]}px; left: {startingPoint[0]}px;"
		>
			<span>Start</span>
		</div>
		<div
			class="End Point"
			style="width: {UnitWidth}px; top: {endingPoint[1]}px; left: {endingPoint[0]}px;"
		>
			<span>End</span>
		</div>
	{/if}
</div>

<style>
	.Container {
		height: 100vh;
		width: 100vw;
	}
	.Point {
		display: flex;
		justify-content: center;
		align-items: center;
		aspect-ratio: 1/1;
		position: absolute;
		background-color: hsla(0, 65%, 52%, 0.527);
		color: white;
		transform: translate(-50%, -50%);
		border-radius: 0.5em;
		pointer-events: none;
	}
</style>
