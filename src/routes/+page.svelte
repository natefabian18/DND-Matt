<script lang="ts">
	import Pin from '../Lib/Pin.svelte';
	import type { PinData } from '../Lib/Pin';
	import type { UnknownMsg } from '../Lib/messagesFormat';
	import { onMount } from 'svelte';
	import { MessageTypes } from '../Lib/messageTypes';

	let pinWidth = 100;
	let pinHeight = 100;

	let globalPinCounter = 1;

	function PinFactory(
		name: string = 'DefaultName',
		width: number,
		height: number,
		ID = globalPinCounter++
	) {
		let pin = {
			ID,
			Name: name,
			width: width,
			height: height,
			DumpPin: function () {
				return this;
			},
			Modified: true
		};

		return pin;
	}

	let PinList: Array<PinData> = [];

	$: PinList, DumpMovedPins();

	let playerID = -1;

	let ws: WebSocket;
	onMount(() => {
		let port = 10232;
		let webSocketURL = `ws://${window.location.hostname}:10232`;
		ws = new WebSocket(webSocketURL);

		ws.onmessage = function (msg) {
			let data: UnknownMsg = JSON.parse(msg.data);

			switch (data.MsgType) {
				case MessageTypes.HelloServer:
					data;
					console.warn('Client got hello server message? Panic');
					break;
				case MessageTypes.HelloClient:
					console.log('Client Got Hello Setting Player ID');
					playerID = data.playerID;
					PinList = data.PinDataList;
					break;
				case MessageTypes.PinMoved:
					let ChangedPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

					if (ChangedPin == -1) {
						PinList.push(data.PinData);
						PinList = PinList;
					} else {
						PinList[ChangedPin] = data.PinData;
					}

					break;
				default:
					console.warn('Unknown Message received', data);
					break;
			}
		};
	});

	let mapDimensions = [32, 32];
	let imgUrl = '/map_32x32.png';
	let Map: HTMLImageElement;

	function MapLoaded() {
		let MapWidth = Map.width;
		let MapHeight = Map.height;

		pinWidth = MapWidth / mapDimensions[0];
		pinHeight = MapHeight / mapDimensions[1];
	}

	function DumpMovedPins() {
		let ModifiedPins = PinList.filter((item) => item.Modified);

		ModifiedPins.forEach((item) => {
			item.Modified = false;

			let msg = {
				MsgType: MessageTypes.PinMoved,
				PinData: item
			};

			ws.send(JSON.stringify(msg));
		});
	}

	function AddPin() {
		PinList.push(PinFactory('Nate', 300, 300));
		PinList = PinList;
		DumpMovedPins();
	}
</script>

<main>
	<div class="Content">
		<img
			draggable="false"
			class="MapImage"
			src={imgUrl}
			alt="Oh fuk where is the map?"
			bind:this={Map}
			on:load={MapLoaded}
		/>

		{#each PinList as PinData}
			<Pin
				bind:trueLeft={PinData.width}
				bind:trueTop={PinData.height}
				bind:Modified={PinData.Modified}
				width={pinWidth}
				height={pinHeight}
			/>
		{/each}
	</div>

	<div class="ToolBar">
		<h1>Hello User!</h1>
		<p>You are player {playerID}</p>
		<button on:click={AddPin}>Add Pin</button>
		<dir>
			{JSON.stringify(PinList)}
		</dir>
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
</style>
