<script lang="ts">
	import Pin from '../Lib/Pin.svelte';
	import type { PinData } from '../Lib/Pin';
	import type { UnknownMsg } from '../Lib/messagesFormat';
	import { onMount } from 'svelte';
	import { MessageTypes } from '../Lib/messageTypes';
	import { Global } from '../Lib/globals';

	let DMTools = false;
	let DevTools = false;
	Global.subscribe((Global) => {
		DMTools = Global.DMTools;
		DevTools = Global.DevTools;
	});

	$: DMTools, DevTools, updateGlobal();

	let pinWidth = 100;
	let pinHeight = 100;

	let playerName = 'Unknown Player';

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
					globalPinCounter =
						data.PinDataList.reduce((previous, current) => {
							if (current.ID > previous) {
								return current.ID;
							} else {
								return previous;
							}
						}, 0) + 1;
					break;
				case MessageTypes.PinMoved:
					let ChangedPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

					if (ChangedPin == -1) {
						PinList.push(data.PinData);
						PinList = PinList;
						globalPinCounter =
							PinList.reduce((previous, current) => {
								if (current.ID > previous) {
									return current.ID;
								} else {
									return previous;
								}
							}, 0) + 1;
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

		//console.log(ModifiedPins);

		ModifiedPins.forEach((item) => {
			item.Modified = false;

			let msg = {
				MsgType: MessageTypes.PinMoved,
				PinData: item,
				Changer: playerName
			};

			ws.send(JSON.stringify(msg));
		});
	}

	function AddPin() {
		PinList.push(PinFactory(playerName, 300, 300));
		PinList = PinList;
		DumpMovedPins();
	}

	function updateGlobal() {
		Global.set({ DevTools, DMTools });
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
				bind:name={PinData.Name}
				width={pinWidth}
				height={pinHeight}
			/>
		{/each}
	</div>

	<div class="ToolBar">
		<button
			on:click={() => {
				DMTools = !DMTools;
			}}>Toggle DM Tools</button
		>

		<input type="text" bind:value={playerName} />
		<button on:click={AddPin}>Add Pin</button>

		{#if DMTools}
			<button
				on:click={() => {
					DevTools = !DevTools;
				}}>Toggle Dev Tools</button
			>
			<p>You are player {playerID}</p>

			{#if DevTools}
				<dir>
					{JSON.stringify(PinList, null, 2)}
				</dir>
			{/if}
		{/if}
	</div>
</main>

<style>
	.ToolBar {
		position: absolute;
		top: 0.25em;
		left: 0.25em;
		background-color: rgba(255, 255, 255);
		opacity: 0.4;
		transition: 400ms;
		border-radius: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.ToolBar:hover {
		opacity: 1;
	}

	.Content {
		position: relative;
		width: max-content;
		height: max-content;
	}
</style>
