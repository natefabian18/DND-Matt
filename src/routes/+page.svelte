<script lang="ts">
	import Pin from '../Lib/Pin.svelte';
	import type { PinData } from '../Lib/Pin';
	import AlertManager from '../Lib/AlertManager.svelte';
	import { Store } from '../Lib/StoreCollection';
	import * as MessageFormats from '../Lib/MessageTypes';
	import { Global } from '../Lib/globals';

	let DMTools = false;
	let DevTools = false;
	let pinWidth = 100;
	let pinHeight = 100;
	let ShowToolbar = true;
	let playerName = '';
	let globalPinCounter = 1;
	let PinList: Array<PinData> = [];
	let playerID = -1;
	let DefaultPinHue = 0;
	let MapURI = '';
	let Map: HTMLImageElement;
	let ws: WebSocket;

	//#region Subscribe events
	Store.Global.DMTools.subscribe((value) => {
		DMTools = value;
	});
	Store.Global.DevTools.subscribe((value) => {
		DevTools = value;
	});
	Store.Global.WebSocketConnection.subscribe((Connection) => {
		ws = Connection;
	});
	Store.Global.MapURI.subscribe((URI) => {
		MapURI = URI;
	});
	Store.Global.PinList.subscribe((List) => {
		PinList = List;
	});
	Store.Global.PinCounter.subscribe((Total) => {
		globalPinCounter = Total;
	});
	Store.playerIDStore.subscribe((ID) => {
		playerID = ID;
	});
	//#endregion

	//#region Dynamic Assignments
	$: PinList, DumpMovedPins();
	$: mapDimensions = MapURI?.split('_')[1]
		?.split('.')[0]
		?.split('x')
		?.map((item) => Number(item));
	$: MapURI, MapLoaded();
	//#endregion

	//#region State Functions
	function PinFactory(
		name: string = 'DefaultName',
		width: number,
		height: number,
		Hue: number,
		Owner: number = Number(playerID),
		ID = globalPinCounter++
	) {
		let pin: PinData = {
			OwnerID: Owner,
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

	function MapLoaded() {
		try {
			let MapWidth = Map.width;
			let MapHeight = Map.height;

			pinWidth = MapWidth / mapDimensions[0];
			pinHeight = MapHeight / mapDimensions[1];
		} catch (e) {
			setTimeout(MapLoaded, 500);
		}
	}

	function DumpMovedPins() {
		let ModifiedPins = PinList.filter((item) => item.Modified);

		ModifiedPins.forEach((item) => {
			item.Modified = false;

			let msg: MessageFormats.PinMoved = {
				MsgType: MessageFormats.MessageTypes.PinMoved,
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

		Global.PinCounter.set(
			PinList.reduce((previous, PinData) => {
				if (PinData.ID > previous) {
					return PinData.ID;
				} else {
					return previous;
				}
			}, -1) + 1
		);

		PinList = PinList;
		DumpMovedPins();
	}

	function DeletePin(PinID: number) {
		let index = PinList.findIndex((item) => item.ID == PinID);

		PinList.splice(index, 1);
		PinList = PinList;

		const msg: MessageFormats.PinDeleted = {
			MsgType: MessageFormats.MessageTypes.PinDeleted,
			PinID: PinID
		};

		ws.send(JSON.stringify(msg));
	}

	function UpdateMap() {
		let msg: MessageFormats.MapUpdated = {
			MapURI,
			MsgType: MessageFormats.MessageTypes.MapUpdate
		};

		ws.send(JSON.stringify(msg));
	}

	function UpdatePin(PinData: PinData) {
		let msg: MessageFormats.UpdatePinData = {
			MsgType: MessageFormats.MessageTypes.PinUpdated,
			PinData
		};

		ws.send(JSON.stringify(msg));
	}

	function DEBUGPing() {
		Store.Alert.set({
			Color: 'green',
			TextColor: 'white',
			duration: 1000,
			Message: 'PING!',
			BroadCast: true
		});
	}
	//#endregion
</script>

<main>
	<div class="Content">
		<img
			draggable="false"
			class="MapImage"
			src={'/Maps' + MapURI}
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
				bind:PinOwner={PinData.OwnerID}
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
					Global.DMTools.set(!DMTools);
				}}>Toggle DM Tools</button
			>
			<p>You are player {playerID}</p>

			{#if DMTools}
				<button on:click={AddPin}>Add Pin</button>
				<input type="text" bind:value={MapURI} />
				<button on:click={UpdateMap}>Update Map for all</button>
				<button
					on:click={() => {
						Global.DevTools.set(!DevTools);
					}}>Toggle Dev Tools</button
				>

				{#if PinList.length > 0}
					Pin Management
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Player Owner</th>
								<th>Pin ID</th>
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
									<td>
										<input
											type="number"
											name="PinOwner"
											class="PinOwner"
											bind:value={PinData.OwnerID}
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
					<button on:click={DEBUGPing}>Ping!</button>
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
		padding: 0.5em;
	}

	.PinOwner,
	.HueShift {
		width: 4ch;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	/* Chrome, Safari, Edge, Opera */
	.PinOwner,
	.HueShift::-webkit-outer-spin-button,
	.PinOwner,
	.HueShift::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
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
