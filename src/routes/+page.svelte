<script lang="ts">
	import Pin from '../Lib/Pin.svelte';
	import type { PinData } from '../Lib/Pin';
	import type * as MessageFormats from '../Lib/messagesFormat';
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

	let ShowToolbar = true;

	let playerName = '';

	let globalPinCounter = 1;

	function PinFactory(
		name: string = 'DefaultName',
		width: number,
		height: number,
		Hue: number,
		ID = globalPinCounter++
	) {
		let pin: PinData = {
			ID,
			Name: name,
			width: width,
			height: height,
			DumpPin: function () {
				return this;
			},
			Modified: true,
			HueShift: Hue
		};

		return pin;
	}

	let PinList: Array<PinData> = [];

	$: PinList, DumpMovedPins();

	let playerID = -1;

	let DefaultPinHue = 0;

	let ws: WebSocket;
	onMount(() => {
		let port = 10232;
		let webSocketURL = `ws://${window.location.hostname}:10232`;
		ws = new WebSocket(webSocketURL);

		ws.onmessage = function (msg) {
			let data: MessageFormats.UnknownMsg = JSON.parse(msg.data);

			switch (data.MsgType) {
				case MessageTypes.HelloServer:
					{
						console.warn('Client got hello server message? Panic');
					}
					break;
				case MessageTypes.HelloClient:
					{
						console.log('Client Got Hello Setting Player ID');
						playerID = data.playerID;
						PinList = data.PinDataList;
						DefaultPinHue = (playerID - 1) * 40;
						globalPinCounter =
							data.PinDataList.reduce((previous, current) => {
								if (current.ID > previous) {
									return current.ID;
								} else {
									return previous;
								}
							}, 0) + 1;
					}
					break;
				case MessageTypes.PinMoved:
					{
						let info: MessageFormats.PinMoved = data;
						let ChangedPin = PinList.findIndex((item) => item.ID == info.PinData.ID);

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
					}
					break;
				case MessageTypes.PinDeleted:
					{
						let info: MessageFormats.PinDeleted = data;
						let deletedPin = PinList.findIndex((item) => item.ID == info.PinID);

						if (deletedPin == -1) {
							return;
						}

						PinList.splice(deletedPin, 1);
						PinList = PinList;
					}
					break;
				case MessageTypes.PinUpdated:
					{
						let info: MessageFormats.UpdatePinData = data;
						let ChangedPin = PinList.findIndex((item) => item.ID == info.PinData.ID);

						if (ChangedPin == -1) {
							return;
						}

						PinList[ChangedPin] = data.PinData;
						PinList = PinList;
					}
					break;
				case MessageTypes.MapUpdate:
					{
						let info: MessageFormats.MapUpdated = data;
						MapURI = info.MapURI;

						MapLoaded();
					}
					break;
				default:
					console.warn('Unknown Message received', data);
					break;
			}
		};
	});

	let MapURI = '/map_32x32.png';
	let Map: HTMLImageElement;
	$: mapDimensions = MapURI?.split('_')[1]
		?.split('.')[0]
		?.split('x')
		?.map((item) => Number(item));

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

			let msg: MessageFormats.PinMoved = {
				MsgType: MessageTypes.PinMoved,
				PinData: item,
				Changer: playerName
			};

			ws.send(JSON.stringify(msg));
		});
	}

	function AddPin() {
		if (DMTools) {
			PinList.push(PinFactory('DM', 300, 300, DefaultPinHue));
		} else {
			PinList.push(PinFactory(playerName, 300, 300, DefaultPinHue));
		}
		PinList = PinList;
		DumpMovedPins();
	}

	function updateGlobal() {
		Global.set({ DevTools, DMTools });
	}

	function DeletePin(PinID: number) {
		let index = PinList.findIndex((item) => item.ID == PinID);

		PinList.splice(index, 1);
		PinList = PinList;

		const msg: MessageFormats.PinDeleted = {
			MsgType: MessageTypes.PinDeleted,
			PinID: PinID
		};

		ws.send(JSON.stringify(msg));
	}

	function UpdateMap() {
		let msg: MessageFormats.MapUpdated = {
			MapURI,
			MsgType: MessageTypes.MapUpdate
		};

		ws.send(JSON.stringify(msg));
	}

	function UpdatePin(PinData: PinData) {
		let msg: MessageFormats.UpdatePinData = {
			MsgType: MessageTypes.PinUpdated,
			PinData
		};

		ws.send(JSON.stringify(msg));
	}
</script>

<main>
	<div class="Content">
		<img
			draggable="false"
			class="MapImage"
			src={MapURI}
			alt="Invalid Map Value"
			bind:this={Map}
			on:load={MapLoaded}
		/>

		{#each PinList as PinData}
			<Pin
				bind:trueLeft={PinData.width}
				bind:trueTop={PinData.height}
				bind:Modified={PinData.Modified}
				bind:name={PinData.Name}
				bind:hue={PinData.HueShift}
				width={pinWidth}
				height={pinHeight}
			/>
		{/each}
	</div>

	<div class="ToolBar">
		<button
			on:click={() => {
				ShowToolbar = !ShowToolbar;
			}}>{ShowToolbar ? 'Hide' : 'Show'} Toolbar</button
		>
		{#if ShowToolbar}
			<button
				on:click={() => {
					DMTools = !DMTools;
				}}>Toggle DM Tools</button
			>

			{#if DMTools}
				<button on:click={AddPin}>Add Pin</button>
				<input type="text" bind:value={MapURI} />
				<button on:click={UpdateMap}>Update Map for all</button>
				<button
					on:click={() => {
						DevTools = !DevTools;
					}}>Toggle Dev Tools</button
				>
				<p>You are player {playerID}</p>

				{#if PinList.length > 0}
					Pin Management
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>ID</th>
								<th>XPos</th>
								<th>YPos</th>
								<th>Hue</th>
								<th>Kill</th>
							</tr>
						</thead>
						<tbody>
							{#each PinList as PinData}
								<tr>
									<td>
										<input
											type="text"
											name="PinName"
											bind:value={PinData.Name}
											on:blur={() => {
												UpdatePin(PinData);
											}}
										/>
									</td>
									<td>{PinData.ID}</td>
									<td>{PinData.width}</td>
									<td>{PinData.height}</td>
									<td
										><input
											class="HueShift"
											type="number"
											bind:value={PinData.HueShift}
											on:blur={() => {
												UpdatePin(PinData);
											}}
										/></td
									>
									<td
										><button
											on:click={() => {
												DeletePin(PinData.ID);
											}}>Kill</button
										></td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}

				{#if DevTools}
					<p>PinList</p>
					<pre>
					{JSON.stringify(PinList, null, 2)}
				</pre>
					<p>MapInfo</p>
					<pre>
					{JSON.stringify(mapDimensions, null, 2)}
					pinWidth: {pinWidth} pinHeight: {pinHeight}
				</pre>
				{/if}
			{:else}
				<input type="text" bind:value={playerName} placeholder="Please Enter Player Name" />
				<label for="DefaultPlayerHue">Hue</label>
				<input type="number" name="DefaultPlayerHue" bind:value={DefaultPinHue} />
				<button on:click={AddPin}>Add Pin</button>
			{/if}
		{/if}
	</div>
</main>

<style>
	button,
	input {
		padding: 0;
		height: 1.5em;
		margin: 0;
	}

	.ToolBar {
		position: absolute;
		top: 0.25em;
		left: 0.25em;
		background-color: var(--background-color);
		opacity: 0.4;
		transition: 400ms;
		border-radius: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.HueShift {
		width: 4ch;
	}

	/* Chrome, Safari, Edge, Opera */
	.HueShift::-webkit-outer-spin-button,
	.HueShift::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	.HueShift[type='number'] {
		-moz-appearance: textfield;
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
